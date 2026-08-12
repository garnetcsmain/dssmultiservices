import { applyOverrides, voiceTable } from './voices.js';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function flag(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

const storageDriver = (process.env.STORAGE_DRIVER ?? 'local') as 'local' | 'gcs';
if (storageDriver !== 'local' && storageDriver !== 'gcs') {
  throw new Error(`STORAGE_DRIVER must be "local" or "gcs", got "${storageDriver}"`);
}

/**
 * The numbers verification robots call from.
 *
 * Both confirmed against real calls to `+1 438 500 6595`, not guessed:
 *   +1 860 724 2481  Meta - WhatsApp registration
 *   +1 867 794 2309  Intuit - QuickBooks two-step verification
 *
 * A call from one of these is answered by the capture path instead of being
 * routed to a person. That branch is the only way a code reaches anyone at
 * all: Twilio redacts inbound verification SMS and fails it with error 30038,
 * so voice is not a convenience here, it is the sole delivery channel.
 *
 * Overridable so a new service - or a robot that changes its caller ID - is an
 * env edit rather than a deploy.
 */
const DEFAULT_OTP_CALLERS = '+18607242481,+18677942309';

function numberList(raw: string): string[] {
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

const voiceTier = process.env.VOICE_TIER ?? 'generative';
const voices = applyOverrides(voiceTable(voiceTier), process.env.VOICE_OVERRIDES ?? '');

export const config = {
  port: Number(process.env.PORT ?? 8080),
  publicBaseUrl: required('PUBLIC_BASE_URL').replace(/\/$/, ''),

  twilio: {
    accountSid: required('TWILIO_ACCOUNT_SID'),
    authToken: required('TWILIO_AUTH_TOKEN'),
    skipSignatureValidation: flag('SKIP_SIGNATURE_VALIDATION'),
  },

  storage: {
    driver: storageDriver,
    localRoot: process.env.LOCAL_STORAGE_ROOT ?? './recordings',
    gcsBucket: process.env.GCS_BUCKET ?? '',
    gcsKeyFile: process.env.GCS_KEY_FILE || undefined,
    retentionDays: Number(process.env.RETENTION_DAYS ?? 365),
  },

  voice: {
    // Who the line sounds like. See voices.ts - one generative voice carried
    // across all three languages, overridable without a deploy.
    tier: voiceTier,
    voices,

    playRecordingNotice: flag('PLAY_RECORDING_NOTICE', true),
    // Only for the one-off verification capture. Twilio transcription is the
    // $0.05/min service this architecture exists to avoid, but a single
    // 30-second OTP call costs about $0.03 and turns "play the audio back"
    // into "read the digits in the console".
    transcribeOtp: flag('TRANSCRIBE_OTP', false),

    // Meta's verification call is an IVR: it asks you to press a key before it
    // will read the code, and repeats the prompt twice before going quiet.
    // Measured from the 2026-08-09 recording, relative to answer:
    //   ~2.2s  prompt starts
    //   ~6.5s  first cycle ends -> 1s listening gap
    //   ~11.8s second cycle ends -> stays quiet, waiting for input
    // Pressing at ~7s lands in that first gap. Tunable without a code change,
    // because the prompt's wording and timing are Meta's to alter.
    otpDtmfDigits: process.env.OTP_DTMF_DIGITS ?? '0',
    otpDtmfDelaySeconds: Number(process.env.OTP_DTMF_DELAY_SECONDS ?? 7),

    // Who is recognised as a robot rather than a caller. See the constant.
    otpCallers: numberList(process.env.OTP_CALLER_NUMBERS ?? DEFAULT_OTP_CALLERS),

    // Copied on every captured code, on top of whoever the line already texts.
    // The point of putting an employee's verification on a DSS number is that
    // the company can see the code too; without someone here, the code reaches
    // only the employee and the number may as well have been their own.
    otpNotifyTo: numberList(process.env.OTP_NOTIFY_TO ?? ''),

    // How long the employee's phone rings before voicemail takes over.
    // 20s is four or five rings, and sits just under the ~20-25s at which
    // Rogers diverts to its own voicemail - past that the carrier answers
    // first, Twilio reports "completed", and the message lands somewhere we
    // never see. Do not raise this without re-measuring the divert.
    ringSeconds: Number(process.env.RING_SECONDS ?? 20),

    // Voicemail. A business line that hangs up on an unanswered call is worse
    // than no line at all.
    voicemailEnabled: flag('VOICEMAIL_ENABLED', true),
    voicemailMaxSeconds: Number(process.env.VOICEMAIL_MAX_SECONDS ?? 180),
    // Employees are told by SMS: a business-initiated WhatsApp outside the
    // 24h window would need an approved template, which does not exist yet.
    notifyBySms: flag('VOICEMAIL_NOTIFY_SMS', true),
    smsFrom: process.env.TWILIO_SMS_FROM ?? '',
  },

  /**
   * Menu answered before anyone's phone rings.
   *
   * Off by default on purpose. The straight-to-David flow above was tuned
   * against a live carrier - ring time sits just under Rogers' own voicemail
   * divert - and inserting a menu spends some of that budget. Turn it on
   * deliberately, then re-measure the divert.
   */
  ivr: {
    enabled: flag('IVR_ENABLED', false),
    /** Seconds to wait for a keypress before assuming a rotary phone or a confused caller. */
    gatherTimeoutSeconds: Number(process.env.IVR_GATHER_TIMEOUT ?? 6),
    /** How many times to repeat the menu before falling through to a human. */
    maxAttempts: Number(process.env.IVR_MAX_ATTEMPTS ?? 2),
  },

  /**
   * Public media hosting for outbound WhatsApp attachments.
   *
   * WhatsApp fetches media by URL, which means anything we send has to be
   * reachable from the public internet. Serving it straight out of the archive
   * would expose customer recordings, so links are HMAC-signed, scoped to a
   * single object and short-lived.
   */
  media: {
    /** Falls back to the admin token so a deployment cannot accidentally sign with "". */
    signingSecret: process.env.MEDIA_SIGNING_SECRET || process.env.ADMIN_TOKEN || '',
    ttlSeconds: Number(process.env.MEDIA_URL_TTL_SECONDS ?? 3600),
    /** Directory of files this service is willing to serve. Nothing outside it is reachable. */
    root: process.env.MEDIA_ROOT ?? './media',
    /** WhatsApp caps outbound media at 64MB; refuse earlier than the API does. */
    maxBytes: Number(process.env.MEDIA_MAX_BYTES ?? 64 * 1024 * 1024),
  },

  vonage: {
    apiKey: process.env.VONAGE_API_KEY ?? '',
    apiSecret: process.env.VONAGE_API_SECRET ?? '',
    signatureSecret: process.env.VONAGE_SIGNATURE_SECRET ?? '',
    whatsappNumber: process.env.VONAGE_WHATSAPP_NUMBER ?? '',
    // Required for production sending: the Messages API rejects Basic auth
    // once the number is linked to an application.
    applicationId: process.env.VONAGE_APPLICATION_ID ?? '',
    // Inline PEM wins over the file. A bind-mounted key has to satisfy the
    // container's uid, and the service deliberately runs as a non-root user
    // that does not match the host owner - the env var sidesteps that whole
    // problem. Literal \n are unescaped because .env cannot hold real ones.
    privateKey: (process.env.VONAGE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    privateKeyPath: process.env.VONAGE_PRIVATE_KEY_PATH ?? '',
    // Sandbox lets the whole send/receive path be exercised before a WhatsApp
    // Business Account exists. Same code, different host and from-number.
    messagesBaseUrl: process.env.VONAGE_MESSAGES_BASE_URL ?? 'https://api.nexmo.com',
    skipSignatureValidation: flag('VONAGE_SKIP_SIGNATURE_VALIDATION'),

    /**
     * Blue ticks. Cosmetic on a human account, load-bearing on an automated
     * one: without it a customer watches an undelivered-looking message for
     * however long the agent takes to think.
     */
    markRead: flag('WHATSAPP_MARK_READ', true),
    /** The "typing..." bubble. Vonage dismisses it after 25s or on our reply. */
    typingIndicator: flag('WHATSAPP_TYPING_INDICATOR', true),

    /**
     * Pull inbound photos, documents and voice notes onto our side.
     *
     * Vonage holds inbound media only briefly, so a message that is not
     * fetched now is gone. Archiving is also what makes the retention promise
     * true for attachments rather than only for call recordings.
     */
    downloadInboundMedia: flag('WHATSAPP_DOWNLOAD_MEDIA', true),
    /** Refuse oversized inbound media rather than buffering it into memory. */
    maxInboundBytes: Number(process.env.WHATSAPP_MAX_INBOUND_BYTES ?? 32 * 1024 * 1024),
    /**
     * Voice notes through whisper before Hermes sees them. This is the same
     * argument as call transcription: the agent cannot hear, and the local
     * model costs nothing per minute.
     */
    transcribeVoiceNotes: flag('WHATSAPP_TRANSCRIBE_VOICE_NOTES', true),
  },

  /**
   * Local speech-to-text. This is the "Hermes" step of the architecture: the
   * reason Twilio transcription is switched off everywhere else.
   */
  transcription: {
    enabled: flag('TRANSCRIPTION_ENABLED', false),
    whisperPath: process.env.WHISPER_CLI_PATH ?? 'whisper-cli',
    modelPath: process.env.WHISPER_MODEL_PATH ?? '',
    ffmpegPath: process.env.FFMPEG_PATH ?? 'ffmpeg',

    /**
     * Fallback language, used when nothing better is known and when the
     * multilingual pass cannot tell the candidates apart.
     */
    language: process.env.WHISPER_LANGUAGE ?? 'fr',

    /**
     * Languages a *customer* might speak. Clients use all three, so anything
     * coming from the outside - voicemail, WhatsApp voice notes - is
     * transcribed once per candidate and the best result is chosen by scoring
     * the text. See language.ts for why the audio-side detector is not used.
     *
     * Set this to a single language to skip the extra passes entirely.
     */
    clientLanguages: (process.env.WHISPER_CLIENT_LANGUAGES ?? 'fr,en,es')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),

    /**
     * Language the *staff* speak, which is not the same question. DSS
     * employees are mostly Spanish-speaking while their customers are not, so
     * the employee side of a call has a known answer and needs no guessing.
     *
     * Only useful once dual-channel recordings are transcribed per channel -
     * see the note in the call archive. Downmixed audio mixes both sides and
     * neither setting fits.
     */
    employeeLanguage: process.env.WHISPER_EMPLOYEE_LANGUAGE ?? 'es',

    /**
     * Meta's verification robot reads digits in English and nothing else.
     * Pinned rather than guessed: this path exists to extract a six-digit
     * code, and a French pass over an English robot would mangle the numbers.
     */
    otpLanguage: process.env.WHISPER_OTP_LANGUAGE ?? 'en',

    /**
     * Below which score the multilingual pass admits it cannot tell and falls
     * back. Short utterances ("oui", "ok") carry no grammar to measure.
     */
    languageMinScore: Number(process.env.WHISPER_LANGUAGE_MIN_SCORE ?? 0.04),
    timeoutMs: Number(process.env.WHISPER_TIMEOUT_MS ?? 300_000),

    /**
     * Transcribe answered calls, not only voicemail.
     *
     * Every conversation is meant to end up as text - for the record, and as
     * material for whatever reads it downstream. Off by default because it is
     * the expensive path: a call is transcribed per utterance and per
     * candidate language, so a long bilingual call is a lot of local CPU.
     */
    transcribeCalls: flag('TRANSCRIBE_CALLS', false),

    /**
     * Silence detection, which is what makes per-utterance language possible.
     *
     * -35 dB and 0.6s were read off real recordings from the 450 line. Twilio
     * dual-channel audio is quiet on the inactive side but not digitally
     * silent - the other party bleeds across at around -47 dB - so the
     * threshold has to sit between the two.
     */
    silenceThresholdDb: Number(process.env.WHISPER_SILENCE_DB ?? -35),
    silenceMinSeconds: Number(process.env.WHISPER_SILENCE_MIN_SECONDS ?? 0.6),
    /** Shorter bursts are breaths and crosstalk; transcribing them invents text. */
    minUtteranceSeconds: Number(process.env.WHISPER_MIN_UTTERANCE_SECONDS ?? 0.8),
    /** Natural speech pauses. Cutting on every one leaves whisper no context. */
    maxGapSeconds: Number(process.env.WHISPER_MAX_GAP_SECONDS ?? 0.8),
    /**
     * Past this, give up on segmenting and transcribe the file whole. A worse
     * transcript beats an unbounded pile of whisper invocations.
     */
    maxUtterances: Number(process.env.WHISPER_MAX_UTTERANCES ?? 200),
    /**
     * Below this length an utterance carries no grammar to score, so it
     * inherits the language of the conversation so far rather than guessing.
     */
    minScoreableSeconds: Number(process.env.WHISPER_MIN_SCOREABLE_SECONDS ?? 2.5),

    /**
     * How an utterance's language gets decided.
     *
     *   'score' - transcribe once per candidate and grade the output text.
     *             Three times the work, and the only thing that worked against
     *             the base model, whose detector was confidently wrong.
     *   'auto'  - one pass, trusting whisper's own detection. Two thirds
     *             cheaper, and viable now that the model is large-v3-turbo.
     *
     * Throughput is the reason this is a knob: at 13x realtime a three-minute
     * call is forty minutes of CPU, and this is the single largest lever on it.
     */
    languageStrategy: (process.env.WHISPER_LANGUAGE_STRATEGY ?? 'score') as 'score' | 'auto',
    /** Below this detection probability, 'auto' defers rather than guessing. */
    autoMinProbability: Number(process.env.WHISPER_AUTO_MIN_PROBABILITY ?? 0.6),

    /**
     * Group consecutive turns from one speaker into a single whisper call.
     * 0 disables it, which is the default, and the reason is measured.
     *
     * The saving is real: whisper encodes a 30-second window whatever you hand
     * it - ~14.4s of encode for a 5-second clip - so short utterances pay for
     * time they never use. Packing the reference call at 28s took it from 616s
     * to 347s, a 44% cut.
     *
     * It also cost accuracy, on the one turn that mattered. Unpacked, the agent
     * side came back as "Ok. J'ai besoin de savoir c'est quoi le..." and
     * "S-F-C". Packed, those merged into a single Spanish-scored blob that
     * degenerated into "Se puede saber que se puede saber que se puede saber".
     *
     * Transcript accuracy is the priority here and a late summary is
     * acceptable, so this stays off. Turn it on only if throughput starts to
     * matter more than getting the words right.
     */
    packSeconds: Number(process.env.WHISPER_PACK_SECONDS ?? 0),

    /**
     * Threads per whisper invocation. Measured on maple's 12 cores against the
     * reference call: 4 (the default) took 44.7s, 8 took 35.0s, and 12 took
     * 41.6s - past 8 it contends with everything else on the box rather than
     * going faster.
     */
    threads: Number(process.env.WHISPER_THREADS ?? 8),

    /**
     * Vocabulary hint fed to whisper as its initial prompt.
     *
     * The failure this addresses is real and was observed on the reference
     * call: someone asked about the "Fonds des services de santé" and got back
     * "fonds de salubrité santé". Domain terms, acronyms and Quebec street
     * names are exactly what a general model has least reason to know, and
     * exactly what a building-services company says all day.
     *
     * Split per language on purpose. A French glossary attached to the Spanish
     * pass would bias that pass toward French, and the whole language decision
     * downstream is made by comparing those passes - so a shared French prompt
     * would quietly rig the comparison. Only the shared entry holds things that
     * are language-neutral: names, acronyms, streets.
     *
     * Known risk, which is why it is measurable and switchable: an initial
     * prompt can bleed into the transcript on unclear audio, with the model
     * emitting glossary terms nobody said. Keep the list short and specific.
     */
    prompt: process.env.WHISPER_PROMPT
      ?? 'DSS Multiservices, CNESST, RBQ, FSS, Revenu Quebec, Sherbrooke, Montreal, Laval, Longueuil.',
    promptByLanguage: {
      fr: process.env.WHISPER_PROMPT_FR
        ?? 'Fonds des services de sante, salubrite, copropriete, syndicat de copropriete, '
          + 'concierge, entretien menager, deneigement, gicleurs, chauffe-eau, sous-sol, degat d eau.',
      en: process.env.WHISPER_PROMPT_EN
        ?? 'Health services fund, sanitation, condo board, janitorial, snow removal, '
          + 'sprinklers, water heater, basement, water damage.',
      es: process.env.WHISPER_PROMPT_ES
        ?? 'Fondo de servicios de salud, salubridad, condominio, conserje, limpieza, '
          + 'retiro de nieve, rociadores, calentador de agua, sotano, dano por agua.',
    } as Record<string, string>,

    /**
     * Shortest utterance the vocabulary hint is allowed near.
     *
     * Measured A/B on the reference call, same audio, same model, the hint the
     * only variable. On the substantial utterances it helped: "le service de
     * santé" became "les services de santé" and "les fonds de" became "les
     * fonds des", moving toward the "Fonds des services de santé" that was
     * actually being asked about; a French sentence that had been coming back
     * as Spanish with French leaking through came back as French.
     *
     * On one-second filler it did damage: "Merci" became "Ayo", "Ok, ya,
     * tranquille" became "Ok, ja, trenquemos". The mechanism is not mysterious.
     * On a 1.2s clip the prompt is most of the context the model has, so it
     * stops being a hint and starts being the evidence. On an eight-second one
     * it is one signal among many.
     *
     * So the hint is spent where there is enough audio to argue with it. Set to
     * 0 to apply it everywhere, or clear WHISPER_PROMPT* to switch it off.
     */
    promptMinSeconds: Number(process.env.WHISPER_PROMPT_MIN_SECONDS ?? 2.5),

    /** How many untranscribed recordings one backlog sweep will take on. */
    sweepLimit: Number(process.env.WHISPER_SWEEP_LIMIT ?? 5),
    /** Minutes between backlog sweeps. */
    sweepIntervalMinutes: Number(process.env.WHISPER_SWEEP_INTERVAL_MINUTES ?? 30),

    /**
     * Have Hermes summarise each transcript and pull out the follow-ups.
     *
     * A transcript is a record; a summary is what makes it usable. Costs one
     * agent completion per call, which is the line item on this project most
     * likely to surprise - every summary logs its token counts.
     */
    summariseCalls: flag('SUMMARISE_CALLS', false),
    /** Below this, the transcript is already shorter than any summary of it. */
    summaryMinChars: Number(process.env.SUMMARY_MIN_CHARS ?? 120),
  },

  /**
   * Hermes acts as the brain behind this service. Empty webhookUrl leaves the
   * bridge dormant: messages are still received and logged, just not answered.
   */
  hermes: {
    enabled: flag('HERMES_BRAIN_ENABLED', false),
    apiUrl: process.env.HERMES_API_URL ?? '',
    apiKey: process.env.HERMES_API_KEY ?? '',
    model: process.env.HERMES_MODEL ?? 'hermes-agent',
    // Empty list answers everyone. Populate it while testing so a live number
    // does not run the agent for strangers.
    allowedUsers: (process.env.HERMES_ALLOWED_USERS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    // Hermes configures itself; this is the one prompt we own, so the
    // directive vocabulary is documented here rather than on its side.
    systemPrompt:
      process.env.HERMES_SYSTEM_PROMPT ??
      [
        "Tu es Esperancita, l'assistante WhatsApp de DSS Multiservices, entreprise de",
        'services aux immeubles au Québec. Réponds dans la langue du client (français,',
        'anglais ou espagnol), brièvement et par messages courts adaptés à WhatsApp.',
        "Si tu ne sais pas, dis-le et propose un rappel téléphonique.",
        '',
        'Tu peux envoyer autre chose que du texte en plaçant des directives en début de',
        'ligne. Chaque directive part seule sur sa ligne; tout le reste est envoyé comme',
        'un message texte normal.',
        '',
        '  ::react 👍              réagir au message reçu',
        '  ::unreact               retirer ta réaction',
        '  ::reply                 citer le message reçu dans ta réponse',
        '  ::image <url> | légende',
        '  ::video <url> | légende',
        '  ::file <url> | nom.pdf',
        '  ::audio <url>           note vocale',
        '  ::sticker <url>         .webp uniquement',
        '  ::call                  proposer un appel vers la ligne DSS',
        '',
        "N'utilise que des URLs https publiques, ou des fichiers déjà déposés dans le",
        'dossier média du service. Ne fabrique jamais une URL.',
      ].join('\n'),
    // An agent round trip is far slower than an HTTP call; this is a ceiling
    // against a hung run, not an expected duration.
    timeoutMs: Number(process.env.HERMES_TIMEOUT_MS ?? 180_000),
  },

  /** Guards the manual-send endpoint, which can originate billable traffic. */
  adminToken: process.env.ADMIN_TOKEN ?? '',
} as const;

if (config.transcription.enabled && !config.transcription.modelPath) {
  throw new Error('TRANSCRIPTION_ENABLED=1 requires WHISPER_MODEL_PATH');
}

export const whatsappConfigured =
  config.vonage.apiKey !== '' &&
  config.vonage.apiSecret !== '' &&
  config.vonage.whatsappNumber !== '';

if (config.storage.driver === 'gcs' && !config.storage.gcsBucket) {
  throw new Error('STORAGE_DRIVER=gcs requires GCS_BUCKET');
}

if (whatsappConfigured && !config.vonage.signatureSecret && !config.vonage.skipSignatureValidation) {
  throw new Error(
    'Vonage is configured but VONAGE_SIGNATURE_SECRET is unset. Inbound webhooks ' +
      'would be unverifiable. Set the secret, or set VONAGE_SKIP_SIGNATURE_VALIDATION=1 ' +
      'for sandbox testing only.',
  );
}

/**
 * Serving media is opt-in by having a secret, not by a flag. An unsigned
 * public file endpoint on a host that also stores customer recordings is not
 * something to leave one typo away from being enabled.
 */
export const mediaHostingEnabled = config.media.signingSecret !== '';

if (!mediaHostingEnabled) {
  console.warn(
    '[config] MEDIA_SIGNING_SECRET unset - outbound attachments are limited to ' +
      'URLs that are already public. Local files cannot be sent.',
  );
}

if (config.twilio.skipSignatureValidation) {
  console.warn(
    '[config] SIGNATURE VALIDATION IS DISABLED. Anyone who can reach this ' +
      'service can forge recording callbacks and trigger Twilio deletes. ' +
      'Local development only.',
  );
}
