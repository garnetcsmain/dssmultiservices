import { config } from '../config.js';

/** What a store reports back about an object it already holds. */
export interface StoredObject {
  key: string;
  bytes: number;
  sha256: string;
}

/**
 * A recording store. Both drivers must be able to read back size and digest
 * after a write - that read-back is what makes it safe to delete the Twilio
 * copy. A driver that cannot verify must not be used here.
 */
export interface RecordingStore {
  readonly name: string;
  put(key: string, body: Buffer, metadata: Record<string, string>): Promise<void>;
  /** Returns null when the key is absent. Never throws on absence. */
  stat(key: string): Promise<StoredObject | null>;
  /**
   * Reads an object back.
   *
   * Transcription runs after archival, by which point the Twilio copy is gone -
   * so the archive is the only source left. Reading from here rather than
   * keeping the download in memory also means a transcript can be regenerated
   * later, when the model or the language handling improves.
   */
  get(key: string): Promise<Buffer | null>;
  /** Keys whose stored timestamp is older than the cutoff. */
  listExpired(cutoff: Date): Promise<string[]>;
  /**
   * Every key under a prefix.
   *
   * Used to find recordings that never got a transcript. Deriving the work
   * list from what is actually in the store, rather than from a queue, means a
   * crash mid-transcription costs a retry instead of a lost transcript.
   */
  list(prefix: string): Promise<string[]>;
  remove(key: string): Promise<void>;
}

export async function createStore(): Promise<RecordingStore> {
  if (config.storage.driver === 'gcs') {
    const { GcsStore } = await import('./gcs.js');
    return new GcsStore(config.storage.gcsBucket, config.storage.gcsKeyFile);
  }
  const { LocalStore } = await import('./local.js');
  return new LocalStore(config.storage.localRoot);
}

/**
 * Recording key. Date-partitioned so retention sweeps and manual audits can
 * work on a prefix instead of walking everything, and so a caller asking
 * "what do you hold on me" is answerable.
 */
export function recordingKey(recordingSid: string, startedAt: Date): string {
  const yyyy = startedAt.getUTCFullYear();
  const mm = String(startedAt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(startedAt.getUTCDate()).padStart(2, '0');
  return `recordings/${yyyy}/${mm}/${dd}/${recordingSid}.wav`;
}

/**
 * Transcript key for a recording. Sits beside the audio deliberately: whoever
 * finds one finds the other, and a date prefix is what makes "everything from
 * last Tuesday" answerable without an index.
 */
/**
 * Strips whichever sibling suffix a key already carries.
 *
 * Makes the derivations idempotent. The backlog sweeps compare derived keys
 * against what is on disk, so a derivation that appended a second suffix when
 * handed an already-derived key would make every recording look untranscribed
 * and re-run the whole archive on every pass.
 */
function baseKey(key: string): string {
  return key.replace(/\.(wav|transcript\.json|summary\.json)$/, '');
}

export function transcriptKey(recordingKeyOrSid: string): string {
  return `${baseKey(recordingKeyOrSid)}.transcript.json`;
}

/** Summary key. Same prefix as the audio and the transcript, for the same reason. */
export function summaryKey(recordingKeyOrSid: string): string {
  return `${baseKey(recordingKeyOrSid)}.summary.json`;
}
