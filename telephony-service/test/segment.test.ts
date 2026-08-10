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
