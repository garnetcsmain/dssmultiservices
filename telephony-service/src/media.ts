import { createHmac, timingSafeEqual } from 'node:crypto';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { config, mediaHostingEnabled } from './config.js';

/**
 * Public, signed, expiring links for outbound WhatsApp attachments.
 *
 * WhatsApp does not accept uploaded bytes through Vonage's send call - it
 * fetches a URL. Anything we want to send therefore has to be reachable from
 * the public internet, and this service already is, through Tailscale Funnel.
 *
 * That makes the exposure the problem to solve rather than the reachability.
 * Three things keep it narrow:
 *
 *   - the signature covers the exact path AND its expiry, so a link cannot be
 *     edited into a different file or a longer life
 *   - paths resolve inside MEDIA_ROOT and nowhere else, which is a separate
 *     directory from the recordings archive
 *   - links expire, so one leaked URL is not permanent access
 *
 * The recordings archive is deliberately not servable from here. A signed link
 * to a customer call is one forwarded message away from being a disclosure.
 */

export interface SignedLink {
  url: string;
  expiresAt: Date;
}

function sign(path: string, expiry: number): string {
  return createHmac('sha256', config.media.signingSecret)
    .update(`${path}:${expiry}`)
    .digest('base64url');
}

/**
 * Resolves a caller-supplied name against MEDIA_ROOT, refusing anything that
 * escapes it.
 *
 * The check is on the resolved absolute path rather than on the input, because
 * filtering for ".." by hand misses encodings, symlinks and absolute paths.
 * Returns null rather than throwing: callers here are handling agent output
 * and untrusted request paths, where "no" is an answer and not an exception.
 */
export function resolveMediaPath(name: string): string | null {
  if (!name || name.includes('\0')) return null;

  const root = resolve(config.media.root);
  const target = resolve(root, name);

  // The separator suffix stops "/media-secrets" from passing a "/media" check.
  if (target !== root && !target.startsWith(root + sep)) {
    console.warn('[media] refused path outside MEDIA_ROOT', { name });
    return null;
  }
  return target;
}

/**
 * Mints a signed URL for a file inside MEDIA_ROOT.
 *
 * Throws rather than returning null: by the time we are minting a link the
 * decision to send has been made, and silently sending nothing would look to
 * the customer like the assistant ignoring them.
 */
export async function signMediaUrl(name: string): Promise<SignedLink> {
  if (!mediaHostingEnabled) {
    throw new Error('MEDIA_SIGNING_SECRET is unset - cannot serve local files');
  }

  const target = resolveMediaPath(name);
  if (!target) throw new Error(`Media path outside MEDIA_ROOT: ${name}`);

  const info = await stat(target).catch(() => null);
  if (!info?.isFile()) throw new Error(`No such media file: ${name}`);
  if (info.size > config.media.maxBytes) {
    throw new Error(`Media too large: ${info.size} bytes exceeds ${config.media.maxBytes}`);
  }

  const expiry = Math.floor(Date.now() / 1000) + config.media.ttlSeconds;
  const path = `/media/${encodeURI(name).replace(/^\/+/, '')}`;
  const url = `${config.publicBaseUrl}${path}?exp=${expiry}&sig=${sign(path, expiry)}`;
  return { url, expiresAt: new Date(expiry * 1000) };
}

export function verifyMediaSignature(path: string, exp: string, sig: string): boolean {
  if (!mediaHostingEnabled) return false;

  const expiry = Number(exp);
  if (!Number.isFinite(expiry) || expiry * 1000 < Date.now()) return false;

  const expected = Buffer.from(sign(path, expiry), 'utf8');
  const provided = Buffer.from(sig, 'utf8');
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

/**
 * Decides whether a value the agent produced is something we can send.
 *
 * Public https URLs pass through untouched - re-hosting someone else's CDN
 * would waste bandwidth and stale the content. Anything else is treated as a
 * name inside MEDIA_ROOT and signed.
 *
 * http:// is rejected outright. WhatsApp fetches these server-side and a
 * plaintext hop is an unnecessary place for customer-visible content to be
 * tampered with.
 */
export async function resolveOutboundMedia(reference: string): Promise<string> {
  const value = reference.trim();
  if (value.startsWith('https://')) return value;
  if (value.startsWith('http://')) {
    throw new Error(`Refusing to send media over plaintext http: ${value}`);
  }
  return (await signMediaUrl(value)).url;
}

/** Content types WhatsApp cares about, keyed by extension. */
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.3gp': 'video/3gpp',
  '.3gpp': 'video/3gpp',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.amr': 'audio/amr',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
};

export function contentTypeFor(name: string): string {
  return CONTENT_TYPES[extname(name).toLowerCase()] ?? 'application/octet-stream';
}

/** Best-guess extension for inbound media, used only for archive filenames. */
export function extensionFor(contentType: string): string {
  const match = Object.entries(CONTENT_TYPES).find(([, type]) => type === contentType);
  return match?.[0] ?? '.bin';
}
