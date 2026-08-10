import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { config } from './config.js';
import { pickBestTranscript, type Candidate } from './language.js';

/**
 * Local speech-to-text via whisper.cpp.
 *
 * This is the piece the whole cost argument rests on: Twilio charges
 * $0.05/min to transcribe, which at DSS volume is roughly $780/month. Running
 * the same work locally makes that line item zero. Measured on a 26s 8 kHz
 * call with ggml-base-q5_0: ~15s wall clock.
 *
 * Returns null on any failure rather than throwing. Transcription is an
 * enrichment step - a broken model path or a missing binary must never take
 * down call archival, which is the part that cannot be redone later.
 */

/**
 * Transcribes any audio ffmpeg can decode, in one known language.
 *
 * Call recordings arrive as 8 kHz WAV; WhatsApp voice notes arrive as OGG
 * Opus. Both go through the same resample, because ffmpeg probes the content
 * rather than trusting the extension - so the container never has to be
 * declared here.
 *
 * Use this only where the language is genuinely known, such as Meta's English
 * verification robot. When it is not, use transcribeMultilingual: passing a
 * wrong language here produces phonetic nonsense, not a worse transcript.
 */
export async function transcribeAudio(
  audio: Buffer,
  language = config.transcription.language,
): Promise<string | null> {
  if (!config.transcription.enabled) return null;

  let workdir: string | undefined;
  try {
    workdir = await mkdtemp(path.join(tmpdir(), 'dss-stt-'));
    const source = path.join(workdir, 'in.media');
    const resampled = path.join(workdir, '16k.wav');
    await writeFile(source, audio);

    // whisper.cpp only accepts 16 kHz mono. Twilio records 8 kHz, and dual
    // channel for real calls - downmixing loses which speaker said what, so
    // if diarization matters later, transcribe the channels separately.
    await run(config.transcription.ffmpegPath, [
      '-hide_banner', '-loglevel', 'error', '-y',
      '-i', source,
      '-ar', '16000', '-ac', '1',
      resampled,
    ]);

    const output = await run(config.transcription.whisperPath, [
      '-m', config.transcription.modelPath,
      '-f', resampled,
      '-l', language,
      '-nt',
    ]);

    const text = output.trim();
    return text.length > 0 ? text : null;
  } catch (err) {
    console.error('[stt] transcription failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    if (workdir) await rm(workdir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Transcribes audio whose language is not known in advance.
 *
 * Runs one pass per candidate and scores the resulting text, because whisper's
 * audio-side detector was measured getting French wrong at p=0.93. Scoring the
 * output instead of the input is a far easier problem - see language.ts.
 *
 * Affordable only because transcription is local. Three passes on the base
 * model cost about 5s of our own CPU for a short clip; against a per-minute
 * API this would be an obviously bad trade.
 *
 * Sequential rather than parallel: whisper already saturates the cores it is
 * given, so running three at once would contend rather than overlap.
 */
export async function transcribeMultilingual(
  audio: Buffer,
  candidates: string[] = config.transcription.clientLanguages,
  fallback: string = config.transcription.language,
): Promise<{ text: string; language: string } | null> {
  if (!config.transcription.enabled) return null;

  const languages = candidates.length > 0 ? candidates : [fallback];
  if (languages.length === 1) {
    const text = await transcribeAudio(audio, languages[0]!);
    return text ? { text, language: languages[0]! } : null;
  }

  const results: Candidate[] = [];
  for (const lang of languages) {
    const text = await transcribeAudio(audio, lang);
    if (text) results.push({ lang, text });
  }

  const choice = pickBestTranscript(results, fallback, config.transcription.languageMinScore);
  if (!choice) return null;

  console.log('[stt] language chosen', {
    picked: choice.lang,
    score: Number(choice.score.toFixed(4)),
    scores: choice.scores,
  });
  return { text: choice.text, language: choice.lang };
}

/**
 * Pulls a verification code out of a transcript.
 *
 * The reader repeats the code several times, and whisper renders it as a run
 * of digits. Taking the most frequent match rather than the first guards
 * against one mangled repetition winning.
 */
export function extractVerificationCode(transcript: string, digits = 6): string | null {
  const matches = transcript.match(new RegExp(`\\b\\d{${digits}}\\b`, 'g'));
  if (!matches?.length) return null;

  const counts = new Map<string, number>();
  for (const m of matches) counts.set(m, (counts.get(m) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
}

function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err) => reject(new Error(`${command}: ${err.message}`)));
    child.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} exited ${code}: ${stderr.slice(-300)}`));
    });

    // whisper on a long recording is slow but must not hang the process forever.
    setTimeout(() => child.kill('SIGKILL'), config.transcription.timeoutMs).unref();
  });
}
