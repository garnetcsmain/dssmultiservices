import { Router } from 'express';
import twilio from 'twilio';
import { config } from '../config.js';
import { validateTwilioSignature, downloadRecording, sendSms } from '../twilio.js';
import { transcribeAudio, extractVerificationCode } from '../transcribe.js';
import { transcribeAndStore } from '../pipeline/transcript.js';
import { archiveRecording, type RecordingEvent } from '../pipeline/archive.js';
import type { RecordingStore } from '../storage/index.js';
import {
  lookupByNumber,
  smsRecipients,
  sameNumber,
  type DirectoryEntry,
} from '../directory.js';
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

/** Whether this call is a verification robot rather than a person. */
export function isVerificationRobot(from: string): boolean {
  return config.voice.otpCallers.some((caller) => sameNumber(from, caller));
}

/**
 * Answers a verification robot: wait out its prompt, press the key it asks
 * for, then record what it dictates.
 *
 * Recording before pressing captures only the prompt - which is exactly what
 * the first attempt did, and why no code was ever read. No beep either: an
 * automated reader can be thrown off by one.
 *
 * The `action` is explicit rather than inherited. A `<Record>` with no action
 * re-requests whichever url produced it, and this document is now served from
 * the main voice route too - where a re-request would look like a fresh call
 * from the same robot and hand back another `<Record>`, forever.
 */
function captureVerificationCode(response: InstanceType<typeof VoiceResponse>): void {
  response.pause({ length: config.voice.otpDtmfDelaySeconds });
  response.play({ digits: config.voice.otpDtmfDigits });
  response.record({
    maxLength: 90,
    playBeep: false,
    trim: 'do-not-trim',
    transcribe: config.voice.transcribeOtp,
    action: `${config.publicBaseUrl}/webhooks/twilio/otp`,
    method: 'POST',
  });
}

/**
 * Texts a captured code to the people entitled to see it.
 *
 * A code that only reaches the container log requires someone to be watching
 * the container log, which is the same as not working. Sent from the main line
 * rather than the line that received it: the main line is `notify`, so a staff
 * member who replies to this message has their reply dropped instead of
 * relayed onward to whichever customer wrote in last.
 *
 * The transcript rides along whenever no code could be read, because a human
 * can nearly always see the digits in text that defeated the extractor.
 */
async function notifyOtpCode(
  dssNumber: string,
  code: string | null,
  transcript: string,
): Promise<void> {
  const entry = lookupByNumber(dssNumber);
  const recipients = [...new Set([...(entry ? smsRecipients(entry) : []), ...config.voice.otpNotifyTo])];

  if (recipients.length === 0) {
    console.warn('[otp] nobody to text the code to', { dssNumber });
    return;
  }
  if (!config.voice.smsFrom) {
    console.warn('[otp] TWILIO_SMS_FROM unset - code stays in the log');
    return;
  }

  const body = [
    `Code de vérification DSS (${dssNumber})`,
    code ? `Code: ${code}` : 'Code illisible - transcription ci-dessous',
    code ? '' : transcript.slice(0, 300),
  ]
    .filter(Boolean)
    .join('\n');

  for (const recipient of recipients) {
    try {
      const sid = await sendSms(recipient, body);
      console.log('[otp] code texted', { to: recipient, sid });
    } catch (err) {
      console.error('[otp] could not text the code', {
        to: recipient,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

/**
 * Fetches the verification recording, reads the code out of it, and hands it
 * to whoever is waiting for it.
 *
 * Twilio needs a moment before recording media is fetchable, so this retries
 * briefly rather than failing on the first 404.
 */
async function reportOtpCode(
  mediaUrl: string,
  recordingSid: string,
  dssNumber: string,
): Promise<void> {
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

    await notifyOtpCode(dssNumber, code, transcript);
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
    from,
    to: body.To,
    direction: 'voicemail',
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

    // A verification robot, not a customer - checked before anything else,
    // including whether the number is even in the directory.
    //
    // This is what makes the OTP path work unattended. It used to require
    // repointing the number's voice url at /webhooks/twilio/otp before the
    // code was requested and putting it back afterwards, which meant every
    // registration hung on someone remembering, and left the line silently
    // recording real callers in between. Recognising the caller costs neither.
    //
    // Caller ID is spoofable, so this is not a security boundary. The worst a
    // spoofer achieves is being recorded reading nothing to nobody.
    if (isVerificationRobot(body.From ?? '')) {
      console.log('[otp] verification call received', {
        from: body.From,
        to: dialed,
        callSid: body.CallSid,
        willPress: config.voice.otpDtmfDigits,
        afterSeconds: config.voice.otpDtmfDelaySeconds,
      });
      captureVerificationCode(response);
      res.type('text/xml').send(response.toString());
      return;
    }

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
   * Where a verification capture finishes, and a manual override when needed.
   *
   * Meta and Intuit both send verification codes by voice because the SMS
   * version never survives: Twilio redacts an inbound one-time code and fails
   * the message with error 30038, so it never reaches this service at all.
   * This route answers such a call and records the robot reading the digits.
   *
   * Normally nothing needs to be pointed here - `/webhooks/twilio/voice`
   * recognises the robot by its caller ID and serves the same document, whose
   * `action` lands the finished recording back on this route. Pointing a
   * number's voice url here directly still works, and is the escape hatch for
   * a service whose caller ID we have not seen yet. Do that only while a
   * verification is in flight: everyone reaching it is silently recorded,
   * which is not a state to leave a customer-facing line in.
   *
   * Deliberately does NOT set recordingStatusCallback: the archive pipeline
   * would upload and then delete the recording from Twilio, and the point here
   * is to leave it where it can be played back.
   */
  router.post('/webhooks/twilio/otp', validateTwilioSignature(), (req, res) => {
    const body = req.body as Record<string, string>;
    const response = new VoiceResponse();

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
      if (body.RecordingUrl) {
        void reportOtpCode(body.RecordingUrl, body.RecordingSid, body.To ?? '');
      }

      response.hangup();
      res.type('text/xml').send(response.toString());
      return;
    }

    console.log('[otp] verification call received', {
      from: body.From,
      to: body.To,
      callSid: body.CallSid,
      willPress: config.voice.otpDtmfDigits,
      afterSeconds: config.voice.otpDtmfDelaySeconds,
      via: 'manual override',
    });

    captureVerificationCode(response);
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
      from: body.From,
      to: body.To,
      direction: 'call',
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
