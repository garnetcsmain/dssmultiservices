import { Router } from 'express';
import twilio from 'twilio';
import { config } from '../config.js';
import { validateTwilioSignature, downloadRecording, sendSms } from '../twilio.js';
import { transcribeAudio, extractVerificationCode } from '../transcribe.js';
import { transcribeAndStore } from '../pipeline/transcript.js';
import { archiveRecording, type RecordingEvent } from '../pipeline/archive.js';
import type { RecordingStore } from '../storage/index.js';
import { lookupByNumber, type DirectoryEntry } from '../directory.js';
import { say, renderMenu, parseLang, languageFor, isLanguageKey, PROMPTS } from '../ivr.js';
import type { Lang } from '../voices.js';

const { VoiceResponse } = twilio.twiml;

/**
 * Bridges the caller to the employee behind a dialed number.
 *
 * Shared by the direct path and the IVR, so both record the same way and both
 * land on the same dial-status handler. The language rides along in the action
 * url because the voicemail prompt on the other side has to match what the
 * caller has been hearing.
 */
function bridgeToEmployee(
  response: InstanceType<typeof VoiceResponse>,
  dialed: string,
  employee: DirectoryEntry,
  lang: Lang,
): void {
  // record-from-answer-dual gives stereo with caller and agent on separate
  // channels, which is what makes diarization tractable for Hermes later.
  const dial = response.dial({
    record: 'record-from-answer-dual',
    recordingStatusCallback: `${config.publicBaseUrl}/webhooks/twilio/recording-status`,
    recordingStatusCallbackEvent: ['completed'],
    callerId: dialed,
    timeout: config.voice.ringSeconds,
    // Without an action, an unanswered call just falls off the end of the
    // document and hangs up on the customer. This is what makes voicemail
    // possible at all.
    action: `${config.publicBaseUrl}/webhooks/twilio/dial-status?lang=${lang}`,
    method: 'POST',
  });
  dial.number(employee.forwardTo);
}

/** Plays the apology and records a message. Shared by the IVR and dial-status. */
function offerVoicemail(
  response: InstanceType<typeof VoiceResponse>,
  lang: Lang,
  options: { apologise: boolean },
): void {
  if (options.apologise) say(response, lang, PROMPTS[lang].unavailable);
  say(response, lang, PROMPTS[lang].voicemailPrompt);

  response.record({
    maxLength: config.voice.voicemailMaxSeconds,
    playBeep: true,
    trim: 'trim-silence',
    action: `${config.publicBaseUrl}/webhooks/twilio/voicemail?lang=${lang}`,
    method: 'POST',
    // Caller hangs up rather than pressing a key, which is what almost
    // everyone actually does.
    finishOnKey: '#',
  });
  // Reached only if the caller leaves nothing at all.
  response.hangup();
}

/**
 * Fetches the verification recording and prints the code to the log.
 *
 * Twilio needs a moment before recording media is fetchable, so this retries
 * briefly rather than failing on the first 404.
 */
