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

    // How long the employee's phone rings before voicemail takes over.
    // Roughly two or three rings at 13s.
    ringSeconds: Number(process.env.RING_SECONDS ?? 13),

    // Voicemail. A business line that hangs up on an unanswered call is worse
    // than no line at all.
    voicemailEnabled: flag('VOICEMAIL_ENABLED', true),
    voicemailMaxSeconds: Number(process.env.VOICEMAIL_MAX_SECONDS ?? 180),
    // Employees are told by SMS: a business-initiated WhatsApp outside the
    // 24h window would need an approved template, which does not exist yet.
    notifyBySms: flag('VOICEMAIL_NOTIFY_SMS', true),
    smsFrom: process.env.TWILIO_SMS_FROM ?? '',
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
    language: process.env.WHISPER_LANGUAGE ?? 'en',
    timeoutMs: Number(process.env.WHISPER_TIMEOUT_MS ?? 300_000),
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
    systemPrompt:
      process.env.HERMES_SYSTEM_PROMPT ??
      'Tu es l assistant WhatsApp de DSS Multiservices, entreprise de services aux ' +
        'immeubles au Quebec. Reponds dans la langue du client (francais ou anglais), ' +
        'brievement et par messages courts adaptes a WhatsApp. Si tu ne sais pas, ' +
        'dis-le et propose un rappel telephonique.',
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

if (config.twilio.skipSignatureValidation) {
  console.warn(
    '[config] SIGNATURE VALIDATION IS DISABLED. Anyone who can reach this ' +
      'service can forge recording callbacks and trigger Twilio deletes. ' +
      'Local development only.',
  );
}
