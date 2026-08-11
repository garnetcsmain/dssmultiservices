import type { RecordingStore } from './storage/index.js';

export type { RecordingStore };

/**
 * Who each DSS line is currently talking to.
 *
 * A reply from an employee's mobile carries no clue about which customer it
 * answers, so the last customer to text each line is remembered and the reply
 * goes there.
 *
 * Persisted rather than held in memory. The service restarts on every deploy,
 * and a conversation that silently stops routing after a restart is worse than
 * one that never routed - nobody would notice until a customer complained they
 * never got an answer.
 *
 * Kept in the same store as everything else, under its own prefix so retention
 * sweeps over `recordings/` never touch it. It holds phone numbers and no
 * message content, which is the point: the relay knows who is talking to whom
 * and never keeps what they said.
 */

const KEY = 'state/sms-threads.json';

type Threads = Record<string, { customer: string; at: string }>;

/** Cached so a busy exchange does not re-read the store on every message. */
let cache: Threads | null = null;

async function load(store: RecordingStore): Promise<Threads> {
  if (cache) return cache;
  try {
    const body = await store.get(KEY);
    cache = body ? (JSON.parse(body.toString('utf8')) as Threads) : {};
  } catch (err) {
    // A corrupt file must not stop the relay. Losing the mapping costs one
    // misrouted reply and the employee is told; refusing to run costs every
    // message from here on.
    console.error('[threads] unreadable, starting empty', {
      error: err instanceof Error ? err.message : String(err),
    });
    cache = {};
  }
  return cache;
}

function normalise(number: string): string {
  const digits = number.replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}

export async function rememberThread(
  store: RecordingStore,
  dssNumber: string,
  customer: string,
): Promise<void> {
  const threads = await load(store);
  threads[normalise(dssNumber)] = { customer: normalise(customer), at: new Date().toISOString() };

  try {
    await store.put(KEY, Buffer.from(JSON.stringify(threads, null, 2), 'utf8'), {
      contentType: 'application/json',
      kind: 'sms-threads',
    });
  } catch (err) {
    // The in-memory copy is already updated, so replies keep working until the
    // next restart. Worth a loud log and not worth failing the message over.
    console.error('[threads] could not persist', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function recallThread(
  store: RecordingStore,
  dssNumber: string,
): Promise<string | null> {
  const threads = await load(store);
  return threads[normalise(dssNumber)]?.customer ?? null;
}
