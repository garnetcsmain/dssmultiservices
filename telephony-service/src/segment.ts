import { spawn } from 'node:child_process';
import { config } from './config.js';

/**
 * Splits a recording into utterances, per channel.
 *
 * Two problems make this necessary, and neither is solved by transcribing the
 * file whole.
 *
 * **Code-switching.** Whisper assigns one language to the entire audio - it is
 * not a per-phrase classifier. Measured on a real call from the 450 line: the
 * detector chose French at p=0.91 and then pushed all 46 seconds through a
 * French model, so the English and Spanish stretches came back as French
 * phonetics ("Le SSC", "je vais besoin des emplois"). In Montreal that is the
 * normal case, not an edge case - people start a sentence in one language and
 * finish it in another. Deciding per utterance is the only thing that helps.
 *
 * **Hallucination on silence.** Naively splitting the stereo recording into
 * one file per channel makes things worse, not better: each channel is mostly
 * silence while the other person talks, and whisper invents text to fill it.
 * The same call, split that way, produced "ça va t'expliquer pour les
 * autorités" nine times in a row. Cutting the silence out is what prevents it.
 *
 * So: find where each side actually speaks, and hand whisper only those pieces.
 */

export interface Utterance {
  /** 0-based channel index in the source file. */
  channel: number;
  startMs: number;
  endMs: number;
}

export interface SilenceWindow {
  start: number;
  end: number;
}

function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    // ffmpeg reports filter output on stderr, so both streams matter here.
    child.stderr.on('data', (d) => (out += d));
    child.on('error', (err) => reject(new Error(`${command}: ${err.message}`)));
    child.on('close', () => resolve(out));

    setTimeout(() => child.kill('SIGKILL'), config.transcription.timeoutMs).unref();
  });
}

