import { Router, json } from 'express';
import { config } from '../config.js';
import { verifyVonageSignature, parseInbound, sendWhatsApp, type InboundWhatsApp } from '../vonage.js';
import { dispatchToHermes, claimMessage } from '../hermes.js';

/**
 * Runs the agent and returns its answer to the contact.
 *
 * Detached from the request, so every failure has to be handled here - there
 * is no caller left to catch anything. A customer who gets no reply is bad;
 * a crashed process is worse.
 */
async function handleWithHermes(message: InboundWhatsApp): Promise<void> {
  try {
    const outcome = await dispatchToHermes(message);

    if (outcome.status === 'skipped') {
      console.log('[whatsapp] no reply sent', {
        uuid: message.messageUuid,
        from: message.from,
        reason: outcome.reason,
      });
      return;
    }

    const uuid = await sendWhatsApp({ to: message.from, text: outcome.text });
    console.log('[whatsapp] replied', { to: message.from, uuid, chars: outcome.text.length });
  } catch (err) {
    console.error('[whatsapp] hermes bridge failed', {
      uuid: message.messageUuid,
      from: message.from,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Vonage WhatsApp webhooks.
 *
 * Vonage posts JSON here, unlike Twilio's form encoding, and signature
 * verification needs the exact bytes received - so the raw body is captured
 * during parse rather than re-serialized afterwards. Re-serializing would
 * change key order or whitespace and break the hash comparison.
 */
export function createWhatsAppRoutes(): Router {
  const router = Router();

  const parseJson = json({
    verify: (req, _res, buf) => {
      (req as { rawBody?: Buffer }).rawBody = buf;
    },
  });

  const requireSignature = (
    req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction,
  ): void => {
    if (config.vonage.skipSignatureValidation) return next();
    const raw = (req as { rawBody?: Buffer }).rawBody ?? Buffer.alloc(0);
    if (!verifyVonageSignature(req.header('Authorization'), raw)) {
      console.warn('[vonage] rejected unsigned webhook', { path: req.originalUrl });
      res.status(403).type('text/plain').send('Invalid signature');
      return;
    }
    next();
  };

  /**
   * Inbound WhatsApp message.
   *
   * Answers 200 quickly regardless of what downstream handling does. Vonage
   * retries on non-2xx, and a slow or throwing handler here turns one customer
   * message into a retry storm - the message is already durable in our log by
   * the time we ack.
   */
  router.post('/webhooks/vonage/inbound', parseJson, requireSignature, (req, res) => {
    const message = parseInbound(req.body ?? {});

    if (!message) {
      // Non-text (image, audio, location) or non-WhatsApp. Ack so Vonage stops
      // retrying, and log enough to know what we are dropping.
      console.log('[whatsapp] unhandled inbound', {
        channel: req.body?.channel,
        messageType: req.body?.message_type,
      });
      res.status(200).end();
      return;
    }

    console.log('[whatsapp] inbound', {
      from: message.from,
      to: message.to,
      uuid: message.messageUuid,
      chars: message.text.length,
    });

    // Ack before involving Hermes. An agent run takes far longer than Vonage
    // is willing to wait, and a slow ack turns into retries.
    res.status(200).end();

    if (!claimMessage(message.messageUuid)) {
      console.log('[whatsapp] duplicate delivery ignored', { uuid: message.messageUuid });
      return;
    }
    void handleWithHermes(message);
  });

  /** Delivery receipts. Ack unconditionally; these are informational. */
  router.post('/webhooks/vonage/status', parseJson, requireSignature, (req, res) => {
    console.log('[whatsapp] status', {
      uuid: req.body?.message_uuid,
      status: req.body?.status,
      error: req.body?.error?.reason,
    });
    res.status(200).end();
  });

  /**
   * Manual send, for the first end-to-end test. Guarded by a shared secret
   * because it can originate WhatsApp traffic that costs money.
   */
  router.post('/admin/whatsapp/send', parseJson, async (req, res) => {
    const token = req.header('X-Admin-Token');
    if (!config.adminToken || token !== config.adminToken) {
      res.status(403).type('text/plain').send('Forbidden');
      return;
    }

    const { to, text } = (req.body ?? {}) as { to?: string; text?: string };
    if (!to || !text) {
      res.status(400).json({ error: 'to and text are required' });
      return;
    }

    try {
      const uuid = await sendWhatsApp({ to, text });
      console.log('[whatsapp] sent', { to, uuid });
      res.json({ ok: true, messageUuid: uuid });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error('[whatsapp] send failed', { to, error });
      res.status(502).json({ ok: false, error });
    }
  });

  return router;
}
