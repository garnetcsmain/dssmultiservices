import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDirectives } from '../src/directives.js';

/**
 * The directive parser sits between an agent that cannot be constrained and a
 * paid API, so the cases that matter are the malformed ones. Everything here
 * is a shape a model plausibly produces.
 */

test('a plain completion is one text message', () => {
  const actions = parseDirectives('Bonjour! Nous passons demain matin.');
  assert.deepEqual(actions, [
    { type: 'text', text: 'Bonjour! Nous passons demain matin.', quote: false },
  ]);
});

test('prose and directives keep their order', () => {
  const actions = parseDirectives(
    ['Voici la photo:', '::image https://x/y.jpg | Avant', 'Ça vous convient?'].join('\n'),
  );
  assert.deepEqual(
    actions.map((a) => a.type),
    ['text', 'image', 'text'],
  );
  assert.equal((actions[1] as { caption?: string }).caption, 'Avant');
});

test('::reply only quotes what follows it', () => {
  const actions = parseDirectives(['Avant.', '::reply', 'Après.'].join('\n'));
  assert.deepEqual(actions, [
    { type: 'text', text: 'Avant.', quote: false },
    { type: 'text', text: 'Après.', quote: true },
  ]);
});

test('a bare reaction is a valid completion', () => {
  assert.deepEqual(parseDirectives('::react 👍'), [{ type: 'react', emoji: '👍' }]);
});

test('unknown directives stay in the prose rather than vanishing', () => {
  // The customer should see the odd line, not a message with a hole in it.
  const actions = parseDirectives('::teleport now\nOn arrive.');
  assert.equal(actions.length, 1);
  assert.equal(actions[0]!.type, 'text');
  assert.match((actions[0] as { text: string }).text, /teleport/);
});

test('a directive with no argument is dropped, not sent empty', () => {
  assert.deepEqual(parseDirectives('::image'), []);
  assert.deepEqual(parseDirectives('::react'), []);
});

test('urls containing a pipe survive caption splitting', () => {
  const [action] = parseDirectives('::file https://x/a.pdf | rapport.pdf');
  assert.equal((action as { ref: string }).ref, 'https://x/a.pdf');
  assert.equal((action as { name?: string }).name, 'rapport.pdf');
});

test('empty completion produces nothing to send', () => {
  assert.deepEqual(parseDirectives('   \n\n  '), []);
});
