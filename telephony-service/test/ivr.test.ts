import { test } from 'node:test';
import assert from 'node:assert/strict';
import { languageFor, isLanguageKey, parseLang, PROMPTS } from '../src/ivr.js';
import { applyOverrides, voiceTable } from '../src/voices.js';

test('9 switches to English from French, and back out of English', () => {
  assert.equal(languageFor('9', 'fr'), 'en');
  // Pressing the same key twice must not leave the caller where they started.
  assert.equal(languageFor('9', 'en'), 'fr');
});

test('8 reaches Spanish from either language', () => {
  assert.equal(languageFor('8', 'fr'), 'es');
  assert.equal(languageFor('8', 'en'), 'es');
});

test('menu selections are not mistaken for language keys', () => {
  assert.equal(isLanguageKey('1', 'fr'), false);
  assert.equal(isLanguageKey('2', 'fr'), false);
  assert.equal(languageFor('1', 'fr'), 'fr');
});

test('an unknown or absent lang parameter falls back to French', () => {
  assert.equal(parseLang(undefined), 'fr');
  assert.equal(parseLang('de'), 'fr');
  assert.equal(parseLang('es'), 'es');
});

test('every language has every prompt', () => {
  const keys = Object.keys(PROMPTS.fr).sort();
  for (const lang of ['en', 'es'] as const) {
    assert.deepEqual(Object.keys(PROMPTS[lang]).sort(), keys, `${lang} is missing a prompt`);
    for (const [key, value] of Object.entries(PROMPTS[lang])) {
      assert.ok(value.trim().length > 0, `${lang}.${key} is empty`);
    }
  }
});

test('the default voice is the same persona in all three languages', () => {
  const table = voiceTable('generative');
  const names = Object.values(table).map((v) => v.voice.split('-').pop());
  assert.deepEqual(new Set(names).size, 1, 'languages should share one voice name');
});

test('an override replaces the voice and infers its locale', () => {
  const table = applyOverrides(voiceTable('generative'), 'fr=Google.fr-CA-Chirp3-HD-Kore');
  assert.equal(table.fr.voice, 'Google.fr-CA-Chirp3-HD-Kore');
  assert.equal(table.fr.language, 'fr-CA');
  assert.equal(table.en.voice, 'Google.en-US-Chirp3-HD-Aoede', 'other languages untouched');
});

test('a malformed override is ignored rather than breaking every prompt', () => {
  const base = voiceTable('generative');
  assert.deepEqual(applyOverrides(base, 'garbage'), base);
  assert.deepEqual(applyOverrides(base, 'xx=Polly.Nobody'), base);
});
