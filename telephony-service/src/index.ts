import express from 'express';
import { config, whatsappConfigured, mediaHostingEnabled } from './config.js';
import { createStore } from './storage/index.js';
import { createRoutes } from './routes/voice.js';
import { createSmsRoutes } from './routes/sms.js';
import { createWhatsAppRoutes } from './routes/whatsapp.js';
import { createMediaRoutes } from './routes/media.js';
import { sweepRetention } from './pipeline/archive.js';
import { sweepTranscripts } from './pipeline/transcript.js';
import { hermesHealth } from './hermes.js';

const store = await createStore();
const app = express();

app.disable('x-powered-by');

// Twilio posts form-encoded. The raw body must be parsed before signature
// validation runs, since the signature is computed over the sorted params.
// Vonage posts JSON and parses its own body inside its router, so this is
// scoped to the Twilio paths rather than applied globally.
app.use('/webhooks/twilio', express.urlencoded({ extended: false }));

app.use(createRoutes(store));
app.use(createSmsRoutes(store));

// Mounted only when Vonage credentials are present, so a voice-only
// deployment does not expose message endpoints that cannot work.
if (whatsappConfigured) {
  app.use(createWhatsAppRoutes(store));
} else {
  console.warn('[boot] Vonage not configured - WhatsApp routes not mounted');
}

// Only mounted when there is a secret to sign with. An unauthenticated public
// file endpoint should require a deliberate act to exist, not a default.
if (mediaHostingEnabled) {
  app.use(createMediaRoutes());
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[http] unhandled error', err);
  res.status(500).type('text/plain').send('Internal error');
});

const server = app.listen(config.port, () => {
  console.log('[boot] dss-telephony listening', {
    port: config.port,
    store: store.name,
    publicBaseUrl: config.publicBaseUrl,
    retentionDays: config.storage.retentionDays,
    recordingNotice: config.voice.playRecordingNotice,
    voice: {
      tier: config.voice.tier,
      fr: config.voice.voices.fr.voice,
      en: config.voice.voices.en.voice,
      es: config.voice.voices.es.voice,
    },
    ivr: config.ivr.enabled ? `on, ${config.ivr.maxAttempts} attempts` : 'off',
    media: mediaHostingEnabled ? config.media.root : 'disabled',
    whatsapp: whatsappConfigured
      ? { from: config.vonage.whatsappNumber, api: config.vonage.messagesBaseUrl }
      : 'disabled',
  });

  // Probed at boot so a misconfigured bridge shows up now rather than as
  // silence the first time a customer writes in.
  void hermesHealth().then((status) =>
    console.log('[boot] hermes bridge', {
      enabled: config.hermes.enabled,
      url: config.hermes.apiUrl || '(unset)',
      allowlist: config.hermes.allowedUsers.length || 'everyone',
      health: status,
    }),
  );
});

// Daily retention sweep. Cheap enough to run in-process at this scale; move it
// to a scheduled job if this service ever runs more than one instance, so two
// replicas do not sweep concurrently.
const DAY_MS = 86_400_000;
const sweepTimer = setInterval(() => {
  sweepRetention(store).catch((err) => console.error('[retention] sweep failed', err));
}, DAY_MS);
sweepTimer.unref();

// Transcription is fired detached from the webhook, so a restart or a whisper
// failure mid-run leaves a recording archived and silently untranscribed. This
// finds those: a .wav with no .transcript.json beside it is the backlog.
const transcriptTimer = setInterval(
  () => {
    sweepTranscripts(store).catch((err) => console.error('[transcript] sweep failed', err));
  },
  config.transcription.sweepIntervalMinutes * 60_000,
);
transcriptTimer.unref();

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`[shutdown] ${signal} received`);
    server.close(() => process.exit(0));
  });
}
