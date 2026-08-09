import { createHmac, createHash, timingSafeEqual, createSign, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { config } from './config.js';

/**
 * Vonage Messages API client.
 *
 * Sending authenticates with an application JWT (RS256). Basic auth is only
 * good enough for the sandbox: once the number is linked to an application,
 * production answers Basic with a flat 401 and no hint as to why.
 *
 * Payload shapes below are taken from Vonage's published WhatsApp snippets,
 * not inferred. Where a field is documented for one message type but only
 * implied for others - `context` is the case that matters - the code says so
 * and degrades instead of assuming.
 */

/** Message kinds we can send. Each maps to one documented Vonage message_type. */
export type OutboundWhatsApp =
  | { kind: 'text'; to: string; text: string; replyTo?: string }
  | { kind: 'image'; to: string; url: string; caption?: string; replyTo?: string }
  | { kind: 'video'; to: string; url: string; caption?: string; replyTo?: string }
  | { kind: 'audio'; to: string; url: string; replyTo?: string }
  | { kind: 'file'; to: string; url: string; caption?: string; name?: string; replyTo?: string }
  | { kind: 'sticker'; to: string; url: string }
  | { kind: 'reaction'; to: string; emoji: string; messageUuid: string }
  | { kind: 'unreaction'; to: string; messageUuid: string };

export type InboundKind =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'file'
  | 'sticker'
  | 'location'
  | 'reaction'
  | 'unsupported';

export interface InboundMedia {
  url: string;
  caption?: string;
  name?: string;
}

export interface InboundWhatsApp {
  messageUuid: string;
  from: string;
  to: string;
  timestamp: string;
  kind: InboundKind;
  /** Text body, or the caption of a media message. Empty when neither exists. */
  text: string;
  media?: InboundMedia;
  /** Present when the customer replied to a specific earlier message. */
  contextUuid?: string;
  reaction?: { action: string; emoji?: string };
  location?: { lat: number; long: number; name?: string; address?: string };
  /** Original message_type, kept for logging when we could not classify it. */
  rawType: string;
}

let cachedKey: Buffer | null = null;

async function loadPrivateKey(): Promise<Buffer | null> {
  if (cachedKey) return cachedKey;
  if (!config.vonage.applicationId) return null;

  if (config.vonage.privateKey) {
    cachedKey = Buffer.from(config.vonage.privateKey, 'utf8');
    return cachedKey;
  }

  if (!config.vonage.privateKeyPath) return null;
  try {
    cachedKey = await readFile(config.vonage.privateKeyPath);
    return cachedKey;
  } catch (err) {
    console.error('[vonage] private key unreadable, falling back to Basic auth', {
      path: config.vonage.privateKeyPath,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Auth for the Messages API.
 *
 * Basic auth is enough for the sandbox, but production rejects it with a 401
 * once the number is linked to an application - that path requires a JWT
 * signed with the application's private key. Basic remains as the fallback so
 * sandbox testing still works without a key on disk.
 */
async function authHeader(): Promise<string> {
  const key = await loadPrivateKey();
  if (key) {
    const now = Math.floor(Date.now() / 1000);
    const encode = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const header = encode({ alg: 'RS256', typ: 'JWT' });
    const claims = encode({
      application_id: config.vonage.applicationId,
      iat: now,
      exp: now + 300,
      jti: randomUUID(),
    });
    const signature = createSign('RSA-SHA256')
      .update(`${header}.${claims}`)
      .sign(key)
      .toString('base64url');
    return `Bearer ${header}.${claims}.${signature}`;
  }

  const raw = `${config.vonage.apiKey}:${config.vonage.apiSecret}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

/** Builds the channel-specific half of a send payload. */
function messageBody(message: OutboundWhatsApp): Record<string, unknown> {
  switch (message.kind) {
    case 'text':
      return { message_type: 'text', text: message.text };

    case 'image':
      return {
        message_type: 'image',
        image: { url: message.url, ...(message.caption ? { caption: message.caption } : {}) },
      };

    case 'video':
      return {
        message_type: 'video',
        video: { url: message.url, ...(message.caption ? { caption: message.caption } : {}) },
      };

    // No caption field: WhatsApp renders audio as a player, with nowhere to
    // put one. Send a separate text message if something needs saying.
    case 'audio':
      return { message_type: 'audio', audio: { url: message.url } };

    case 'file':
      return {
        message_type: 'file',
        file: {
          url: message.url,
          ...(message.caption ? { caption: message.caption } : {}),
          ...(message.name ? { name: message.name } : {}),
        },
      };

    // Stickers must be .webp. WhatsApp rejects anything else outright rather
    // than converting, so the check is worth making before we spend a request.
    case 'sticker':
      return { message_type: 'sticker', sticker: { url: message.url } };

    case 'reaction':
      return {
        message_type: 'reaction',
        reaction: { action: 'react', emoji: message.emoji },
        context: { message_uuid: message.messageUuid },
      };

    case 'unreaction':
      return {
        message_type: 'reaction',
        reaction: { action: 'unreact' },
        context: { message_uuid: message.messageUuid },
      };
  }
}

async function postMessage(payload: Record<string, unknown>): Promise<Response> {
  return fetch(`${config.vonage.messagesBaseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      Authorization: await authHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function sendWhatsApp(message: OutboundWhatsApp): Promise<string> {
  if (message.kind === 'sticker' && !/\.webp(\?|$)/i.test(message.url)) {
    throw new Error(`WhatsApp stickers must be .webp, got: ${message.url}`);
  }

  const base = {
    channel: 'whatsapp',
    from: config.vonage.whatsappNumber,
    to: normalizeMsisdn(message.to),
    ...messageBody(message),
  };

  // Quoting an earlier message. Vonage documents `context` explicitly for
  // reactions; for ordinary messages it is consistent with the API but not
  // spelled out, so a rejection is treated as "this account cannot quote"
  // rather than as a failed send. Losing the quote is survivable; dropping
  // the customer's answer is not.
  const replyTo = 'replyTo' in message ? message.replyTo : undefined;
  const payload = replyTo ? { ...base, context: { message_uuid: replyTo } } : base;

  let response = await postMessage(payload);

  if (!response.ok && replyTo && response.status >= 400 && response.status < 500) {
    console.warn('[vonage] quoted reply rejected, resending without context', {
      status: response.status,
      replyTo,
    });
    response = await postMessage(base);
  }

  const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      `Vonage send failed (${response.status}): ${result.title ?? ''} ${result.detail ?? ''}`.trim(),
    );
  }
  return String(result.message_uuid ?? '');
}

/**
 * Marks an inbound message read, and optionally shows the typing bubble.
 *
 * PATCH /v1/messages/{uuid}, per the Messages API reference. Best-effort by
 * design: this is feedback, and a customer would rather have a late answer
 * than no answer because a read receipt failed.
 */
export async function acknowledgeMessage(
  messageUuid: string,
  options: { typing?: boolean } = {},
): Promise<void> {
  if (!messageUuid) return;
  if (!config.vonage.markRead && !options.typing) return;

  const body: Record<string, unknown> = { status: 'read' };
  if (options.typing && config.vonage.typingIndicator) {
    body.replying_indicator = { show: true, type: 'text' };
  }

  try {
    const response = await fetch(
      `${config.vonage.messagesBaseUrl}/v1/messages/${encodeURIComponent(messageUuid)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: await authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      console.warn('[vonage] acknowledge failed', {
        messageUuid,
        status: response.status,
        detail: (await response.text()).slice(0, 160),
      });
    }
  } catch (err) {
    console.warn('[vonage] acknowledge error', {
      messageUuid,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Fetches inbound media.
 *
 * These URLs are on Vonage's API host and need the same application JWT as a
 * send - an unauthenticated GET returns 401. They also expire, which is the
 * real reason this runs promptly rather than on a queue.
 */
export async function downloadVonageMedia(
  url: string,
): Promise<{ body: Buffer; contentType: string }> {
  const response = await fetch(url, { headers: { Authorization: await authHeader() } });
  if (!response.ok) {
    throw new Error(`Vonage media fetch failed: ${response.status} ${response.statusText}`);
  }

  const declared = Number(response.headers.get('content-length') ?? 0);
  if (declared > config.vonage.maxInboundBytes) {
    throw new Error(`Inbound media too large: ${declared} bytes`);
  }

  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength === 0) throw new Error('Vonage returned an empty media body');
  if (body.byteLength > config.vonage.maxInboundBytes) {
    throw new Error(`Inbound media too large: ${body.byteLength} bytes`);
  }

  return {
    body,
    contentType: response.headers.get('content-type')?.split(';')[0]?.trim() ?? 'application/octet-stream',
  };
}

/**
 * Verifies a signed Vonage webhook.
 *
 * Vonage signs with an HS256 JWT in the Authorization header whose payload_hash
 * claim is the SHA-256 of the raw request body. Checking the JWT alone is not
 * enough - without comparing payload_hash against the body we actually received,
 * a valid token could be replayed against substituted content.
 *
 * Requires the raw bytes, so the route must capture them before JSON parsing.
 */
export function verifyVonageSignature(authHeader: string | undefined, rawBody: Buffer): boolean {
  if (!config.vonage.signatureSecret) return false;
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts as [string, string, string];

  const expected = createHmac('sha256', config.vonage.signatureSecret)
    .update(`${header}.${payload}`)
    .digest();
  const provided = Buffer.from(signature, 'base64url');
  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(provided, expected)) return false;

  let claims: { payload_hash?: string; exp?: number };
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return false;
  }

  if (typeof claims.exp === 'number' && claims.exp * 1000 < Date.now()) return false;

  const bodyHash = createHash('sha256').update(rawBody).digest('hex');
  if (!claims.payload_hash) return false;
  const a = Buffer.from(claims.payload_hash, 'utf8');
  const b = Buffer.from(bodyHash, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Vonage reports MSISDNs without a leading +; the rest of the app uses E.164. */
export function normalizeMsisdn(raw: string): string {
  return raw.trim().replace(/[^\d]/g, '');
}

export function toE164(msisdn: string): string {
  const digits = normalizeMsisdn(msisdn);
  return digits ? `+${digits}` : '';
}

/** Message types that carry a fetchable media url, and the field it sits in. */
const MEDIA_KINDS: Record<string, InboundKind> = {
  image: 'image',
  audio: 'audio',
  video: 'video',
  file: 'file',
  sticker: 'sticker',
};

export function parseInbound(body: Record<string, any>): InboundWhatsApp | null {
  if (body.channel !== 'whatsapp') return null;

  const rawType = String(body.message_type ?? '');
  const common = {
    messageUuid: String(body.message_uuid ?? ''),
    from: toE164(String(body.from ?? '')),
    to: toE164(String(body.to ?? '')),
    timestamp: String(body.timestamp ?? new Date().toISOString()),
    // Present when the customer used WhatsApp's reply-to on one of our
    // messages. Carrying it through is what lets the agent answer in-thread.
    contextUuid: body.context?.message_uuid
      ? String(body.context.message_uuid)
      : undefined,
    rawType,
  };

  if (rawType === 'text') {
    return { ...common, kind: 'text', text: String(body.text ?? '') };
  }

  const mediaKind = MEDIA_KINDS[rawType];
  if (mediaKind) {
    const payload = body[rawType] ?? {};
    const url = String(payload.url ?? '');
    if (!url) return { ...common, kind: 'unsupported', text: '' };
    return {
      ...common,
      kind: mediaKind,
      text: String(payload.caption ?? ''),
      media: {
        url,
        caption: payload.caption ? String(payload.caption) : undefined,
        name: payload.name ? String(payload.name) : undefined,
      },
    };
  }

  if (rawType === 'location') {
    const loc = body.location ?? {};
    return {
      ...common,
      kind: 'location',
      text: '',
      location: {
        lat: Number(loc.lat ?? 0),
        long: Number(loc.long ?? 0),
        name: loc.name ? String(loc.name) : undefined,
        address: loc.address ? String(loc.address) : undefined,
      },
    };
  }

  // The customer reacted to one of our messages. Worth surfacing - a thumbs-up
  // on a quote is an answer - but it is not a message to reply to.
  if (rawType === 'reaction') {
    const reaction = body.reaction ?? {};
    return {
      ...common,
      kind: 'reaction',
      text: '',
      reaction: {
        action: String(reaction.action ?? 'react'),
        emoji: reaction.emoji ? String(reaction.emoji) : undefined,
      },
    };
  }

  return { ...common, kind: 'unsupported', text: '' };
}
