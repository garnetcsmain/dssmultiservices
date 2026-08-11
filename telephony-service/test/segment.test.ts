import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSilence, invert, coalesce } from '../src/segment.js';

/**
 * Interval arithmetic over ffmpeg's silencedetect output. A bug here does not
 * throw - it silently drops a sentence out of a customer's call, or hands
 * whisper a stretch of silence to hallucinate over.
 */

const SAMPLE = `
[silencedetect @ 0x1] silence_start: 0
[silencedetect @ 0x1] silence_end: 2.5 | silence_duration: 2.5
[silencedetect @ 0x1] silence_start: 6.1
[silencedetect @ 0x1] silence_end: 9.4 | silence_duration: 3.3
`;

test('parses paired silence windows', () => {
  assert.deepEqual(parseSilence(SAMPLE, 20), [
    { start: 0, end: 2.5 },
    { start: 6.1, end: 9.4 },
  ]);
});

test('silence running to the end of the file is closed at the duration', () => {
  // ffmpeg emits no silence_end for trailing silence. Without this the last
  // window is dropped and the tail is transcribed as if someone were talking.
  const output = SAMPLE + '[silencedetect @ 0x1] silence_start: 17.2\n';
  const windows = parseSilence(output, 20);
  assert.deepEqual(windows[windows.length - 1], { start: 17.2, end: 20 });
});

test('a negative silence_start is clamped to zero', () => {
  // ffmpeg reports small negative starts on some inputs; a negative offset
  // makes the later -ss extraction fail outright.
  assert.deepEqual(parseSilence('silence_start: -0.004\nsilence_end: 1.0', 5), [
    { start: 0, end: 1 },
  ]);
});

test('inverting silence yields the speech between the gaps', () => {
  const speech = invert([{ start: 0, end: 2.5 }, { start: 6.1, end: 9.4 }], 12);
  assert.deepEqual(speech, [
    { start: 2.5, end: 6.1 },
    { start: 9.4, end: 12 },
  ]);
});

test('audio with no silence at all is one speech interval', () => {
  assert.deepEqual(invert([], 30), [{ start: 0, end: 30 }]);
});

test('audio that is entirely silence yields nothing to transcribe', () => {
  assert.deepEqual(invert([{ start: 0, end: 30 }], 30), []);
});

test('overlapping silence windows do not produce negative intervals', () => {
  const speech = invert([{ start: 0, end: 5 }, { start: 2, end: 8 }], 10);
  assert.deepEqual(speech, [{ start: 8, end: 10 }]);
  for (const s of speech) assert.ok(s.end > s.start);
});

test('short gaps merge, long gaps do not', () => {
  const merged = coalesce(
    [{ start: 0, end: 2 }, { start: 2.5, end: 4 }, { start: 10, end: 12 }],
    0.8,
  );
  // 0.5s apart is a breath; 6s apart is a different turn in the conversation.
  assert.deepEqual(merged, [{ start: 0, end: 4 }, { start: 10, end: 12 }]);
});

test('coalescing does not mutate its input', () => {
  const input = [{ start: 0, end: 2 }, { start: 2.1, end: 4 }];
  coalesce(input, 0.8);
  assert.deepEqual(input, [{ start: 0, end: 2 }, { start: 2.1, end: 4 }]);
});

test('a full pass over one channel produces sane speech intervals', () => {
  const speech = coalesce(invert(parseSilence(SAMPLE, 20), 20), 0.8);
  assert.deepEqual(speech, [
    { start: 2.5, end: 6.1 },
    { start: 9.4, end: 20 },
  ]);
});

/**
 * Packing utterances into whisper-sized turns. This is the biggest lever on
 * transcription cost — whisper encodes a 30-second window whatever you hand
 * it — so a bug that stops packing would quietly restore a 13x bill.
 */
import { packUtterances } from '../src/segment.js';

const u = (channel: number, startMs: number, endMs: number) => ({ channel, startMs, endMs });

test('consecutive turns from one speaker merge up to the window', () => {
  const packed = packUtterances([u(0, 0, 3000), u(0, 4000, 9000), u(0, 10000, 15000)], 28);
  assert.deepEqual(packed, [u(0, 0, 15000)]);
});

test('a different speaker always starts a new pack', () => {
  // Merging across speakers would attribute one person's words to the other,
  // which matters more than any saving.
  const packed = packUtterances([u(0, 0, 3000), u(1, 3500, 6000), u(0, 7000, 9000)], 28);
  assert.equal(packed.length, 3);
  assert.deepEqual(packed.map((p) => p.channel), [0, 1, 0]);
});

test('the window is a ceiling, not a suggestion', () => {
  const packed = packUtterances([u(0, 0, 5000), u(0, 6000, 40000)], 28);
  assert.equal(packed.length, 2, 'a 40s span must not be packed into one 28s window');
});

test('packing preserves total coverage and order', () => {
  const input = [u(0, 0, 2000), u(0, 3000, 5000), u(1, 6000, 8000)];
  const packed = packUtterances(input, 28);
  assert.equal(packed.at(0)?.startMs, 0, 'the first moment of speech must survive');
  assert.equal(packed.at(-1)?.endMs, 8000, 'the last moment of speech must survive');
  const starts = packed.map((p) => p.startMs);
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b), 'packs must stay ordered');
});

test('packing does not mutate its input', () => {
  const input = [u(0, 0, 2000), u(0, 2500, 4000)];
  packUtterances(input, 28);
  assert.deepEqual(input, [u(0, 0, 2000), u(0, 2500, 4000)]);
});

test('nothing in, nothing out', () => {
  assert.deepEqual(packUtterances([], 28), []);
});

test('packing disabled leaves every turn intact', () => {
  // The default. Accuracy beat throughput on the reference call, so 0 must
  // mean "do nothing" rather than "pack with a zero-length window".
  const input = [u(0, 0, 2000), u(0, 2500, 4000), u(1, 5000, 6000)];
  assert.deepEqual(packUtterances(input, 0), input);
});
