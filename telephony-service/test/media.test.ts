import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveMediaPath, verifyMediaSignature, signMediaUrl, resolveOutboundMedia } from '../src/media.js';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config.js';

/**
 * /media is the only endpoint that answers unauthenticated requests from the
 * open internet, on a host that also stores customer call recordings. These
 * are the tests that matter most in this repo.
 */

test('paths cannot escape MEDIA_ROOT', () => {
  assert.equal(resolveMediaPath('../.env'), null);
  assert.equal(resolveMediaPath('../../etc/passwd'), null);
  assert.equal(resolveMediaPath('/etc/passwd'), null);
  assert.equal(resolveMediaPath('a/../../../secret'), null);
  assert.equal(resolveMediaPath('with\0null'), null);
});

test('a sibling directory sharing the root prefix is not inside it', () => {
  // "./media-secrets" starts with "./media" as a string but is a different
  // directory. A naive startsWith check passes this; the separator check does not.
  assert.equal(resolveMediaPath('../media-secrets/x.jpg'), null);
});

test('ordinary names resolve', () => {
  assert.ok(resolveMediaPath('logo.webp'));
  assert.ok(resolveMediaPath('brochures/2026.pdf'));
});

test('a signed url verifies, and a tampered one does not', async () => {
  // Config is read once at import, so the file has to go where it already
  // points rather than into a fresh temp dir.
  const dir = path.resolve(config.media.root);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'ok.png'), Buffer.from([0x89, 0x50]));

  const { url } = await signMediaUrl('ok.png');
  const parsed = new URL(url);
  const exp = parsed.searchParams.get('exp')!;
  const sig = parsed.searchParams.get('sig')!;

  assert.ok(verifyMediaSignature(parsed.pathname, exp, sig));
  // A different path with the same signature must not verify, or one valid
  // link becomes a key to the whole directory.
  assert.equal(verifyMediaSignature('/media/other.png', exp, sig), false);
  // Nor may the expiry be extended without resigning.
  assert.equal(verifyMediaSignature(parsed.pathname, String(Number(exp) + 3600), sig), false);
});

test('expired links are refused', () => {
  assert.equal(verifyMediaSignature('/media/x.png', '1', 'whatever'), false);
});

test('plaintext http media is refused rather than downgraded', async () => {
  await assert.rejects(
    () => resolveOutboundMedia('http://example.com/x.jpg'),
    /plaintext http/,
  );
});

test('public https urls pass through without re-hosting', async () => {
  const url = 'https://example.com/x.jpg';
  assert.equal(await resolveOutboundMedia(url), url);
});
