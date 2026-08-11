/**
 * Number -> employee mapping.
 *
 * Deliberately a flat in-process table rather than a database. The brief
 * describes an internal DB keyed by employee_id, but at one provisioned
 * number - five if the full roster gets numbers - a table you can read in
 * one screen beats a schema. Swap this for a real store when the roster
 * outgrows it or when non-engineers need to edit routing.
 */
export interface DirectoryEntry {
  employeeId: string;
  name: string;
  /** E.164 destination the DSS number bridges to (mobile, softphone, SIP). */
  forwardTo: string;
  /**
   * Who receives texts sent to this number. Defaults to just `forwardTo`.
   *
   * Separate from voice because the two fan out differently: a call can only
   * ring one place usefully, while a text can sit in several pockets at once.
   * Anyone listed here can also reply, and their reply goes to the customer
   * from the DSS number.
   */
  smsForwardTo?: string[];
  /** True once this number is registered to the Vonage WABA. */
  whatsappEnabled: boolean;
}

/** Who gets texts for a line. The single voice destination, unless told otherwise. */
export function smsRecipients(entry: DirectoryEntry): string[] {
  const list = entry.smsForwardTo?.length ? entry.smsForwardTo : [entry.forwardTo];
  return list.filter(Boolean);
}

/**
 * Keyed by the DSS-owned number in E.164, as Twilio reports it in `To`.
 *
 * Currently owned (verified against both provider APIs 2026-08-09):
 *   +1 450 235 8434  Twilio  PN2cbbd532a48f612f81097f98b0f3173a
 *                    Quebec (Monteregie). SMS + MMS + voice. No webhooks set.
 *   +1 226 277 0423  Vonage  Ontario (Kitchener-Waterloo). Not linked to any
 *                    Vonage application.
 *
 * A blank `forwardTo` routes to the "not yet assigned" message rather than
 * bridging nowhere, so half-configured entries fail loudly.
 */
const DIRECTORY: Record<string, DirectoryEntry> = {
  '+14502358434': {
    employeeId: 'emp_001',
    name: 'DSS main line',
    // David Salazar. Both legs of every call here are recorded and archived -
    // the caller hears the notice, but the person answering is being recorded
    // too and should know it.
    forwardTo: '+15144637712',
    // Texts to the main line reach David and Freddy both. A voicemail alert
    // that only one person sees is a voicemail nobody answers when that person
    // is on a roof.
    smsForwardTo: ['+15144637712', '+17276136004'],
    whatsappEnabled: true, // registered to the WABA and linked 2026-08-09
  },
  '+14385006595': {
    employeeId: 'emp_002',
    name: 'Francisca Rojas',
    forwardTo: '+14387287236',
    // Not registered yet. Meta sends the verification code from a short code,
    // which Twilio long numbers cannot receive at all, so this has to go
    // through voice verification on /webhooks/twilio/otp - the same path the
    // 450 used. Purchased 2026-08-10, Pointe-Claire, voice + SMS + MMS.
    whatsappEnabled: false,
  },
};

export function lookupByNumber(e164: string): DirectoryEntry | undefined {
  return DIRECTORY[normalize(e164)];
}

export function lookupByEmployeeId(employeeId: string): DirectoryEntry | undefined {
  return Object.values(DIRECTORY).find((entry) => entry.employeeId === employeeId);
}

export function allEntries(): DirectoryEntry[] {
  return Object.values(DIRECTORY);
}

/** Twilio is consistent about E.164, but inbound config edits are not. */
function normalize(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}
