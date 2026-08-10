import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { config } from '../config.js';
import { transcriptKey, type RecordingStore } from '../storage/index.js';
import { findUtterances, extractUtterance, probeChannels } from '../segment.js';
import { transcribeWavFileMultilingual, transcribeMultilingual } from '../transcribe.js';
import { summariseAndStore, type CallSummary } from './summary.js';

/**
 * Turns an archived recording into a stored transcript.
 *
 * Runs after archival, reading the audio back out of our own store - by that
 * point the Twilio copy is gone, and re-deriving a transcript later (better
 * model, better language handling) has to work from the archive anyway.
 *
 * The output is a JSON object beside the audio. It is deliberately a plain
 * document rather than rows in a database: whatever consumes these downstream
 * has not been decided yet, and a dated JSON file next to its recording is the
 * shape that stays readable whether the reader is a human, a sync job or an
 * agent.
 */

export type Speaker = 'caller' | 'agent' | 'unknown';

export interface TranscriptSegment {
  speaker: Speaker;
  startMs: number;
  endMs: number;
  language: string;
  text: string;
}

export interface CallTranscript {
  recordingSid: string;
  callSid: string;
  key: string;
  from?: string;
  to?: string;
  employeeId?: string;
  direction: 'call' | 'voicemail';
  durationSeconds: number;
  transcribedAt: string;
  /** Every language actually observed, most-spoken first. */
  languages: string[];
  segments: TranscriptSegment[];
  /** The whole conversation as flat text, for anything that just wants to read. */
  text: string;
}

export interface TranscribeInput {
  recordingSid: string;
  callSid: string;
  /** Key of the archived audio in the store. */
  key: string;
  from?: string;
  to?: string;
  employeeId?: string;
  direction: 'call' | 'voicemail';
  durationSeconds: number;
}

/**
 * Channel 0 is the inbound caller and channel 1 the party we dialled, which is
 * the order Twilio writes `record-from-answer-dual`. Voicemail is single
 * channel and is always the caller.
 */
function speakerFor(channel: number, channels: number): Speaker {
  if (channels < 2) return 'caller';
  return channel === 0 ? 'caller' : 'agent';
}

/**
 * Which languages to try, and which to fall back on, for each side.
 *
 * "Staff speak Spanish" is a prior, not a fact, and pinning the agent channel
 * to it was measurably wrong: on a real bilingual call from the 450 line, David
 * was speaking French and English while every one of his utterances came back
 * forced through Spanish - "Ok, el beso de la abril, chiquo, la lura" out of
 * perfectly ordinary French.
 *
 * So both sides get scored across all candidates. The prior survives only
 * where it is cheap and safe: as the tie-break when the text is too short to
 * score, which is exactly the case it was right about.
 */
function candidatesFor(speaker: Speaker): { candidates: string[]; fallback: string } {
  return {
    candidates: config.transcription.clientLanguages,
    fallback:
      speaker === 'agent' && config.transcription.employeeLanguage
        ? config.transcription.employeeLanguage
        : config.transcription.language,
  };
}

