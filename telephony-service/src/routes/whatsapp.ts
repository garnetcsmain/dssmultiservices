import { Router, json } from 'express';
import { config } from '../config.js';
import {
  verifyVonageSignature,
  parseInbound,
  sendWhatsApp,
  acknowledgeMessage,
  type InboundWhatsApp,
  type OutboundWhatsApp,
} from '../vonage.js';
import { dispatchToHermes, claimMessage } from '../hermes.js';
import { archiveInboundMedia, describeForAgent } from '../whatsapp-media.js';
import { resolveOutboundMedia } from '../media.js';
import type { Action } from '../directives.js';
import type { RecordingStore } from '../storage/index.js';

/**
 * Turns one agent action into one Vonage send.
 *
 * Media references are resolved here rather than in the parser, because
 * resolution touches the filesystem and can fail - and a bad reference should
 * cost one message, not the whole reply.
 */
async function buildSend(
  action: Action,
  to: string,
  inboundUuid: string,
): Promise<OutboundWhatsApp | null> {
  const quoteOf = (quote: boolean) => (quote && inboundUuid ? inboundUuid : undefined);

  switch (action.type) {
    case 'text':
      return { kind: 'text', to, text: action.text, replyTo: quoteOf(action.quote) };

    case 'react':
      if (!inboundUuid) return null;
      return { kind: 'reaction', to, emoji: action.emoji, messageUuid: inboundUuid };

    case 'unreact':
      if (!inboundUuid) return null;
      return { kind: 'unreaction', to, messageUuid: inboundUuid };

    case 'image':
      return {
        kind: 'image',
        to,
        url: await resolveOutboundMedia(action.ref),
        caption: action.caption,
        replyTo: quoteOf(action.quote),
      };

    case 'video':
      return {
        kind: 'video',
        to,
        url: await resolveOutboundMedia(action.ref),
        caption: action.caption,
        replyTo: quoteOf(action.quote),
      };

    case 'audio':
      return {
        kind: 'audio',
        to,
        url: await resolveOutboundMedia(action.ref),
        replyTo: quoteOf(action.quote),
      };

    case 'file':
      return {
        kind: 'file',
        to,
        url: await resolveOutboundMedia(action.ref),
        name: action.name,
        replyTo: quoteOf(action.quote),
      };

    case 'sticker':
      return { kind: 'sticker', to, url: await resolveOutboundMedia(action.ref) };

    /**
     * Hand the customer a way to reach a person.
     *
     * WhatsApp voice calling is not available to us (see docs/ARCHITECTURE.md),
     * so "call us" means the PSTN line - which is the number this WhatsApp
     * account already runs on, and where the IVR answers.
     */
    case 'call': {
      const line = config.vonage.whatsappNumber
        ? `+${config.vonage.whatsappNumber.replace(/\D/g, '')}`
        : '';
      if (!line) return null;
      return {
        kind: 'text',
        to,
        text: `📞 ${line}`,
        replyTo: quoteOf(action.quote),
      };
    }
  }
}

/**
 * Runs the agent and delivers whatever it asked for.
 *
 * Detached from the request, so every failure has to be handled here - there
 * is no caller left to catch anything. A customer who gets no reply is bad;
 * a crashed process is worse.
 */
