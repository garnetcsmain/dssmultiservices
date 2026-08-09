import type twilio from 'twilio';
import { config } from './config.js';
import type { Lang } from './voices.js';

type VoiceResponse = InstanceType<typeof twilio.twiml.VoiceResponse>;
type Sayable = { say: VoiceResponse['say'] };

/**
 * The menu callers hear before anyone's phone rings.
 *
 * Three languages because DSS's customers are Quebec building owners and their
 * tenants, and "press 9 for English" on a Montreal line is table stakes.
 * Spanish is here because a working assumption that everyone reads French or
 * English is wrong on this customer base.
 *
 * DTMF only, deliberately. Twilio bills speech recognition per utterance, and
 * a four-option menu is exactly the case where keypresses are both cheaper and
 * more reliable - especially from a truck or a mechanical room.
 */

export interface Prompts {
  /** Played once, before the menu, on the first pass only. */
  greeting: string;
  recordingNotice: string;
  menu: string;
  invalid: string;
  connecting: string;
  unavailable: string;
  voicemailPrompt: string;
  voicemailThanks: string;
  unassigned: string;
}

export const PROMPTS: Record<Lang, Prompts> = {
  fr: {
    greeting: 'Bonjour, vous avez joint DSS Multiservices.',
    recordingNotice:
      "Cet appel sera enregistré à des fins de qualité de service et de suivi de dossier.",
    menu:
      'Pour parler à un membre de notre équipe, faites le 1. ' +
      'Pour laisser un message, faites le 2. ' +
      'For service in English, press 9. ' +
      'Para servicio en español, marque el 8.',
    invalid: "Je n'ai pas reçu votre choix.",
    connecting: 'Un instant, je vous transfère.',
    unavailable: 'Nous ne sommes pas disponibles pour le moment.',
    voicemailPrompt:
      'Laissez votre nom, votre numéro et votre message après le signal, et nous vous rappellerons.',
    voicemailThanks: 'Merci, votre message a été enregistré.',
    unassigned: "Ce numéro n'est pas encore attribué. Veuillez réessayer plus tard.",
  },
  en: {
    greeting: 'Hello, you have reached DSS Multiservices.',
    recordingNotice: 'This call will be recorded for service quality and file follow-up.',
    menu:
      'To speak with a member of our team, press 1. ' +
      'To leave a message, press 2. ' +
      'Pour le service en français, faites le 9. ' +
      'Para servicio en español, marque el 8.',
    invalid: "I didn't get your selection.",
    connecting: 'One moment, connecting you now.',
    unavailable: 'We are not available right now.',
    voicemailPrompt:
      'Please leave your name, number and message after the tone and we will call you back.',
    voicemailThanks: 'Thank you, your message has been recorded.',
    unassigned: 'This number is not assigned yet. Please try again later.',
  },
  es: {
    greeting: 'Hola, se ha comunicado con DSS Multiservices.',
    recordingNotice:
      'Esta llamada será grabada para fines de calidad de servicio y seguimiento del expediente.',
    menu:
      'Para hablar con un miembro de nuestro equipo, marque 1. ' +
      'Para dejar un mensaje, marque 2. ' +
      'For service in English, press 9. ' +
      'Pour le service en français, faites le 0.',
    invalid: 'No recibí su selección.',
    connecting: 'Un momento, le transfiero.',
    unavailable: 'No estamos disponibles en este momento.',
    voicemailPrompt:
      'Deje su nombre, su número y su mensaje después del tono, y le devolveremos la llamada.',
    voicemailThanks: 'Gracias, su mensaje ha sido grabado.',
    unassigned: 'Este número aún no está asignado. Por favor intente más tarde.',
  },
};

/** Digits that switch language, per the menu each language actually reads out. */
const LANGUAGE_KEYS: Record<string, Lang> = { '9': 'en', '8': 'es', '0': 'fr' };

export function languageFor(digit: string, current: Lang): Lang {
  const next = LANGUAGE_KEYS[digit];
  // '9' means English everywhere except in English, where the menu offers it
  // as French. Reading the switch off the current language avoids a caller
  // pressing 9 in English and landing back in English.
  if (digit === '9' && current === 'en') return 'fr';
  return next ?? current;
}

export function isLanguageKey(digit: string, current: Lang): boolean {
  return languageFor(digit, current) !== current;
}

export function parseLang(raw: unknown): Lang {
  return raw === 'en' || raw === 'es' ? raw : 'fr';
}

/**
 * Speaks in the configured voice for a language.
 *
 * Every <Say> in the service goes through here. Scattering voice ids across
 * route handlers is how a line ends up half generative and half robot after
 * someone adds one prompt in a hurry.
 */
export function say(node: Sayable, lang: Lang, text: string): void {
  const profile = config.voice.voices[lang];
  // The twilio package types `voice` and `language` as closed unions built
  // from whatever the catalogue held when that version shipped, and the
  // generative voices are newer than the installed typings. The attribute is
  // a free-form string on the wire, and VOICE_OVERRIDES exists precisely so
  // voices can be swapped without a release - which a literal union would
  // make impossible. Cast, and let a bad name fail audibly rather than at
  // compile time against a stale list.
  node.say(
    { language: profile.language, voice: profile.voice } as Parameters<Sayable['say']>[0],
    text,
  );
}

/**
 * Renders the menu, or gives up and routes the caller to a human.
 *
 * `attempt` counts how many times the caller has already failed to choose.
 * Past the limit this returns false and the caller should be treated as having
 * pressed 1 - a menu that loops forever on someone with a rotary phone or a
 * dead keypad is a line that never answers.
 */
export function renderMenu(
  response: VoiceResponse,
  lang: Lang,
  attempt: number,
  options: { greet: boolean; invalid: boolean },
): boolean {
  if (attempt >= config.ivr.maxAttempts) return false;

  const prompts = PROMPTS[lang];

  if (options.invalid) say(response, lang, prompts.invalid);
  if (options.greet) {
    say(response, lang, prompts.greeting);
    if (config.voice.playRecordingNotice) say(response, lang, prompts.recordingNotice);
  }

  const gather = response.gather({
    numDigits: 1,
    timeout: config.ivr.gatherTimeoutSeconds,
    action: `${config.publicBaseUrl}/webhooks/twilio/ivr?lang=${lang}&attempt=${attempt + 1}`,
    method: 'POST',
  });
  // Inside the <Gather> so an impatient caller can press a key over the menu
  // instead of waiting for it to finish.
  say(gather, lang, prompts.menu);

  // Reached when the caller says nothing at all. Re-entering the same action
  // without a digit is what drives the attempt counter forward.
  response.redirect(
    { method: 'POST' },
    `${config.publicBaseUrl}/webhooks/twilio/ivr?lang=${lang}&attempt=${attempt + 1}`,
  );
  return true;
}
