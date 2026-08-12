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
  /**
   * What texting this line means.
   *
   *   'relay'  - a real two-way line. Inbound reaches staff, and a staff reply
   *              goes back out to the customer from the DSS number.
   *   'notify' - a one-way copy. Inbound is forwarded and nothing is ever sent
   *              outward, so a message from staff to this line goes nowhere.
   *
   * The distinction is a safety property, not a preference. On a notify line
   * the traffic is things like verification codes, and the people receiving
   * them are not conducting a conversation - so if one of them texts the line
   * for any reason, relaying it would send an internal message to whichever
   * customer happened to write in last.
   *
   * Defaults to 'notify': a line that quietly forwards too little is a nuisance,
   * one that quietly forwards too much is a disclosure.
   */
  smsMode?: 'relay' | 'notify';
  /** True once this number is registered to the Vonage WABA. */
  whatsappEnabled: boolean;
}

/** Who gets texts for a line. The single voice destination, unless told otherwise. */
export function smsRecipients(entry: DirectoryEntry): string[] {
  const list = entry.smsForwardTo?.length ? entry.smsForwardTo : [entry.forwardTo];
  return list.filter(Boolean);
}

/** Whether staff replies on this line reach the customer, or go nowhere. */
export function smsMode(entry: DirectoryEntry): 'relay' | 'notify' {
  return entry.smsMode ?? 'notify';
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
 * Also on the Twilio account and deliberately absent from this table:
 *   +1 438 817 8400  "TuFamilia CA- 8400" belongs to a different project. It
 *                    has no handlers of any kind and must not get any here -
 *                    adding it would route someone else's traffic to DSS staff.
 *                    Left alone on purpose; it is not an oversight to correct.
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
    // Texts to the main line reach David and Freddy both: alerts rather than
    // conversation, and two people see one arrive without either being at
    // their desk.
    //
    // This used to say the traffic here is verification codes. It cannot be.
    // Twilio finds the one-time code in an inbound message, redacts it and
    // fails the message with error 30038 - confirmed 2026-08-12 on a real
    // QuickBooks code - so no 2FA text ever reaches this service, on any line.
    // Codes arrive by voice instead, through the capture path in routes/voice.
    smsForwardTo: ['+15144637712', '+17276136004'],
    // Explicitly one-way. Nobody answers customers on this line, so a text
    // from David or Freddy to it must not be relayed to whoever wrote in last.
    smsMode: 'notify',
    whatsappEnabled: true, // registered to the WABA and linked 2026-08-09
  },
  '+14385006595': {
    employeeId: 'emp_002',
    name: 'Francisca Rojas',
    forwardTo: '+14387287236',
    // Texts reach her; she does not answer them here. This was a relay - she
    // could reply from her own phone and the customer would only ever see the
    // DSS number - and it was turned off on 2026-08-12 because she has no need
    // to answer by text, and a relay line charges a real price for the option:
    // *any* message from her phone to this number is sent onward to whichever
    // customer wrote in last. A verification code she meant to forward to the
    // office is the obvious way that goes wrong, and neither she nor the
    // customer would ever know it had. Nothing on this line was worth that.
    smsMode: 'notify',
    // Not registered yet, and the registration will be the WhatsApp Business
    // app on her own handset rather than the API - so this line stays false:
    // a number lives in the mobile app or on a BSP, never both, and nothing
    // here bridges her WhatsApp.
    //
    // The registration code has to come by voice. Meta sends the SMS version
    // from a short code and Twilio redacts inbound one-time codes anyway
    // (error 30038), so the text cannot arrive by either route. The voice call
    // is recognised by its caller ID and captured automatically; see
    // config.voice.otpCallers. Purchased 2026-08-10, Pointe-Claire.
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

/**
 * Every line with the number it is reached on.
 *
 * `allEntries` drops the key, which is fine for anything that already knows
 * which number it is handling. The Twilio fallback does not - it has to build
 * a routing table from scratch - so it needs both halves.
 */
export function allLines(): Array<{ number: string; entry: DirectoryEntry }> {
  return Object.entries(DIRECTORY).map(([number, entry]) => ({ number, entry }));
}

/**
 * Reduces a North American number to its ten significant digits.
 *
 * Twilio always sends E.164, so the leading 1 is consistent on the wire - but
 * every hand-written list in this service is typed by a person, and an entry
 * written as "5144637712" would otherwise never match the "+15144637712"
 * Twilio reports. The consequence of that near-miss is never a failed lookup;
 * it is a staff reply treated as a customer message, or a verification robot
 * routed to somebody's phone.
 *
 * Only strips the 1 at eleven digits, so it cannot mangle an international
 * number into a false match with a local one.
 *
 * Lives here rather than beside either caller because both the SMS relay and
 * the voice router decide who someone is with it, and two copies of this rule
 * would eventually disagree.
 */
export function nanp(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/** Whether two written numbers name the same North American phone. */
export function sameNumber(a: string, b: string): boolean {
  const left = nanp(a);
  return left.length > 0 && left === nanp(b);
}

/** Twilio is consistent about E.164, but inbound config edits are not. */
function normalize(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : `+${digits}`;
}
