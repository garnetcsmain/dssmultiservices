import { Router } from 'express';
import { config } from '../config.js';
import { validateTwilioSignature, sendSms, sendMms } from '../twilio.js';
import { lookupByNumber, smsRecipients, smsMode } from '../directory.js';
import { rememberThread, recallThread, type RecordingStore } from '../threads.js';

/**
 * SMS and MMS forwarding, in one or two directions depending on the line.
 *
 * A **relay** line works like a phone number: a customer texts the business
 * line, the employee answers from their own phone, and the customer sees the
 * business number throughout. Neither side learns the other's real number.
 *
 * The hard part there is the return path. A reply arrives from the employee's
 * mobile addressed to the DSS number, and nothing in it says who it answers -
 * so the last customer to text that line is remembered, and the reply goes
 * there. Same convention as a shared inbox, same failure: two customers within
 * moments of each other and the second owns the thread. Every forwarded
 * message carries the sender's number, which is what makes that recoverable.
 *
 * A **notify** line only fans inbound out. The main line is one of these: the
 * traffic is verification codes and alerts, two people want to see them, and
 * nobody conducts a conversation there. Relaying a staff message on such a
 * line would send something internal to whichever customer wrote in last, so
 * it is dropped and logged instead. That is why 'notify' is the default -
 * forwarding too little is a nuisance, forwarding too much is a disclosure.
 *
 * Message bodies are deliberately never logged. They are customer content -
 * and on the main line they are verification codes - so a log line is the
 * easiest place for them to leak.
 */
