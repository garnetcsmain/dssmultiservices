import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rm, readdir, stat as fsStat } from 'node:fs/promises';
import path from 'node:path';
import type { RecordingStore, StoredObject } from './index.js';

/**
 * Filesystem store. Intended as the working copy that Hermes transcribes
 * from, on the same box, so transcription costs no egress.
 *
 * Note this is a single point of failure: once the Twilio copy is deleted,
 * whatever this holds is the only copy. Run it on redundant disk, and pair
 * it with a GCS Archive mirror for anything you must not lose.
 */
export class LocalStore implements RecordingStore {
  readonly name = 'local';

  constructor(private readonly root: string) {}

  private resolve(key: string): string {
    const full = path.resolve(this.root, key);
    // Keys are built internally from Twilio SIDs, but a traversal here would
    // mean writing customer audio to an arbitrary path. Cheap to rule out.
    const rootAbs = path.resolve(this.root);
    if (full !== rootAbs && !full.startsWith(rootAbs + path.sep)) {
      throw new Error(`Refusing key that escapes storage root: ${key}`);
    }
    return full;
  }

  async put(key: string, body: Buffer, metadata: Record<string, string>): Promise<void> {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });

    // Write to a temp name and rename into place. A crash mid-write must not
    // leave a truncated file that later reads as a valid archive.
    const temp = `${target}.${process.pid}.partial`;
    await writeFile(temp, body);
    await writeFile(
      `${target}.meta.json`,
      JSON.stringify({ ...metadata, bytes: body.byteLength }, null, 2),
    );
    const { rename } = await import('node:fs/promises');
    await rename(temp, target);
  }

  async stat(key: string): Promise<StoredObject | null> {
    const target = this.resolve(key);
    let body: Buffer;
    try {
      body = await readFile(target);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
    return {
      key,
      bytes: body.byteLength,
      sha256: createHash('sha256').update(body).digest('hex'),
    };
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      return await readFile(this.resolve(key));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw err;
    }
  }

  async listExpired(cutoff: Date): Promise<string[]> {
    const rootAbs = path.resolve(this.root);
    const expired: string[] = [];

    const walk = async (dir: string): Promise<void> => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return;
        throw err;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else if (!entry.name.endsWith('.meta.json') && !entry.name.endsWith('.partial')) {
          // Everything that is not bookkeeping is customer content and expires.
          // This used to match only .wav, which quietly exempted every WhatsApp
          // photo, document and voice note from retention - the sweep would run
          // clean while the data it was supposed to remove accumulated forever.
          const info = await fsStat(full);
          if (info.mtime < cutoff) expired.push(path.relative(rootAbs, full));
        }
      }
    };

    await walk(rootAbs);
    return expired;
  }

  async remove(key: string): Promise<void> {
    const target = this.resolve(key);
    await rm(target, { force: true });
    await rm(`${target}.meta.json`, { force: true });
  }
}
