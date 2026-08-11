import { allLines, smsRecipients, smsMode, type DirectoryEntry } from '../directory.js';

/**
 * Builds the routing table the Twilio-hosted fallback runs on.
 *
 * The fallback cannot import the directory - it executes on Twilio's servers,
 * with none of this repository around it - so the table has to be carried
 * across as data and baked into the source at deploy time.
 *
 * That copy is the dangerous part. A number added to the directory and not
 * redeployed here is covered in normal operation and uncovered during an
 * outage, which is the one time anybody would notice. Generating it rather
 * than writing it by hand is what keeps the two from drifting; the test asserts
 * the generated table covers every line.
 */
export interface FallbackRoute {
  /** Everyone who receives texts on this line, and may therefore be a sender. */
  staff: string[];
  /** Whether a staff message here would normally be relayed to a customer. */
  mode: 'relay' | 'notify';
  /** Where a call to this line rings. */
  forwardTo: string;
}

/** Keyed by the ten significant digits, which is how the fallback looks up. */
export type FallbackRoutes = Record<string, FallbackRoute>;

export function buildRoutes(
  lines: Array<{ number: string; entry: DirectoryEntry }> = allLines(),
): FallbackRoutes {
  const routes: FallbackRoutes = {};
  for (const { number, entry } of lines) {
    routes[nanp(number)] = {
      staff: smsRecipients(entry),
      mode: smsMode(entry),
      forwardTo: entry.forwardTo,
    };
  }
  return routes;
}

/** Placeholder in the fallback sources. Substituted, never shipped as-is. */
const MARKER = '__ROUTES__';

/**
 * Injects the routing table into a fallback source file.
 *
 * Throws when the marker is missing rather than returning the file untouched.
 * An unsubstituted source is still valid JavaScript to look at and fails only
 * when executed - which, for this code, means failing in the middle of an
 * outage, on a customer's call.
 */
export function renderFunction(template: string, routes: FallbackRoutes): string {
  if (!template.includes(MARKER)) {
    throw new Error(`fallback template has no ${MARKER} placeholder to substitute`);
  }
  // Pretty-printed on purpose: this ends up readable in the Twilio console,
  // which is where someone will look when they are trying to understand why a
  // call went somewhere unexpected.
  return template.replace(MARKER, JSON.stringify(routes, null, 2));
}

function nanp(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}