export function createSmsRoutes(store: RecordingStore): Router {
  const router = Router();

  router.post('/webhooks/twilio/sms', validateTwilioSignature(), async (req, res) => {
    const body = req.body as Record<string, string>;
    const from = body.From ?? '';
    const dssNumber = body.To ?? '';
    const text = body.Body ?? '';

    // Twilio wants TwiML or an empty 200. Answering immediately keeps a slow
    // relay from turning into a retried inbound message.
    res.type('text/xml').send('<Response/>');

    const entry = lookupByNumber(dssNumber);
    const recipients = entry ? smsRecipients(entry) : [];
    if (recipients.length === 0) {
      console.warn('[sms] no routing for this number', { dssNumber });
      return;
    }

    const media = collectMedia(body);
    const replier = matchRecipient(from, recipients);
    const mode = smsMode(entry!);

    try {
      if (replier && mode === 'notify') {
        // A one-way line. Staff do not hold conversations here, so relaying
        // this would send an internal message to whichever customer wrote in
        // last - and neither of them would ever know.
        console.log('[sms] ignoring staff message on a notify-only line', {
          dssNumber,
          from: replier,
        });
      } else if (replier) {
        await handleStaffReply(store, dssNumber, replier, text, media);
      } else {
        await forwardToStaff(store, dssNumber, recipients, from, text, media, mode);
      }
    } catch (err) {
      console.error('[sms] relay failed', {
        dssNumber,
        direction: replier ? 'outbound' : 'inbound',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  /** Delivery receipts for anything we send. Informational; ack and move on. */
  router.post('/webhooks/twilio/sms-status', validateTwilioSignature(), (req, res) => {
    const body = req.body as Record<string, string>;
    if (body.MessageStatus === 'failed' || body.MessageStatus === 'undelivered') {
      console.error('[sms] delivery failed', {
        sid: body.MessageSid,
        to: body.To,
        status: body.MessageStatus,
        error: body.ErrorCode,
      });
    }
    res.type('text/xml').send('<Response/>');
  });

  return router;
}

/**
 * Decides whether a message came from staff or from a customer.
 *
 * Compared on digits alone because the same phone shows up as +15551234567,
 * 15551234567 and (555) 123-4567 depending on who typed it into what. Getting
 * this wrong in one direction relays a staff reply back to staff; in the other,
 * it forwards a customer's message to the customer.
 *
 * Returns the matching recipient, so the caller knows which of several people
 * on a shared line is answering.
 */
export function matchRecipient(from: string, recipients: string[]): string | null {
  const target = nanp(from);
  if (!target) return null;
  return recipients.find((recipient) => nanp(recipient) === target) ?? null;
}

/**
 * Reduces a North American number to its ten significant digits.
 *
 * Twilio always sends E.164, so the leading 1 is consistent on the wire - but
 * the directory is hand-edited, and an entry written as "5144637712" would
 * otherwise never match the "+15144637712" Twilio reports. The consequence of
 * that near-miss is not a failed lookup, it is a staff reply being treated as
 * a customer message and forwarded onward.
 *
 * Only strips the 1 at eleven digits, so it cannot mangle an international
 * number into a false match with a local one.
 */
function nanp(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/**
 * Twilio numbers the media fields rather than sending an array.
 *
 * The URLs it hands out are fetchable without our credentials, which is what
 * lets them be handed straight to an outbound MMS instead of being downloaded
 * and re-hosted. It also means they are effectively public while they exist -
 * worth knowing before one ends up somewhere durable.
 */
function collectMedia(body: Record<string, string>): string[] {
  const count = Number(body.NumMedia ?? 0);
  const urls: string[] = [];
  for (let i = 0; i < count; i++) {
    const url = body[`MediaUrl${i}`];
    if (url) urls.push(url);
  }
  return urls;
}

async function forwardToStaff(
  store: RecordingStore,
  dssNumber: string,
  recipients: string[],
  customer: string,
  text: string,
  media: string[],
  mode: 'relay' | 'notify',
): Promise<void> {
  // Who it came from goes in the message, not just in our records: whoever
  // answers needs it, and it is the only repair when two conversations overlap
  // on one line.
  const parts = [`De ${customer}`, text].filter((part) => part.trim().length > 0);
  if (media.length > 0 && !text.trim()) parts.push(`(${media.length} fichier(s))`);
  const forwarded = parts.join('\n');

  // Only a two-way line needs to remember who it is talking to. On a notify
  // line nothing is ever sent back, so keeping customer numbers around would
  // be storing something we have no use for.
  if (mode === 'relay') {
    // Recorded before delivery: if one recipient's carrier is slow, a reply
    // from a faster one must still find the customer.
    await rememberThread(store, dssNumber, customer);
  }

  // Sequential and individually guarded: one unreachable phone must not stop
  // the message reaching the others.
  let delivered = 0;
  for (const recipient of recipients) {
    try {
      await deliver(recipient, dssNumber, forwarded, media);
      delivered += 1;
    } catch (err) {
      console.error('[sms] could not reach one recipient', {
        recipient,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log('[sms] forwarded to staff', {
    dssNumber,
    from: customer,
    chars: text.length,
    media: media.length,
    delivered: `${delivered}/${recipients.length}`,
  });
}

async function handleStaffReply(
  store: RecordingStore,
  dssNumber: string,
  replier: string,
  text: string,
  media: string[],
): Promise<void> {
  const customer = await recallThread(store, dssNumber);

  if (!customer) {
    // Telling them beats silently dropping it: they believe they answered a
    // customer, and nobody received anything.
    await deliver(
      replier,
      dssNumber,
      "Aucune conversation en cours sur cette ligne. Votre message n'a pas ete envoye.",
      [],
    );
    console.warn('[sms] reply with no open thread', { dssNumber, replier });
    return;
  }

  const sid = await deliver(customer, dssNumber, text, media);
  console.log('[sms] staff reply delivered', {
    dssNumber,
    from: replier,
    to: customer,
    chars: text.length,
    media: media.length,
    sid,
  });
}

/** Sends as MMS when there is media, plain SMS otherwise. */
function deliver(to: string, from: string, text: string, media: string[]): Promise<string> {
  return media.length > 0
    ? sendMms(to, from, text, media, statusCallback())
    : sendSms(to, text, from, statusCallback());
}

function statusCallback(): string | undefined {
  return config.publicBaseUrl
    ? `${config.publicBaseUrl}/webhooks/twilio/sms-status`
    : undefined;
}
