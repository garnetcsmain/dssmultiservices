import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { config } from './config.js';

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
export async function transcribeWav(wav: Buffer): Promise<string | null> {
  return transcribeAudio(wav);
}

/**
 * Transcribes any audio ffmpeg can decode.
 *
 * Call recordings arrive as 8 kHz WAV; WhatsApp voice notes arrive as OGG
 * Opus. Both go through the same resample, because ffmpeg probes the content
 * rather than trusting the extension - so the container never has to be
 * declared here.
 *
 * `language` overrides the configured default. Calls are answered in a known
 * language; an inbound voice note is whatever the customer speaks, so that
 * path passes 'auto'.
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
