import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config.js';
import { recordingKey, type RecordingStore } from '../storage/index.js';
import { downloadRecording, deleteTwilioRecording } from '../twilio.js';

export interface RecordingEvent {
  recordingSid: string;
  callSid: string;
  mediaUrl: string;
  durationSeconds: number;
  channels: number;
  employeeId?: string;
}

export type ArchiveOutcome =
  | { status: 'archived'; key: string; bytes: number; sha256: string }
  | { status: 'already-archived'; key: string }
  | { status: 'failed'; key: string; stage: string; error: string };

/**
 * Download -> store -> verify -> delete from Twilio.
 *
 * The ordering is the whole point. The brief called for deleting the Twilio
 * copy immediately after upload, but "after upload" is not the same as "after
 * the upload is known good": a bucket that accepts a write and loses it, a
 * truncated transfer, or a half-written local file would each turn into a
 * permanently destroyed customer call. So the Twilio delete is gated on a
 * read-back that matches the digest we computed before writing.
 *
 * If any stage fails we leave the Twilio copy alone and dead-letter the event.
 * Twilio keeps recordings until deleted, so a failure here costs storage
 * pennies; getting it wrong costs the recording.
 */
export async function archiveRecording(
  store: RecordingStore,
  event: RecordingEvent,
): Promise<ArchiveOutcome> {
  const key = recordingKey(event.recordingSid, new Date());
  let stage = 'init';

  try {
    // Twilio retries callbacks, and a retry after a successful run must not
    // re-download and re-upload. If we already hold it, just make sure the
    // Twilio-side delete happened and move on.
    stage = 'idempotency-check';
    const existing = await store.stat(key);
    if (existing && existing.bytes > 0) {
      await safeDeleteFromTwilio(event.recordingSid);
      return { status: 'already-archived', key };
    }

    stage = 'download';
    const body = await downloadRecording(event.mediaUrl);
    const sha256 = createHash('sha256').update(body).digest('hex');

    stage = 'store';
    await store.put(key, body, {
      recordingSid: event.recordingSid,
      callSid: event.callSid,
      durationSeconds: String(event.durationSeconds),
      channels: String(event.channels),
      employeeId: event.employeeId ?? '',
      archivedAt: new Date().toISOString(),
    });

    // Read back through the store's own API rather than trusting put() to have
    // thrown on failure. This is the gate on the destructive step below.
    stage = 'verify';
    const stored = await store.stat(key);
    if (!stored) {
      throw new Error('Post-write stat returned nothing - object is not there');
    }
    if (stored.bytes !== body.byteLength) {
      throw new Error(
        `Size mismatch: wrote ${body.byteLength} bytes, store reports ${stored.bytes}`,
      );
    }
    if (stored.sha256 && stored.sha256 !== sha256) {
      throw new Error(`Digest mismatch: expected ${sha256}, store reports ${stored.sha256}`);
    }

    // Verified. Now, and only now, drop the Twilio copy.
    stage = 'twilio-delete';
    await deleteTwilioRecording(event.recordingSid);

    console.log('[archive] ok', {
      recordingSid: event.recordingSid,
      key,
      bytes: body.byteLength,
      store: store.name,
    });
    return { status: 'archived', key, bytes: body.byteLength, sha256 };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('[archive] FAILED - Twilio copy retained', {
      recordingSid: event.recordingSid,
      stage,
      error,
    });
    await deadLetter(event, stage, error);
    return { status: 'failed', key, stage, error };
  }
}

/**
 * Used only on the already-archived path, where the recording is known safe.
 * A delete failure there is not worth failing the webhook over - the retention
 * sweep or a later retry will catch it.
 */
async function safeDeleteFromTwilio(recordingSid: string): Promise<void> {
  try {
    await deleteTwilioRecording(recordingSid);
  } catch (err) {
    console.warn('[archive] duplicate-event delete failed, leaving to retry', {
      recordingSid,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Failed events land here as JSON so they can be replayed. Deliberately a
 * plain file: the failure mode this guards against includes "the object store
 * is down", so the dead letter must not depend on the object store.
 */
async function deadLetter(event: RecordingEvent, stage: string, error: string): Promise<void> {
  try {
    const dir = path.resolve('./deadletter');
    await mkdir(dir, { recursive: true });
    await writeFile(
      path.join(dir, `${event.recordingSid}.json`),
      JSON.stringify({ event, stage, error, at: new Date().toISOString() }, null, 2),
    );
  } catch (err) {
    // Nothing left to fall back to; make sure it is at least in the logs.
    console.error('[archive] could not write dead letter', { event, stage, error, err });
  }
}

/**
 * Deletes recordings past the retention window. Run daily.
 *
 * This is what actually bounds storage cost - far more than the choice of
 * driver or tier - and keeps the retention period defensible under PIPEDA
 * rather than accumulating customer call audio indefinitely.
 */
export async function sweepRetention(store: RecordingStore): Promise<number> {
  const cutoff = new Date(Date.now() - config.storage.retentionDays * 86_400_000);
  const expired = await store.listExpired(cutoff);

  for (const key of expired) {
    await store.remove(key);
  }

  if (expired.length > 0) {
    console.log('[retention] pruned', {
      count: expired.length,
      olderThan: cutoff.toISOString(),
      store: store.name,
    });
  }
  return expired.length;
}
