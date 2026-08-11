import twilio from 'twilio';
import type { RequestHandler } from 'express';
import { config } from './config.js';

export const twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);

/**
 * Rejects webhook posts that Twilio did not sign.
 *
 * This is load-bearing, not hygiene: the recording callback deletes the
 * Twilio-side copy of a call. Without signature validation, anyone who can
 * reach this endpoint can post a forged `completed` event for a known
 * RecordingSid and destroy the recording before we ever archive it.
 *
 * The signature covers the exact URL Twilio called, so PUBLIC_BASE_URL must
 * match your Twilio console config including scheme and any path prefix a
 * proxy adds.
 */
export function validateTwilioSignature(): RequestHandler {
  return (req, res, next) => {
    if (config.twilio.skipSignatureValidation) return next();

    const signature = req.header('X-Twilio-Signature');
    if (!signature) {
      res.status(403).type('text/plain').send('Missing X-Twilio-Signature');
      return;
    }

    const url = `${config.publicBaseUrl}${req.originalUrl}`;
    const valid = twilio.validateRequest(
      config.twilio.authToken,
      signature,
      url,
      (req.body ?? {}) as Record<string, string>,
    );

    if (!valid) {
      console.warn('[twilio] rejected unsigned request', { url });
      res.status(403).type('text/plain').send('Invalid signature');
      return;
    }
    next();
  };
}

/** Fetches recording media. Twilio serves PCM WAV when the URL ends in .wav. */
export async function downloadRecording(mediaUrl: string): Promise<Buffer> {
  const url = mediaUrl.endsWith('.wav') ? mediaUrl : `${mediaUrl}.wav`;
  const auth = Buffer.from(
    `${config.twilio.accountSid}:${config.twilio.authToken}`,
  ).toString('base64');

  const response = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!response.ok) {
    throw new Error(`Twilio media fetch failed: ${response.status} ${response.statusText}`);
  }

  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength === 0) throw new Error('Twilio returned an empty recording body');

  // If Twilio told us a length, hold it to that. A truncated transfer that we
  // then archive and confirm would delete a good recording and keep a broken one.
  const declared = response.headers.get('content-length');
  if (declared && Number(declared) !== body.byteLength) {
    throw new Error(
      `Truncated download: expected ${declared} bytes, received ${body.byteLength}`,
    );
  }

  return body;
}

export async function deleteTwilioRecording(recordingSid: string): Promise<void> {
  await twilioClient.recordings(recordingSid).remove();
}

/**
 * Notifies an employee by SMS.
 *
 * SMS rather than WhatsApp on purpose: a business-initiated WhatsApp message
 * outside the 24-hour customer window needs an approved template, and nobody
 * has one. SMS costs about a cent and just works.
 */
export async function sendSms(
  to: string,
  body: string,
  from = config.voice.smsFrom,
  statusCallback?: string,
): Promise<string> {
  const message = await twilioClient.messages.create({
    to,
    from,
    body,
    ...(statusCallback ? { statusCallback } : {}),
  });
  return message.sid;
}

/**
 * Sends media.
 *
 * `mediaUrl` takes Twilio's own inbound URLs directly rather than downloading
 * and re-hosting them: they are fetchable without our credentials, so relaying
 * a customer's photo to an employee costs one API call and no bandwidth.
 *
 * The body is optional on MMS, but sending one is what carries "who is this
 * from" alongside the picture.
 */
export async function sendMms(
  to: string,
  from: string,
  body: string,
  mediaUrl: string[],
  statusCallback?: string,
): Promise<string> {
  const message = await twilioClient.messages.create({
    to,
    from,
    ...(body.trim() ? { body } : {}),
    mediaUrl,
    ...(statusCallback ? { statusCallback } : {}),
  });
  return message.sid;
}
