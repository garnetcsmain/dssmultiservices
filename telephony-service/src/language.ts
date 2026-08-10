/**
 * Picks the right transcript when the language is not known in advance.
 *
 * Whisper's own audio-side language detection is not usable here: measured on
 * maple, a French clip was detected as English at p=0.93 on base, 0.89 on
 * small and 0.56 on large-v3-turbo. Wrong, and confident about it.
 *
 * So instead of asking the audio, we ask the text. Transcribe once per
 * candidate language and score each result on how much it looks like the
 * language it claims to be. The failure mode is loud and easy to score: a
 * Spanish clip forced through French comes back as "Ola, Wenoz Dias,
 * Heyunifuga Diagwin" - phonetic gibberish with almost no real French words -
 * while the Spanish pass returns clean Spanish.
 *
 * Text-side identification is a much easier problem than audio-side, and this
 * only ever has to separate three known languages rather than ninety-nine.
 *
 * The cost is N transcription passes. That is affordable precisely because
 * transcription is local: on the base model a 9-second clip takes ~1.7s, so
 * three passes is ~5s, spent on hardware we already own rather than at
 * $0.05/min. This trade would not be worth making against a paid API.
 */

export type CandidateLang = string;

/**
 * High-frequency function words. Content words are useless here - proper nouns
 * and borrowings survive a wrong-language pass intact - but grammar does not:
 * whisper cannot produce "il y a" from Spanish audio.
 */
const WORDS: Record<string, string[]> = {
  fr: [
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'est', 'sont',
    'etre', 'avoir', 'dans', 'avec', 'pour', 'sur', 'mais', 'ou', 'qui', 'que',
    'ne', 'pas', 'plus', 'tres', 'bien', 'aussi', 'comme', 'tout', 'faire',
    'dit', 'plait', 'bonjour', 'merci', 'oui', 'une', 'des', 'les', 'du', 'au',
    'aux', 'ce', 'cette', 'votre', 'notre', 'ai', 'quoi', 'alors', 'donc',
    'chez', 'sous', 'entre', 'depuis', 'toujours', 'jamais', 'monsieur',
    'madame', 'appel', 'jour', 'ici',
  ],
  es: [
    'el', 'los', 'las', 'una', 'del', 'y', 'en', 'es', 'son', 'esta', 'estan',
    'por', 'para', 'con', 'sin', 'pero', 'como', 'mas', 'muy', 'todo', 'hacer',
    'dice', 'favor', 'hola', 'gracias', 'si', 'su', 'sus', 'mi', 'mis', 'este',
    'hay', 'ser', 'tener', 'que', 'buenos', 'dias', 'senor', 'senora', 'usted',
    'nosotros', 'ellos', 'donde', 'cuando', 'porque', 'tambien', 'ahora',
    'llamada', 'edificio', 'agua',
  ],
  en: [
    'the', 'is', 'are', 'was', 'were', 'this', 'that', 'and', 'or', 'but',
    'for', 'with', 'from', 'have', 'has', 'will', 'would', 'can', 'could',
    'please', 'hello', 'thank', 'yes', 'my', 'your', 'it', 'he', 'she', 'they',
    'we', 'you', 'about', 'back', 'today', 'there', 'here', 'what', 'when',
    'where', 'because', 'also', 'very', 'call', 'calling', 'building', 'water',
  ],
};

/**
 * Words shared between languages carry no signal. "la", "de", "no" and "que"
 * all appear in more than one list, and counting them would score every
 * language equally on the same text.
 */
const DISTINCTIVE: Record<string, Set<string>> = (() => {
  const counts = new Map<string, number>();
  for (const list of Object.values(WORDS)) {
    for (const word of new Set(list)) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  const result: Record<string, Set<string>> = {};
  for (const [lang, list] of Object.entries(WORDS)) {
    result[lang] = new Set(list.filter((word) => counts.get(word) === 1));
  }
  return result;
})();

/** Characters that only one of the three uses. Survives even short samples. */
const MARKERS: Record<string, RegExp> = {
  es: /[ñ¿¡]/i,
  fr: /[çœ]|\b[jlmnstdc]'/i,
  en: /^$/,
};

function normalise(text: string): string[] {
  return text
    .toLowerCase()
    // Strip accents so "à" matches "a" - whisper is inconsistent about them,
    // and the word itself is the signal, not its diacritics.
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z' ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * How much this text looks like `lang`, from 0 to roughly 1.
 *
 * Normalised by length so a long transcript does not beat a short one on
 * volume alone.
 */
export function scoreAsLanguage(text: string, lang: CandidateLang): number {
  const words = normalise(text);
  if (words.length === 0) return 0;

  const distinctive = DISTINCTIVE[lang];
  if (!distinctive) return 0;

  let hits = 0;
  for (const word of words) if (distinctive.has(word)) hits += 1;

  const marker = MARKERS[lang]?.test(text) ? 0.05 : 0;
  return hits / words.length + marker;
}

export interface Candidate {
  lang: CandidateLang;
  text: string;
}

export interface LanguageChoice {
  lang: CandidateLang;
  text: string;
  score: number;
  /** Every candidate's score, for the log line. Debugging this blind is awful. */
  scores: Record<string, number>;
}

/**
 * Chooses among transcripts of the same audio in different languages.
 *
 * `fallback` wins when nothing scores above `minScore` - which happens on
 * genuinely short audio ("oui", "ok") where there is nothing to measure, and
 * on noise. Guessing from a coin-flip score would be worse than admitting the
 * default, because the transcript still reaches a human either way.
 */
export function pickBestTranscript(
  candidates: Candidate[],
  fallback: CandidateLang,
  minScore = 0.04,
): LanguageChoice | null {
  const usable = candidates.filter((c) => c.text.trim().length > 0);
  if (usable.length === 0) return null;
  if (usable.length === 1) {
    const only = usable[0]!;
    return { ...only, score: 1, scores: { [only.lang]: 1 } };
  }

  const scores: Record<string, number> = {};
  let best: Candidate | null = null;
  let bestScore = -1;

  for (const candidate of usable) {
    const score = scoreAsLanguage(candidate.text, candidate.lang);
    scores[candidate.lang] = Number(score.toFixed(4));
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (bestScore < minScore) {
    const preferred = usable.find((c) => c.lang === fallback) ?? usable[0]!;
    return { ...preferred, score: bestScore, scores };
  }

  return { ...best!, score: bestScore, scores };
}