async function handleWithHermes(
  store: RecordingStore,
  message: InboundWhatsApp,
): Promise<void> {
  try {
    // Fetch attachments first. Vonage expires inbound media, so this cannot
    // wait behind an agent run that takes tens of seconds.
    const archived = message.media ? await archiveInboundMedia(store, message) : null;
    const rendered = describeForAgent(message, archived);

    // Blue ticks and the typing bubble, before the slow part. Without them the
    // customer stares at an unread message for the length of an agent run.
    void acknowledgeMessage(message.messageUuid, { typing: true });

    const outcome = await dispatchToHermes(message, rendered);

    if (outcome.status === 'skipped') {
      console.log('[whatsapp] no reply sent', {
        uuid: message.messageUuid,
        from: message.from,
        reason: outcome.reason,
      });
      return;
    }

    // Sequentially, not in parallel: WhatsApp shows messages in arrival order,
    // and a caption racing ahead of its photo reads as nonsense.
    for (const action of outcome.actions) {
      try {
        const send = await buildSend(action, message.from, message.messageUuid);
        if (!send) {
          console.warn('[whatsapp] action produced nothing sendable', { type: action.type });
          continue;
        }
        const uuid = await sendWhatsApp(send);
        console.log('[whatsapp] sent', { to: message.from, kind: send.kind, uuid });
      } catch (err) {
        // One bad attachment must not swallow the prose that came with it.
        console.error('[whatsapp] action failed', {
          type: action.type,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
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
export function createWhatsAppRoutes(store: RecordingStore): Router {
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
      // Not WhatsApp at all. Ack so Vonage stops retrying, and log enough to
      // know what arrived on a webhook we did not expect traffic on.
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
      kind: message.kind,
      hasMedia: Boolean(message.media),
      quoting: message.contextUuid,
    });

    // Ack before involving Hermes. An agent run takes far longer than Vonage
    // is willing to wait, and a slow ack turns into retries.
    res.status(200).end();

    if (!claimMessage(message.messageUuid)) {
      console.log('[whatsapp] duplicate delivery ignored', { uuid: message.messageUuid });
      return;
    }

    // A reaction is worth recording but is not a question. Answering one with
    // a full agent run means a thumbs-up costs a completion and earns the
    // customer an unsolicited reply.
    if (message.kind === 'reaction') {
      console.log('[whatsapp] reaction noted', {
        from: message.from,
        action: message.reaction?.action,
        emoji: message.reaction?.emoji,
      });
      return;
    }

    void handleWithHermes(store, message);
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
   * Manual send, for testing every message type end to end. Guarded by a
   * shared secret because it can originate WhatsApp traffic that costs money.
   *
   * Body mirrors the OutboundWhatsApp union: { kind, to, ... }. `text` alone
   * still works, so anything that called this before keeps working.
   */
  router.post('/admin/whatsapp/send', parseJson, async (req, res) => {
    const token = req.header('X-Admin-Token');
    if (!config.adminToken || token !== config.adminToken) {
      res.status(403).type('text/plain').send('Forbidden');
      return;
    }

    const body = (req.body ?? {}) as Record<string, string> & { kind?: string };
    if (!body.to) {
      res.status(400).json({ error: 'to is required' });
      return;
    }

    try {
      const kind = body.kind ?? 'text';
      // Media references go through the same resolver the agent path uses, so
      // a local filename here is signed rather than sent as a literal string.
      const url = body.url ? await resolveOutboundMedia(body.url) : '';
      const send = { ...body, kind, url } as unknown as OutboundWhatsApp;

      const uuid = await sendWhatsApp(send);
      console.log('[whatsapp] sent', { to: body.to, kind, uuid });
      res.json({ ok: true, messageUuid: uuid });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error('[whatsapp] send failed', { to: body.to, error });
      res.status(502).json({ ok: false, error });
    }
  });

  /**
   * Where WhatsApp calling would arrive if we had it.
   *
   * Meta opened the WhatsApp Business Calling API to businesses through their
   * BSPs, but Vonage publishes no calling endpoints, no webhook contract and
   * no snippets for it - see docs/ARCHITECTURE.md. Rather than write a handler
   * against a payload shape nobody has documented, this records what actually
   * shows up so the contract can be read off a real event if Vonage ever ships
   * one. Registered unconditionally: the whole point is to catch a surprise.
   */
  router.post('/webhooks/vonage/calls', parseJson, (req, res) => {
    console.warn('[whatsapp-calls] UNEXPECTED call event - capture this payload', {
      body: JSON.stringify(req.body ?? {}).slice(0, 2000),
    });
    res.status(200).end();
  });

  return router;
}
