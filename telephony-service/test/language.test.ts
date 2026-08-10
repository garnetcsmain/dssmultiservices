import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAsLanguage, pickBestTranscript } from '../src/language.js';

/**
 * The transcripts marked REAL below are verbatim whisper output captured in
 * the container on maple, 2026-08-09, including their mistakes. They are the
 * point of these tests: the scorer has to work on mangled output, because
 * clean output would not need a scorer.
 */

// REAL: French audio forced through -l fr. Wrong words, right grammar.
const FR_AS_FR =
  "Bonjour, ICI David, il y a un fouite aux aéus aaux soldes à l'immobile sur " +
  "La Rousseur Broc, Rappel Esmoire à George way a s'il vous plaît.";

// REAL: the same French audio auto-detected as English. Phonetic nonsense.
const FR_AS_EN =
  'Bonjour, I see I David, Il-Wai on Fou-Aitou A Yusau sold to El Amubil Sir ' +
  'La Roushure Brook, Rapoulais-Moua-Jordouet-Wai-A-Seel-Vou Plate';

// REAL: Spanish audio forced through -l fr.
const ES_AS_FR =
  'Ola, Wenoz Dias, Heyunifuga Diagwin, El Sotano Deled Eficio de La Coye, ' +
  'Sherbrooke, Porfavore Deville Vamelin, Yomada Hoymesmo';

// What the Spanish pass returns when the language is right.
const ES_AS_ES =
  'Hola, buenos días. Hay una fuga de agua en el sótano del edificio de la ' +
  'calle Sherbrooke. Por favor devuélvame la llamada hoy mismo.';

// REAL: English audio, identical output from both -l en and -l fr. Whisper
// ignored the wrong hint entirely, so the two candidates are the same string.
const EN_EITHER =
  'Hello, this is David calling about the water leak in the basement of the ' +
  'building on Sherbrooke Street, please call me back today.';

test('mangled French still scores as French', () => {
  assert.ok(
    scoreAsLanguage(FR_AS_FR, 'fr') > scoreAsLanguage(FR_AS_FR, 'en'),
    'grammar survives the wrong words',
  );
  assert.ok(scoreAsLanguage(FR_AS_FR, 'fr') > scoreAsLanguage(FR_AS_FR, 'es'));
});

test('phonetic nonsense does not score as the language it claims', () => {
  // This is the transcript auto-detection produced. It must lose to the real one.
  assert.ok(scoreAsLanguage(FR_AS_EN, 'en') < scoreAsLanguage(FR_AS_FR, 'fr'));
});

test('the French pass beats the English pass on French audio', () => {
  const choice = pickBestTranscript(
    [
      { lang: 'fr', text: FR_AS_FR },
      { lang: 'en', text: FR_AS_EN },
    ],
    'fr',
  );
  assert.equal(choice?.lang, 'fr');
});

test('Spanish audio picks Spanish over the French gibberish', () => {
  const choice = pickBestTranscript(
    [
      { lang: 'fr', text: ES_AS_FR },
      { lang: 'es', text: ES_AS_ES },
      { lang: 'en', text: EN_EITHER.slice(0, 0) || 'Ola Wenoz Dias Heyunifuga' },
    ],
    'fr',
  );
  assert.equal(choice?.lang, 'es');
});

test('identical text from two passes resolves to the language it actually is', () => {
  // Whisper returned the same English string for -l en and -l fr. Nothing in
  // the audio distinguishes them, so only the text can decide.
  const choice = pickBestTranscript(
    [
      { lang: 'fr', text: EN_EITHER },
      { lang: 'en', text: EN_EITHER },
    ],
    'fr',
  );
  assert.equal(choice?.lang, 'en');
});

test('too short to judge falls back rather than guessing', () => {
  const choice = pickBestTranscript(
    [
      { lang: 'fr', text: 'Ok.' },
      { lang: 'es', text: 'Ok.' },
      { lang: 'en', text: 'Ok.' },
    ],
    'es',
  );
  assert.equal(choice?.lang, 'es', 'the configured fallback, not the first entry');
});

test('empty transcripts are not candidates', () => {
  const choice = pickBestTranscript(
    [
      { lang: 'fr', text: '   ' },
      { lang: 'es', text: ES_AS_ES },
    ],
    'fr',
  );
  assert.equal(choice?.lang, 'es');
});

test('nothing usable returns null instead of an empty message', () => {
  assert.equal(pickBestTranscript([{ lang: 'fr', text: '' }], 'fr'), null);
});

test('a single candidate skips scoring entirely', () => {
  const choice = pickBestTranscript([{ lang: 'es', text: 'cualquier cosa' }], 'fr');
  assert.equal(choice?.lang, 'es');
});

test('every score is reported, so a bad pick can be diagnosed', () => {
  const choice = pickBestTranscript(
    [
      { lang: 'fr', text: FR_AS_FR },
      { lang: 'en', text: FR_AS_EN },
    ],
    'fr',
  );
  assert.deepEqual(Object.keys(choice!.scores).sort(), ['en', 'fr']);
});