export async function transcribeRecording(
  store: RecordingStore,
  input: TranscribeInput,
): Promise<CallTranscript | null> {
  if (!config.transcription.enabled) return null;

  const audio = await store.get(input.key);
  if (!audio) {
    console.warn('[transcript] audio not in store, nothing to transcribe', { key: input.key });
    return null;
  }

  let workdir: string | undefined;
  try {
    workdir = await mkdtemp(path.join(tmpdir(), 'dss-tr-'));
    const source = path.join(workdir, 'call.wav');
    await writeFile(source, audio);

    const channels = await probeChannels(source);
    const utterances = await findUtterances(source);

    // No usable split - very short audio, or too many pieces to be worth it.
    // A single whole-file pass is a worse transcript but never a missing one.
    if (utterances.length === 0) {
      const whole = await transcribeMultilingual(audio);
      if (!whole) return null;
      return finish(input, [
        {
          speaker: 'unknown',
          startMs: 0,
          endMs: Math.round(input.durationSeconds * 1000),
          language: whole.language,
          text: whole.text,
        },
      ]);
    }

    const segments: TranscriptSegment[] = [];
    // Carried forward so a one-word "ok" inherits the language of whatever was
    // being spoken a moment ago instead of coin-flipping on its own.
    let lastConfident: string | undefined;

    for (const [index, utterance] of utterances.entries()) {
      const clip = path.join(workdir, `u${index}.wav`);
      const speaker = speakerFor(utterance.channel, channels);
      const seconds = (utterance.endMs - utterance.startMs) / 1000;

      try {
        await extractUtterance(source, utterance, channels, clip);
      } catch (err) {
        console.warn('[transcript] could not extract utterance', {
          index,
          error: err instanceof Error ? err.message : String(err),
        });
        continue;
      }

      const { candidates, fallback } = candidatesFor(speaker);
      // Too short to carry grammar worth scoring. Inheriting whatever was last
      // spoken with confidence beats a coin flip: people switch language
      // between thoughts, not between "oui" and the sentence it answers.
      const inherited =
        seconds < config.transcription.minScoreableSeconds ? lastConfident : undefined;
      const result = await transcribeWavFileMultilingual(clip, candidates, fallback, inherited);

      await rm(clip, { force: true }).catch(() => {});
      if (!result?.text) continue;

      if (result.confident) lastConfident = result.language;

      segments.push({
        speaker,
        startMs: utterance.startMs,
        endMs: utterance.endMs,
        language: result.language,
        text: result.text,
      });
    }

    if (segments.length === 0) return null;
    return finish(input, segments);
  } catch (err) {
    console.error('[transcript] failed', {
      recordingSid: input.recordingSid,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    if (workdir) await rm(workdir, { recursive: true, force: true }).catch(() => {});
  }
}

function finish(input: TranscribeInput, segments: TranscriptSegment[]): CallTranscript {
  const spoken = new Map<string, number>();
  for (const segment of segments) {
    spoken.set(segment.language, (spoken.get(segment.language) ?? 0) + segment.text.length);
  }

  return {
    recordingSid: input.recordingSid,
    callSid: input.callSid,
    key: input.key,
    from: input.from,
    to: input.to,
    employeeId: input.employeeId,
    direction: input.direction,
    durationSeconds: input.durationSeconds,
    transcribedAt: new Date().toISOString(),
    languages: [...spoken.entries()].sort((a, b) => b[1] - a[1]).map(([lang]) => lang),
    segments,
    // Speaker-prefixed so the flat form is still readable as a conversation.
    text: segments.map((s) => `[${s.speaker}] ${s.text}`).join('\n'),
  };
}

/**
 * Transcribes and stores, returning the transcript key.
 *
 * Stored through the same driver as the audio so both live and expire
 * together: a retention sweep that removed the recording but left its
 * transcript would leave the most sensitive part of the call behind.
 */
export async function transcribeAndStore(
  store: RecordingStore,
  input: TranscribeInput,
): Promise<{ key: string; transcript: CallTranscript; summary?: CallSummary } | null> {
  const transcript = await transcribeRecording(store, input);
  if (!transcript) return null;

  const key = transcriptKey(input.key);
  const body = Buffer.from(JSON.stringify(transcript, null, 2), 'utf8');

  await store.put(key, body, {
    contentType: 'application/json',
    recordingSid: input.recordingSid,
    callSid: input.callSid,
    kind: 'transcript',
  });

  console.log('[transcript] stored', {
    key,
    segments: transcript.segments.length,
    languages: transcript.languages,
    chars: transcript.text.length,
  });

  // The summary is an enrichment on top of a record that is already safe. A
  // failing agent, or one that is simply switched off, must not cost us the
  // transcript we just wrote.
  let summary: CallSummary | undefined;
  try {
    summary = (await summariseAndStore(store, transcript))?.summary;
  } catch (err) {
    console.error('[summary] failed, transcript kept', {
      recordingSid: input.recordingSid,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return { key, transcript, summary };
}
