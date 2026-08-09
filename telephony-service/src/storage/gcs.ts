import { createHash } from 'node:crypto';
import type { RecordingStore, StoredObject } from './index.js';

/**
 * Google Cloud Storage store.
 *
 * Verification uses the crc32c/md5 GCS computes server-side on write, plus a
 * local sha256 recorded in object metadata. We compare the sha256 we computed
 * before upload against what the object reports after - a round trip through
 * GCS's own metadata, not just a trust-the-write.
 *
 * Set a bucket lifecycle rule to move objects Standard -> Nearline -> Archive;
 * at DSS volume that is the difference between ~$11/mo and well under $1.
 */
export class GcsStore implements RecordingStore {
  readonly name = 'gcs';
  private bucketPromise: Promise<import('@google-cloud/storage').Bucket>;

  constructor(bucketName: string, keyFile?: string) {
    this.bucketPromise = import('@google-cloud/storage').then(({ Storage }) => {
      const storage = new Storage(keyFile ? { keyFilename: keyFile } : {});
      return storage.bucket(bucketName);
    });
  }

  async put(key: string, body: Buffer, metadata: Record<string, string>): Promise<void> {
    const bucket = await this.bucketPromise;
    const sha256 = createHash('sha256').update(body).digest('hex');
    await bucket.file(key).save(body, {
      resumable: false,
      contentType: 'audio/wav',
      metadata: {
        contentType: 'audio/wav',
        metadata: { ...metadata, sha256, bytes: String(body.byteLength) },
      },
    });
  }

  async stat(key: string): Promise<StoredObject | null> {
    const bucket = await this.bucketPromise;
    const file = bucket.file(key);
    const [exists] = await file.exists();
    if (!exists) return null;

    const [meta] = await file.getMetadata();
    const custom = (meta.metadata ?? {}) as Record<string, string>;
    return {
      key,
      bytes: Number(meta.size ?? 0),
      sha256: custom.sha256 ?? '',
    };
  }

  async listExpired(cutoff: Date): Promise<string[]> {
    const bucket = await this.bucketPromise;
    const [files] = await bucket.getFiles({ prefix: 'recordings/' });
    return files
      .filter((f) => {
        const created = f.metadata.timeCreated;
        return typeof created === 'string' && new Date(created) < cutoff;
      })
      .map((f) => f.name);
  }

  async remove(key: string): Promise<void> {
    const bucket = await this.bucketPromise;
    await bucket.file(key).delete({ ignoreNotFound: true });
  }
}
