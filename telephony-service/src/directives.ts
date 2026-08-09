/**
 * Turns an agent completion into a list of WhatsApp sends.
 *
 * Hermes returns text and nothing else - it has no tool surface pointed at
 * Vonage, and it configures itself, so adding one is not ours to do. A small
 * directive vocabulary inside the completion is the seam that lets the agent
 * reach the richer message types without either side owning the other.
 *
 * Deliberately line-based rather than JSON. A model that emits slightly
 * malformed JSON produces nothing; a model that fumbles a directive line
 * produces a message with one odd-looking line in it, which the customer can
 * still read. The failure mode is the reason for the format.
 *
 * Anything not recognised as a directive is prose and gets sent as text, so a
 * completion with no directives at all behaves exactly as it did before.
 */

export type Action =
  | { type: 'text'; text: string; quote: boolean }
  | { type: 'react'; emoji: string }
  | { type: 'unreact' }
  | { type: 'image'; ref: string; caption?: string; quote: boolean }
  | { type: 'video'; ref: string; caption?: string; quote: boolean }
  | { type: 'audio'; ref: string; quote: boolean }
  | { type: 'file'; ref: string; name?: string; quote: boolean }
  | { type: 'sticker'; ref: string }
  | { type: 'call'; quote: boolean };

const DIRECTIVE = /^::(\w+)\s*(.*)$/;

/** Splits "url | trailing text" without breaking urls that contain a pipe. */
function splitArgument(raw: string): { ref: string; extra?: string } {
  const index = raw.indexOf('|');
  if (index === -1) return { ref: raw.trim() };
  return {
    ref: raw.slice(0, index).trim(),
    extra: raw.slice(index + 1).trim() || undefined,
  };
}

export function parseDirectives(completion: string): Action[] {
  const actions: Action[] = [];
  let prose: string[] = [];
  let quote = false;

  /** Flushes accumulated prose as one text message, preserving its position. */
  const flush = (): void => {
    const text = prose.join('\n').trim();
    prose = [];
    if (text) actions.push({ type: 'text', text, quote });
  };

  for (const line of completion.split('\n')) {
    const match = DIRECTIVE.exec(line.trim());
    if (!match) {
      prose.push(line);
      continue;
    }

    const [, verb, rest] = match as unknown as [string, string, string];
    const { ref, extra } = splitArgument(rest);

    switch (verb.toLowerCase()) {
      // A modifier, not a message: everything after it is sent as a reply to
      // the message that triggered this run.
      case 'reply':
        flush();
        quote = true;
        break;

      case 'react':
        flush();
        if (ref) actions.push({ type: 'react', emoji: ref });
        break;

      case 'unreact':
        flush();
        actions.push({ type: 'unreact' });
        break;

      case 'image':
      case 'video':
        flush();
        if (ref) actions.push({ type: verb.toLowerCase() as 'image' | 'video', ref, caption: extra, quote });
        break;

      case 'audio':
        flush();
        if (ref) actions.push({ type: 'audio', ref, quote });
        break;

      case 'file':
        flush();
        if (ref) actions.push({ type: 'file', ref, name: extra, quote });
        break;

      case 'sticker':
        flush();
        if (ref) actions.push({ type: 'sticker', ref });
        break;

      case 'call':
        flush();
        actions.push({ type: 'call', quote });
        break;

      // An unknown directive is far more likely to be the agent writing about
      // something than inventing a verb, so it stays in the prose rather than
      // vanishing from the customer's message.
      default:
        prose.push(line);
    }
  }

  flush();
  return actions;
}
