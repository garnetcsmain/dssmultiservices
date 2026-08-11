import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LocalStore } from '../src/storage/local.js';

/**
 * The archive sidecar is the only thing that outlives the webhook.
 *
 * A recording picked up by the backlog sweep - after a crash, a restart, or a
 * transcription that failed hours earlier - has nothing but its own filename
 * and this metadata. When the sweep skipped it, transcripts came back with an
 * empty callSid and a duration of zero, and the summariser dutifully reported
 * that the call lasted 0 seconds and the caller could not be identified.
 */

async function withStore(fn: (store: LocalStore, root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(path.join(tmpdir(), 'dss-store-'));
  try {
    await fn(new LocalStore(root), root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('what was written at archive time reads back', async () => {
  await withStore(async (store) => {
    await store.put('recordings/2026/08/10/RE1.wav', Buffer.from('audio'), {
      recordingSid: 'RE1',
      callSid: 'CA1',
      durationSeconds: '12',
      from: '+15145550100',
      to: '+14502358434',
      direction: 'voicemail',
    });

    const meta = await store.metadata('recordings/2026/08/10/RE1.wav');
    assert.equal(meta?.callSid, 'CA1');
    assert.equal(meta?.durationSeconds, '12');
    assert.equal(meta?.from, '+15145550100');
    assert.equal(meta?.direction, 'voicemail');
  });
});

test('numbers come back as strings, whichever driver answered', async () => {
  // put() adds `bytes` as a number. GCS object metadata is string-only, so a
  // caller that got a number from one driver and a string from the other would
  // work in tests and fail in production.
  await withStore(async (store) => {
    await store.put('a.wav', Buffer.from('audio'), { recordingSid: 'RE1' });
    const meta = await store.metadata('a.wav');
    assert.equal(meta?.bytes, '5');
  });
});

test('a missing sidecar is absence, not an error', async () => {
  // Recordings archived before the sidecar carried these fields still have to
  // sweep. Throwing here would strand exactly the backlog this exists to drain.
  await withStore(async (store) => {
    assert.equal(await store.metadata('recordings/2026/08/10/nope.wav'), null);
  });
});

test('an unreadable sidecar is absence too', async () => {
  await withStore(async (store, root) => {
    await store.put('b.wav', Buffer.from('audio'), { recordingSid: 'RE1' });
    await writeFile(path.join(root, 'b.wav.meta.json'), '{ truncated');
    assert.equal(await store.metadata('b.wav'), null);
  });
});

test('metadata cannot be read from outside the storage root', async () => {
  await withStore(async (store) => {
    await assert.rejects(() => store.metadata('../../etc/passwd'), /escapes storage root/);
  });
});