export async function probeDurationSeconds(file: string): Promise<number> {
  const output = await run(config.transcription.ffmpegPath, [
    '-hide_banner', '-i', file, '-f', 'null', '-',
  ]);
  // Read it off ffmpeg's own banner rather than requiring ffprobe, which is a
  // separate binary that the runtime image does not otherwise need.
  const match = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(output);
  if (!match) return 0;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

export async function probeChannels(file: string): Promise<number> {
  const output = await run(config.transcription.ffmpegPath, [
    '-hide_banner', '-i', file, '-f', 'null', '-',
  ]);
  if (/Audio:.*\bstereo\b/.test(output)) return 2;
  return 1;
}

/**
 * Parses ffmpeg's silencedetect output into windows.
 *
 * Exported for tests. Interval arithmetic is where a quiet bug costs you a
 * sentence, and the only way to catch that is to check the maths directly.
 */
export function parseSilence(output: string, duration: number): SilenceWindow[] {
  const windows: SilenceWindow[] = [];
  let pendingStart: number | null = null;

  for (const line of output.split('\n')) {
    const start = /silence_start:\s*(-?[\d.]+)/.exec(line);
    if (start) {
      pendingStart = Math.max(0, Number(start[1]));
      continue;
    }
    const end = /silence_end:\s*([\d.]+)/.exec(line);
    if (end && pendingStart !== null) {
      windows.push({ start: pendingStart, end: Number(end[1]) });
      pendingStart = null;
    }
  }

  // Silence that runs to the end of the file never gets a silence_end line.
  if (pendingStart !== null) windows.push({ start: pendingStart, end: duration });

  return windows;
}

/** Inverts silence windows into the intervals where someone is speaking. */
export function invert(windows: SilenceWindow[], duration: number): SilenceWindow[] {
  const speech: SilenceWindow[] = [];
  let cursor = 0;

  for (const window of windows.sort((a, b) => a.start - b.start)) {
    if (window.start > cursor) speech.push({ start: cursor, end: window.start });
    cursor = Math.max(cursor, window.end);
  }
  if (cursor < duration) speech.push({ start: cursor, end: duration });

  return speech;
}

/**
 * Merges neighbours separated by a gap shorter than `maxGapSeconds`.
 *
 * Natural speech is full of sub-second pauses, and cutting on every one of them
 * would hand whisper a stream of single words with no context to disambiguate
 * either the wording or the language.
 */
export function coalesce(intervals: SilenceWindow[], maxGapSeconds: number): SilenceWindow[] {
  const merged: SilenceWindow[] = [];

  for (const interval of intervals) {
    const previous = merged[merged.length - 1];
    if (previous && interval.start - previous.end <= maxGapSeconds) {
      previous.end = interval.end;
    } else {
      merged.push({ ...interval });
    }
  }
  return merged;
}

/**
 * Finds the utterances in one channel.
 *
 * `-af` rather than `-filter_complex` with a pan for the mono case, because
 * silencedetect on a downmix of a two-party call finds almost no silence at all
 * - somebody is nearly always talking - which is exactly the wrong answer.
 */
async function detectChannel(file: string, channel: number, channels: number): Promise<Utterance[]> {
  const duration = await probeDurationSeconds(file);
  if (duration <= 0) return [];

  const filter =
    channels > 1
      ? `[0:a]pan=mono|c0=c${channel},silencedetect=n=${config.transcription.silenceThresholdDb}dB:d=${config.transcription.silenceMinSeconds}`
      : `[0:a]silencedetect=n=${config.transcription.silenceThresholdDb}dB:d=${config.transcription.silenceMinSeconds}`;

  const output = await run(config.transcription.ffmpegPath, [
    '-hide_banner', '-i', file, '-filter_complex', filter, '-f', 'null', '-',
  ]);

  const speech = coalesce(
    invert(parseSilence(output, duration), duration),
    config.transcription.maxGapSeconds,
  );

  return speech
    // Sub-second blips are breaths, line noise and the tail of the other
    // party bleeding across. Transcribing them produces hallucinations.
    .filter((s) => s.end - s.start >= config.transcription.minUtteranceSeconds)
    .map((s) => ({
      channel,
      // A little padding either side: silencedetect trims hard, and clipping
      // the first phoneme of a word costs more than a moment of quiet.
      startMs: Math.max(0, Math.round((s.start - 0.15) * 1000)),
      endMs: Math.round((s.end + 0.15) * 1000),
    }));
}

/**
 * All utterances in the recording, in chronological order across both sides.
 *
 * Returns an empty array when segmentation is not worth it - a very short
 * recording, or one so busy that it splits into more pieces than the caller is
 * willing to transcribe. Callers treat that as "transcribe it whole instead",
 * which is a worse transcript but never a missing one.
 */
export async function findUtterances(file: string): Promise<Utterance[]> {
  const channels = await probeChannels(file);

  const perChannel = await Promise.all(
    Array.from({ length: channels }, (_, channel) => detectChannel(file, channel, channels)),
  );

  const all = perChannel.flat().sort((a, b) => a.startMs - b.startMs);

  if (all.length > config.transcription.maxUtterances) {
    console.warn('[segment] too many utterances, falling back to whole-file', {
      found: all.length,
      limit: config.transcription.maxUtterances,
    });
    return [];
  }
  return all;
}

/** Extracts one utterance as 16 kHz mono, which is all whisper.cpp accepts. */
export async function extractUtterance(
  source: string,
  utterance: Utterance,
  channels: number,
  target: string,
): Promise<void> {
  const filter =
    channels > 1 ? `[0:a]pan=mono|c0=c${utterance.channel}` : '[0:a]anull';

  await run(config.transcription.ffmpegPath, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', source,
    '-filter_complex', filter,
    '-ss', (utterance.startMs / 1000).toFixed(3),
    '-to', (utterance.endMs / 1000).toFixed(3),
    '-ar', '16000', '-ac', '1',
    target,
  ]);
}
