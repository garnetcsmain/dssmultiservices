import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordingKey, transcriptKey, summaryKey } from '../src/storage/index.js';

/**
 * These three derivations are how the archive stays navigable, and how the
 * backlog sweeps decide what work is outstanding. If transcriptKey stopped
 * agreeing with what the pipeline writes, the sweep would re-transcribe every
 * recording on every pass, forever, and never notice.
 */

test('a recording is filed under its UTC date', () => {
  const key = recordingKey('RE123', new Date('2026-08-10T23:45:00Z'));
  assert.equal(key, 'recordings/2026/08/10/RE123.wav');
});

test('date partitioning is zero-padded', () => {
  // "2026/8/9" would sort wrong and break every prefix query on the archive.
  assert.equal(
    recordingKey('RE1', new Date('2026-09-08T00:00:00Z')),
    'recordings/2026/09/08/RE1.wav',
  );
});

test('the sibling keys are derived from the recording key', () => {
  const audio = recordingKey('RE123', new Date('2026-08-10T12:00:00Z'));
  assert.equal(transcriptKey(audio), 'recordings/2026/08/10/RE123.transcript.json');
  assert.equal(summaryKey(audio), 'recordings/2026/08/10/RE123.summary.json');
});

test('all three share a prefix, so they are found and expire together', () => {
  const audio = recordingKey('RE123', new Date('2026-08-10T12:00:00Z'));
  const dir = audio.slice(0, audio.lastIndexOf('/'));
  for (const key of [audio, transcriptKey(audio), summaryKey(audio)]) {
    assert.ok(key.startsWith(dir), `${key} escaped ${dir}`);
  }
});

test('deriving twice is stable', () => {
  // The sweep compares derived keys against what is on disk; a derivation that
  // drifted on a second application would make every recording look untranscribed.
  const audio = 'recordings/2026/08/10/RE1.wav';
  assert.equal(transcriptKey(transcriptKey(audio)), transcriptKey(audio));
  assert.equal(summaryKey(summaryKey(audio)), summaryKey(audio));
});

test('a bare sid works too, for callers that have no key yet', () => {
  assert.equal(transcriptKey('RE123'), 'RE123.transcript.json');
  assert.equal(summaryKey('RE123'), 'RE123.summary.json');
});
