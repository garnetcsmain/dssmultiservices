/**
 * Speech voices for TwiML <Say>.
 *
 * The line answers in three languages and should sound like one person in all
 * of them. Google's Chirp3-HD family is the only generative set that carries
 * the same voice name across fr-CA, en-US and es-US, so "Aoede" gives
 * Esperancita a single identity rather than three unrelated narrators.
 *
 * fr-CA rather than fr-FR is not a detail. This is a Quebec business calling
 * Quebec customers, and a Parisian voice reads as an offshore call centre.
 *
 * Tier matters more than name. The voices this replaced - Polly.Chantal and
 * Polly.Joanna - are Amazon's *standard* tier, the oldest and most obviously
 * synthetic thing Twilio still offers.
 */

export type Lang = 'fr' | 'en' | 'es';

export interface VoiceProfile {
  /** TwiML `language` attribute. */
  language: string;
  /** TwiML `voice` attribute. */
  voice: string;
}

/**
 * Generative tier. Best quality, and billed at a higher rate than standard -
 * a few cents per call at our volume, against a greeting that no longer
 * announces "robot" in the first two seconds.
 */
const GENERATIVE: Record<Lang, VoiceProfile> = {
  fr: { language: 'fr-CA', voice: 'Google.fr-CA-Chirp3-HD-Aoede' },
  en: { language: 'en-US', voice: 'Google.en-US-Chirp3-HD-Aoede' },
  es: { language: 'es-US', voice: 'Google.es-US-Chirp3-HD-Aoede' },
};

/**
 * Neural tier, one step down.
 *
 * Generative voices are not enabled on every Twilio account, and a <Say> with
 * an unavailable voice does not fail loudly - the caller hears a different
 * voice, or nothing useful. Set VOICE_TIER=neural if the greeting comes out
 * wrong; these are still far better than the standard voices they replaced.
 */
const NEURAL: Record<Lang, VoiceProfile> = {
  fr: { language: 'fr-CA', voice: 'Polly.Gabrielle-Neural' },
  en: { language: 'en-US', voice: 'Polly.Joanna-Neural' },
  es: { language: 'es-US', voice: 'Polly.Lupe-Neural' },
};

export function voiceTable(tier: string): Record<Lang, VoiceProfile> {
  return tier === 'neural' ? NEURAL : GENERATIVE;
}

/**
 * Applies per-language overrides of the form "fr=Google.fr-CA-Chirp3-HD-Kore".
 *
 * Voice catalogues change under us - Twilio adds and retires names on its own
 * schedule - so swapping one has to be an env change, not a deploy.
 */
export function applyOverrides(
  table: Record<Lang, VoiceProfile>,
  raw: string,
): Record<Lang, VoiceProfile> {
  if (!raw.trim()) return table;

  const next = { ...table };
  for (const pair of raw.split(',')) {
    const [langPart, voicePart] = pair.split('=').map((s) => s?.trim());
    if (!langPart || !voicePart) continue;

    const lang = langPart as Lang;
    if (!(lang in next)) {
      console.warn('[voices] ignoring override for unknown language', { lang: langPart });
      continue;
    }
    // The language attribute is inferred from the voice id when it carries a
    // locale, so an override does not have to restate it.
    const locale = /^(?:Google|Polly)\.([a-z]{2}-[A-Z]{2})-/.exec(voicePart)?.[1];
    next[lang] = { language: locale ?? next[lang].language, voice: voicePart };
  }
  return next;
}
