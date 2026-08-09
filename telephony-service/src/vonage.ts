import { createHmac, createHash, timingSafeEqual, createSign, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { config } from './config.js';

/**
 * Vonage Messages API client.
 *
 * Sending authenticates with an application JWT (RS256). Basic auth is only
 * good enough for the sandbox: once the number is linked to an application,
 * production answers Basic with a flat 401 and no hint as to why.
 */

export interface OutboundWhatsApp {
  to: string;
  text: string;
}

export interface InboundWhatsApp {
  messageUuid: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
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

export async function sendWhatsApp(message: OutboundWhatsApp): Promise<string> {
  const response = await fetch(`${config.vonage.messagesBaseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      Authorization: await authHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      message_type: 'text',
      channel: 'whatsapp',
      from: config.vonage.whatsappNumber,
      to: normalizeMsisdn(message.to),
      text: message.text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      `Vonage send failed (${response.status}): ${payload.title ?? ''} ${payload.detail ?? ''}`.trim(),
    );
  }
  return String(payload.message_uuid ?? '');
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

export function parseInbound(body: Record<string, any>): InboundWhatsApp | null {
  if (body.channel !== 'whatsapp') return null;
  if (body.message_type !== 'text') return null;
  return {
    messageUuid: String(body.message_uuid ?? ''),
    from: toE164(String(body.from ?? '')),
    to: toE164(String(body.to ?? '')),
    text: String(body.text ?? ''),
    timestamp: String(body.timestamp ?? new Date().toISOString()),
  };
}
