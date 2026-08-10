import { test } from 'node:test';
import assert from 'node:assert/strict';
import { section, parseActions } from '../src/pipeline/summary.js';

/**
 * Parsing an agent's reply. The model is not bound to the format, so every
 * case here is a shape a real completion plausibly comes back in - and the
 * requirement throughout is that a malformed answer degrades rather than
 * disappearing.
 */

const WELL_FORMED = `RESUMEN:
Un locataire signale une fuite au sous-sol. David rappelle demain matin.

ACCIONES:
- David rappelle le locataire avant 10h
- Envoyer un plombier sur Sherbrooke

TEMA: fuite sous-sol Sherbrooke`;

test('pulls each section out of a well-formed reply', () => {
  assert.match(section(WELL_FORMED, 'RESUMEN'), /^Un locataire signale/);
  assert.equal(section(WELL_FORMED, 'TEMA'), 'fuite sous-sol Sherbrooke');
  assert.deepEqual(parseActions(section(WELL_FORMED, 'ACCIONES')), [
    'David rappelle le locataire avant 10h',
    'Envoyer un plombier sur Sherbrooke',
  ]);
});

test('a section does not bleed into the next one', () => {
  // The failure this guards is a summary that swallows the action list and
  // leaves the follow-ups invisible.
  assert.ok(!section(WELL_FORMED, 'RESUMEN').includes('ACCIONES'));
  assert.ok(!section(WELL_FORMED, 'RESUMEN').includes('David rappelle le locataire'));
});

test('the explicit no-op is not turned into a task', () => {
  // A fake action item in front of a human is worse than an empty list.
  assert.deepEqual(parseActions('- NINGUNA'), []);
  assert.deepEqual(parseActions('NINGUNA'), []);
  assert.deepEqual(parseActions('- Aucune'), []);
  assert.deepEqual(parseActions('none'), []);
});

test('bullet styles and blank lines are all accepted', () => {
  assert.deepEqual(parseActions('* premier\n\n• deuxieme\n-   troisieme  '), [
    'premier',
    'deuxieme',
    'troisieme',
  ]);
});

test('a missing section is empty rather than an error', () => {
  assert.equal(section('RESUMEN:\nrien de plus', 'ACCIONES'), '');
  assert.equal(section('', 'TEMA'), '');
});

test('lower-case and colon-less headings still parse', () => {
  assert.equal(section('resumen\nquelque chose', 'RESUMEN'), 'quelque chose');
});

test('sections found in any order', () => {
  const reversed = 'TEMA: eau chaude\n\nRESUMEN:\nLe chauffe-eau est brise.';
  assert.equal(section(reversed, 'TEMA'), 'eau chaude');
  assert.equal(section(reversed, 'RESUMEN'), 'Le chauffe-eau est brise.');
});