async function reportOtpCode(mediaUrl: string, recordingSid: string): Promise<void> {
  try {
    let wav: Buffer | undefined;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        wav = await downloadRecording(mediaUrl);
        break;
      } catch (err) {
        if (attempt === 4) throw err;
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }

    // Meta's robot reads digits in English. Pinned rather than guessed - a
    // French pass over English numerals is exactly how a code gets mangled.
    const transcript = await transcribeAudio(wav!, config.transcription.otpLanguage);
    if (!transcript) {
      console.warn('[otp] no transcript - play the recording manually', { recordingSid });
      return;
    }

    const code = extractVerificationCode(transcript);
    console.log('[otp] ===================================');
    console.log('[otp] CODE:', code ?? '(no 6-digit run found)');
    console.log('[otp] transcript:', transcript.slice(0, 200));
    console.log('[otp] ===================================');
  } catch (err) {
    console.error('[otp] could not transcribe verification call', {
      recordingSid,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Archives a voicemail, transcribes it, and tells the employee it exists.
 *
 * A voicemail nobody is told about is the same as a hang-up, so the SMS is the
 * point of this function - the archive is bookkeeping.
 *
 * Runs inline rather than detached, unlike the answered-call path: Twilio has
 * already been sent its TwiML and hung up, and the SMS depends on the
 * transcript, so there is nothing to race.
 */
async function handleVoicemail(
  store: RecordingStore,
  body: Record<string, string>,
): Promise<void> {
  const recordingSid = body.RecordingSid!;
  const from = body.From ?? 'unknown';
  const seconds = Number(body.RecordingDuration ?? 0);
  const employee = lookupByNumber(body.To ?? '');

  console.log('[voicemail] received', { recordingSid, from, seconds });

  // Archive first, then transcribe out of our own store. This used to run the
  // other way round - transcribe from Twilio, then archive - because archival
  // deletes the Twilio copy and would otherwise leave nothing to transcribe.
  // Reading the archive back removes that ordering hazard, and means the
  // transcript can be regenerated later from the same source.
  const outcome = await archiveRecording(store, {
    recordingSid,
    callSid: body.CallSid ?? '',
    mediaUrl: body.RecordingUrl!,
    durationSeconds: seconds,
    channels: 1,
    employeeId: employee?.employeeId,
  });
  console.log('[voicemail] archived', { recordingSid, status: outcome.status });

  let transcript: string | null = null;
  if (outcome.status !== 'failed') {
    const result = await transcribeAndStore(store, {
      recordingSid,
      callSid: body.CallSid ?? '',
      key: outcome.key,
      from,
      to: body.To,
      employeeId: employee?.employeeId,
      direction: 'voicemail',
      durationSeconds: seconds,
    });
    if (result) {
      transcript = result.transcript.text;
      console.log('[voicemail] transcript', {
        recordingSid,
        languages: result.transcript.languages,
        text: transcript,
      });
    }
  }

  if (!config.voice.notifyBySms || !employee?.forwardTo) return;
  if (!config.voice.smsFrom) {
    console.warn('[voicemail] TWILIO_SMS_FROM unset - nobody will be told', { recordingSid });
    return;
  }

  const lines = [
    `Message vocal DSS (${seconds}s)`,
    `De: ${from}`,
    transcript ? `\n${transcript.slice(0, 900)}` : '\n(transcription indisponible)',
  ];
  try {
    const sid = await sendSms(employee.forwardTo, lines.join('\n'));
    console.log('[voicemail] employee notified', { to: employee.forwardTo, sid });
  } catch (err) {
    console.error('[voicemail] SMS notification failed', {
      to: employee.forwardTo,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export function createRoutes(store: RecordingStore): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, store: store.name, retentionDays: config.storage.retentionDays });
  });

  /**
   * Inbound voice. Announces recording, then bridges to the employee mapped
   * to the dialed number.
   *
   * The announcement is not decoration. Recording both legs of a call in
   * Quebec means notifying the caller of the recording and its purpose before
   * it starts; playing it inside <Dial> would be too late, so it goes first.
   */
  router.post('/webhooks/twilio/voice', validateTwilioSignature(), (req, res) => {
    const body = req.body as Record<string, string>;
    const dialed = body.To ?? '';
    const employee = lookupByNumber(dialed);

    const response = new VoiceResponse();
    const lang: Lang = 'fr';

    // A directory entry with no destination is as unroutable as no entry at
    // all, and bridging to an empty number would drop the call silently.
    if (!employee || !employee.forwardTo) {
      console.warn('[voice] no usable routing for dialed number', {
        dialed,
        reason: employee ? 'entry has empty forwardTo' : 'no directory entry',
      });
      say(response, lang, PROMPTS[lang].unassigned);
      response.hangup();
      res.type('text/xml').send(response.toString());
      return;
    }

    // The menu, when enabled, carries the recording notice itself - so it is
    // still heard before any bridge opens, which is what Quebec consent needs.
    if (config.ivr.enabled) {
      renderMenu(response, lang, 0, { greet: true, invalid: false });
      res.type('text/xml').send(response.toString());
      return;
    }

    // The announcement is not decoration. Recording both legs of a call in
    // Quebec means notifying the caller before it starts; playing it inside
    // <Dial> would be too late, so it goes first.
    if (config.voice.playRecordingNotice) {
      say(response, 'fr', PROMPTS.fr.recordingNotice);
      say(response, 'en', PROMPTS.en.recordingNotice);
    }

    bridgeToEmployee(response, dialed, employee, lang);
    res.type('text/xml').send(response.toString());
  });

  /**
   * Menu selection, and the retry loop behind it.
   *
   * Both the <Gather> action and its no-input <Redirect> point here, so a
   * caller who presses nothing arrives with no Digits and simply spends an
   * attempt. Past IVR_MAX_ATTEMPTS the menu stops repeating and the call goes
   * to a human - a caller with a dead keypad should still reach someone.
   */
  router.post('/webhooks/twilio/ivr', validateTwilioSignature(), (req, res) => {
    const body = req.body as Record<string, string>;
    const digit = (body.Digits ?? '').trim();
    const attempt = Number((req.query.attempt as string) ?? 0) || 0;
    let lang = parseLang(req.query.lang);

    const dialed = body.To ?? '';
    const employee = lookupByNumber(dialed);
    const response = new VoiceResponse();

    if (!employee?.forwardTo) {
      say(response, lang, PROMPTS[lang].unassigned);
      response.hangup();
      res.type('text/xml').send(response.toString());
      return;
    }

    // Language switch: re-read the menu in the new language rather than
    // treating it as a selection. Attempts reset - the caller did choose
    // something, they just chose to be spoken to differently.
    if (digit && isLanguageKey(digit, lang)) {
      lang = languageFor(digit, lang);
      console.log('[ivr] language changed', { callSid: body.CallSid, lang });
      renderMenu(response, lang, 0, { greet: false, invalid: false });
      res.type('text/xml').send(response.toString());
      return;
    }

    console.log('[ivr] selection', { callSid: body.CallSid, digit: digit || '(none)', lang, attempt });

    if (digit === '2') {
      offerVoicemail(response, lang, { apologise: false });
      res.type('text/xml').send(response.toString());
      return;
    }

    // 1, or a caller who has run out of attempts. Falling through to a person
    // is the safe default for every input we did not plan for.
    if (digit === '1' || !renderMenu(response, lang, attempt, { greet: false, invalid: Boolean(digit) })) {
      say(response, lang, PROMPTS[lang].connecting);
      bridgeToEmployee(response, dialed, employee, lang);
    }

    res.type('text/xml').send(response.toString());
  });

  /**
   * One-off capture endpoint for an automated verification call.
   *
   * Meta sends WhatsApp registration codes from short codes, and Twilio
   * long-code numbers cannot receive SMS from short codes - the message never
   * reaches the network at all, with no error to see. Voice is the only
   * delivery path that works, so this answers the call and records the robot
   * reading the digits.
   *
   * Deliberately does NOT set recordingStatusCallback: the archive pipeline
   * would upload and then delete the recording from Twilio, and the point here
   * is to leave it in the console where it can be played back.
   *
   * Point the number's voice URL here only while a verification is in flight,
   * then put it back. Any caller reaching this gets silently recorded, which
   * is not something to leave pointed at a customer-facing line.
   */
  router.post('/webhooks/twilio/otp', validateTwilioSignature(), (req, res) => {
    const body = req.body as Record<string, string>;
    const response = new VoiceResponse();

    // <Record> with no action re-requests THIS url when it finishes, which
    // would hand back another <Record> and loop until the caller hangs up.
    // The action request is the one carrying RecordingSid, so that field is
    // how we tell "call just arrived" from "recording just finished".
    if (body.RecordingSid) {
      console.log('[otp] recording finished', {
        recordingSid: body.RecordingSid,
        seconds: body.RecordingDuration,
      });

      // Hang up first, transcribe after. Whisper takes ~15s on a call this
      // length and Twilio expects TwiML promptly - blocking here would hold
      // the line open and risk a webhook timeout.
      if (body.RecordingUrl) void reportOtpCode(body.RecordingUrl, body.RecordingSid);

      response.hangup();
      res.type('text/xml').send(response.toString());
      return;
    }

    console.log('[otp] verification call received', {
      from: body.From,
      callSid: body.CallSid,
      willPress: config.voice.otpDtmfDigits,
      afterSeconds: config.voice.otpDtmfDelaySeconds,
    });

    // Wait out the spoken prompt, then send the DTMF it asked for. Recording
    // before pressing captures only the prompt - which is exactly what the
    // first attempt did, and why no code was ever read.
    response.pause({ length: config.voice.otpDtmfDelaySeconds });
    response.play({ digits: config.voice.otpDtmfDigits });

    // Only now does the code get read, so recording starts after the keypress.
    // No beep: an automated reader can be thrown off by one.
    response.record({
      maxLength: 90,
      playBeep: false,
      trim: 'do-not-trim',
      transcribe: config.voice.transcribeOtp,
    });
    res.type('text/xml').send(response.toString());
  });

  /**
   * Runs after <Dial> finishes. Twilio reports how the bridge ended.
   *
   * 'completed' means a human answered and the call is over, so there is
   * nothing left to say. Anything else - no-answer, busy, failed - means the
   * customer is still on the line hearing silence, and gets voicemail.
   */
  router.post('/webhooks/twilio/dial-status', validateTwilioSignature(), (req, res) => {
    const body = req.body as Record<string, string>;
    const outcome = body.DialCallStatus ?? 'unknown';
    const lang = parseLang(req.query.lang);
    const response = new VoiceResponse();

    if (outcome === 'completed' || !config.voice.voicemailEnabled) {
      console.log('[voice] call ended', { callSid: body.CallSid, outcome });
      response.hangup();
      res.type('text/xml').send(response.toString());
      return;
    }

    console.log('[voice] unanswered, offering voicemail', {
      callSid: body.CallSid,
      outcome,
      to: body.To,
    });

    offerVoicemail(response, lang, { apologise: true });
    res.type('text/xml').send(response.toString());
  });

  /**
   * A voicemail was left. Thank the caller, hang up, then deal with it.
   *
   * The archive and transcription run detached: Twilio is waiting on this
   * response with a live call attached, and whisper takes tens of seconds.
   */
  router.post('/webhooks/twilio/voicemail', validateTwilioSignature(), (req, res) => {
    const body = req.body as Record<string, string>;
    const lang = parseLang(req.query.lang);
    const response = new VoiceResponse();
    say(response, lang, PROMPTS[lang].voicemailThanks);
    response.hangup();
    res.type('text/xml').send(response.toString());

    if (!body.RecordingSid || !body.RecordingUrl) {
      console.warn('[voicemail] callback without a recording', { callSid: body.CallSid });
      return;
    }
    void handleVoicemail(store, body);
  });

  /**
   * Recording lifecycle callback.
   *
   * Responds 200 only when the recording is safely archived (or was already).
   * A non-2xx makes Twilio retry, which is what we want on failure - the
   * archive is idempotent, and the Twilio copy is still there to retry from.
   */
  router.post('/webhooks/twilio/recording-status', validateTwilioSignature(), async (req, res) => {
    const body = req.body as Record<string, string>;

    if (body.RecordingStatus !== 'completed') {
      res.status(204).end();
      return;
    }

    const recordingSid = body.RecordingSid;
    const mediaUrl = body.RecordingUrl;
    if (!recordingSid || !mediaUrl) {
      res.status(400).type('text/plain').send('Missing RecordingSid or RecordingUrl');
      return;
    }

    const employee = lookupByNumber(body.To ?? '');
    const event: RecordingEvent = {
      recordingSid,
      callSid: body.CallSid ?? '',
      mediaUrl,
      durationSeconds: Number(body.RecordingDuration ?? 0),
      channels: Number(body.RecordingChannels ?? 1),
      employeeId: employee?.employeeId,
    };

    const outcome = await archiveRecording(store, event);

    if (outcome.status === 'failed') {
      // 500 so Twilio retries. The recording is still on their side.
      res.status(500).json(outcome);
      return;
    }
    res.status(200).json(outcome);

    // Detached, and after the response: a bilingual call is transcribed per
    // utterance and per candidate language, which takes far longer than Twilio
    // will wait. Failure here must not turn an archived recording into a
    // retried webhook - the audio is already safe, and a transcript can always
    // be rebuilt from it later.
    if (config.transcription.transcribeCalls && outcome.status === 'archived') {
      void transcribeAndStore(store, {
        recordingSid,
        callSid: event.callSid,
        key: outcome.key,
        from: body.From,
        to: body.To,
        employeeId: employee?.employeeId,
        direction: 'call',
        durationSeconds: event.durationSeconds,
      }).catch((err) =>
        console.error('[transcript] call transcription failed', {
          recordingSid,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  });

  return router;
}
