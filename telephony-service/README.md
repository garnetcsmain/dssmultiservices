# dss-telephony

> System shape, diagrams and the reasoning behind the design live in
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). This file is the operational
> side: configuration, runbooks, and how to redeploy.

Voice recording archival for DSS Multiservices. Twilio carries voice; recordings
are pulled off Twilio immediately, stored locally and/or in GCS, and transcribed
by Hermes rather than by Twilio.

**This is a standalone service.** It currently lives inside the website repo for
convenience during the initial build. Before it goes anywhere near production,
extract it: `git init` in this directory, push it to its own repo, and delete it
from `dss-multiservices`. A marketing site and a service holding customer call
audio should not share a deploy target or an access list.

## Why this exists

Twilio charges $0.05/min for transcription. At roughly 15,000 minutes/month that
is ~$780/month. Recording at $0.0025/min is ~$39/month. Doing the transcription
locally with Hermes and keeping only the recording fee is where effectively all
of the savings are — storage tier and provider are a rounding error by
comparison, single-digit dollars a month either way.

The thing that actually bounds long-run storage cost is `RETENTION_DAYS`, not
the driver you pick.

## The archive pipeline

`src/pipeline/archive.ts` runs: **download → store → verify → delete from Twilio.**

The verify step is not optional and the ordering is the point. Deleting the
Twilio copy right after the upload call returns is not the same as deleting it
after the upload is known good — a store that accepts a write and loses it, a
truncated transfer, or a half-written file would each turn into a permanently
destroyed customer call, with no copy anywhere. So the delete is gated on a
read-back whose size and SHA-256 match what we computed before writing.

On any failure the Twilio copy is left alone and the event is written to
`deadletter/` for replay, and the webhook returns 500 so Twilio retries.
Retaining a recording on Twilio costs $0.0005/GB/month; losing one costs a
recording.

`archiveRecording` is idempotent — Twilio retries callbacks, and a repeat event
for something already archived just re-confirms the Twilio-side delete.

## Security

Both webhooks require a valid `X-Twilio-Signature`. This is load-bearing rather
than hygiene: the recording callback deletes the Twilio-side copy, so an
unauthenticated endpoint would let anyone post a forged `completed` event for a
known RecordingSid and destroy the recording before it is ever archived.

The signature is computed over the exact URL Twilio called, so `PUBLIC_BASE_URL`
must match the Twilio console configuration exactly — scheme, host, and any path
prefix a proxy adds. A mismatch shows up as every webhook returning 403.

## Call recording consent

`PLAY_RECORDING_NOTICE=1` plays a bilingual FR/EN announcement before the call
is bridged. DSS operates in Quebec and this records both legs of every call;
under PIPEDA the caller must be told that the call is recorded and why, before
recording starts. Turning this off is a legal decision, not a technical one —
talk to whoever handles compliance rather than flipping the flag.

## Deployment (maple)

Runs as a Docker container on maple at `~/dss-telephony`, published through
Tailscale Funnel:

```
https://maple.tail661853.ts.net:10000  ->  127.0.0.1:8090  ->  container :8080
```

Port 8090 on the host because signal-cli already holds 8080. Funnel only allows
443, 8443 and 10000, and the first two were taken (n8n on 443, the Lupin webhook
on 8443), so 10000 is the only free one. The container binds loopback only —
Funnel proxies from localhost, and the archive should not be reachable from the
LAN as well.

whisper.cpp is compiled in a build stage rather than installed on maple, so the
host keeps its Node 18 and gains no build toolchain. The model is a read-only
volume (`./models`) rather than baked into the image, so it can be swapped
without a rebuild.

`~/dss-telephony` on maple is a **loose copy, not a git clone** — `git pull`
there does nothing. A deploy is an rsync followed by a rebuild:

```bash
rsync -a --delete --exclude='.env*' --exclude=node_modules --exclude=dist --exclude=dist-test --exclude=recordings --exclude=deadletter --exclude=models --exclude=media --exclude=.git ./ fsulbaran@maple:~/dss-telephony/
```

```bash
ssh fsulbaran@maple 'cd ~/dss-telephony && docker compose up -d --build'
```

Then confirm it, rather than assuming. The boot line should name the generative
voices, a `media` root and a healthy Hermes; the probe should print `writable`:

```bash
ssh fsulbaran@maple 'docker logs dss-telephony | head -20 && docker exec dss-telephony sh -c "touch /app/recordings/.probe && rm /app/recordings/.probe && echo writable"'
```

Rebuilds leave large dangling layers behind — 19 of them reached 35 GB. Prune
occasionally; it never touches the tagged image in use:

```bash
ssh fsulbaran@maple 'docker image prune -f'
```

### Watching a live call

```bash
ssh fsulbaran@maple 'docker logs -f dss-telephony'
```

An unanswered call should log, in order: `[voice] unanswered, offering
voicemail` with `outcome: no-answer`, then `[voicemail] received`, `[stt]
language chosen` with all three scores, `[voicemail] transcript`, `[voicemail]
archived`, `[voicemail] employee notified`.

The line to distrust is `[voice] call ended` with `outcome: completed` when
nobody actually answered. That is the carrier's own voicemail winning the race,
and it is indistinguishable from success in every log we keep — the only
reliable signal is whether the caller heard our greeting or the carrier's.

## Setup

```bash
cp .env.example .env   # fill in TWILIO_AUTH_TOKEN and PUBLIC_BASE_URL
npm install
npm run dev
```

Then point the Twilio number's voice webhook at
`POST {PUBLIC_BASE_URL}/webhooks/twilio/voice`. The recording callback is set by
the TwiML itself, so it needs no console configuration.

Add each provisioned number to `src/directory.ts`. A call to a number with no
directory entry gets an apology and a hangup rather than a dead bridge.

## Operating maple

Connect as **`fsulbaran`**, never as root:

```bash
ssh fsulbaran@maple
```

The account is in the `docker` group, so nothing here needs `sudo`. `noctis@` and
`freddy@` are refused by the tailnet ACL — that is a policy rule, not a failed
login, and retrying will not fix it.

Running Docker as root here has a specific, delayed cost: Compose creates
missing bind-mount directories as whoever ran it, so `sudo docker compose up`
leaves `recordings/` and `deadletter/` owned by `root:root` — and the container,
which drops to a non-root uid, then cannot write to either. Nothing complains
until the first real call, when archival fails and the dead-letter meant to
record that failure fails with it.

Set `SERVICE_UID`/`SERVICE_GID` in `.env` to the owner of `./recordings` (1000
for `fsulbaran` on maple). Check it before trusting a deploy:

```bash
docker exec dss-telephony sh -c 'touch /app/recordings/.probe && rm /app/recordings/.probe && echo writable'
```

## Tests

```bash
npm test
```

Covers the logic that has no provider on the other end: directive parsing,
media URL signing and path escape, IVR language routing, and inbound message
classification. Compiled first rather than type-stripped, because Node's
stripper does not rewrite the `.js` specifiers NodeNext requires.

Nothing here talks to Twilio, Vonage or Hermes — those paths are still verified
by hand against live services, which is the honest state of this repo.

## Storage

`STORAGE_DRIVER=local` writes to `LOCAL_STORAGE_ROOT`; `STORAGE_DRIVER=gcs`
writes to `GCS_BUCKET`. Both implement the same `RecordingStore` interface, so
switching is a config change.

Recommended shape: **local as the working copy Hermes transcribes from** (same
box, zero egress) **plus GCS Archive for retention.** Local alone is a single
point of failure once the Twilio copy is deleted — if you run local-only, run it
on redundant disk.

If you use GCS, set a bucket lifecycle rule (Standard → Nearline → Archive). At
DSS volume that is the difference between ~$11/month and well under $1.

## Decisions taken, and why

**Two WhatsApp numbers are required.** Not a preference — a platform limit.
Hermes' own help spells it out: `hermes whatsapp` is a Baileys bridge for
personal accounts paired by QR, `hermes whatsapp-cloud` is the official Business
Cloud API. Groups only exist on the personal side; the Business API is strictly
1:1 between a business and a customer. So:

| Number | Path | Purpose |
|---|---|---|
| `+1 450 235 8434` | Vonage → WABA | Official DSS line, 1:1 with customers |
| *(to be chosen)* | Baileys, QR-paired | Group ingestion feeding KAKU |

Baileys is an unofficial client. Meta bans numbers for it with no appeal, so the
second number must be one nobody minds losing — never the DSS main line.

**Vonage stays as BSP for now; migrating to Hermes' native `whatsapp-cloud` is
deferred, not rejected.** Rationale: setup was already done and works, so the
near-term goal is real cost data rather than a second migration. Revisit once
there is a month of billing to compare, because the original justification does
not hold — WhatsApp rates are set by Meta and apply across BSPs, so Vonage
competes on markup alone, and Hermes speaks Cloud API natively with no glue.
Until then this service is the adapter: Vonage webhook in, Hermes out, Vonage
send back.

**Host: maple, behind Tailscale Funnel.** Funnel is already enabled
(`https://maple.tail661853.ts.net`), which gives a stable public HTTPS URL with a
real certificate. That removes the quick-tunnel fragility and co-locates the
service with Hermes, so transcription never leaves the box.

## Voice: routing and voicemail

```
inbound -> recording notice -> <Dial> employee (20s, dual-channel)
                                |
              answered -> hang up|  unanswered -> voicemail
                                                    |
                      record -> transcribe locally -> archive -> SMS the employee
```

With `IVR_ENABLED=1` a menu comes first: **1** a person, **2** a message,
**9** English, **8** Spanish, **0** French. Off by default — the ring window
below was tuned against a live carrier and a menu spends some of it. A caller
who presses nothing twice is transferred rather than looped, and any
unrecognised key falls through to a human.

### Voices

One generative voice, `Chirp3-HD-Aoede`, in all three languages — the only
family carrying the same voice name across `fr-CA`, `en-US` and `es-US`, so the
line sounds like one person. `fr-CA` rather than `fr-FR` on purpose.

| Variable | Effect |
|---|---|
| `VOICE_TIER=neural` | Steps down to `Polly.Gabrielle-Neural` / `Joanna-Neural` / `Lupe-Neural`. Use this if generative voices are not enabled on the account — an unavailable voice does not fail loudly. |
| `VOICE_OVERRIDES=fr=Google.fr-CA-Chirp3-HD-Kore` | Swaps one language. Comma-separated; the locale is inferred from the voice id. |

| Variable | Default | |
|---|---|---|
| `RING_SECONDS` | `20` | Four or five rings. Sits under Rogers' ~20–25s divert; raising it means the carrier answers first and the voicemail is lost. |
| `IVR_ENABLED` | `0` | |
| `IVR_GATHER_TIMEOUT` | `6` | Seconds to wait for a keypress. |
| `IVR_MAX_ATTEMPTS` | `2` | Menu repeats before falling through to a human. |

`<Dial>` carries an `action` URL. Without one, an unanswered call falls off the
end of the TwiML document and hangs up on the customer — a business line that
drops callers is worse than no line.

Voicemail notification is SMS, not WhatsApp: a business-initiated WhatsApp
outside the customer's 24-hour window needs an approved template, and none
exists. SMS is about a cent and needs no approval.

Order inside `handleVoicemail` matters — transcription downloads the media and
archiving deletes the Twilio copy at the end, so archiving first would leave
nothing to transcribe.

### Why this lives here and not in the Twilio console

Twilio owns the number and the PSTN leg; the call logic is deliberately ours.
Twilio Studio could do "ring, then voicemail" with no server at all, but it
cannot download a recording, verify it, delete the Twilio copy, and transcribe
it locally — which is the entire cost argument. Choosing Studio would mean
paying Twilio for storage and $0.05/min for transcription.

## The Hermes bridge

`src/hermes.ts`. Inbound WhatsApp arrives from Vonage, this service activates
Hermes over its webhook platform, and the answer goes back out through Vonage.

Hermes' gateway owns messaging natively, but only for platforms it speaks —
Baileys or Meta Cloud API for WhatsApp, never Vonage. Keeping Vonage as BSP is
precisely why this bridge has to exist; going direct to Meta would delete it.

The route acks Vonage **before** calling Hermes. An agent run is far slower than
Vonage's patience, and a slow ack becomes a retry, which becomes a second agent
run and a duplicate reply. `claimMessage` suppresses duplicates on top of that,
bounded in memory — it defends against a retry burst, not a replay hours later.

`HERMES_BRAIN_ENABLED=0`, or an empty `HERMES_API_URL`, leaves the bridge
dormant — messages are still received, verified, archived and logged, just not
answered.

Contract confirmed against the live API (v0.20.0), not inferred:

```
POST {HERMES_API_URL}/v1/chat/completions
Authorization: Bearer {HERMES_API_KEY}
X-Hermes-Session-Id / X-Hermes-Session-Key: dss-wa-{digits(from)}
-> choices[0].message.content
```

The session headers must stay stable per contact — they carry transcript
continuity and long-term memory scope, so varying them starts a new
conversation on every message.

The inbound text is wrapped in an envelope that labels it untrusted, and the
routing metadata (from/to/uuid) is supplied by us rather than read out of the
message body — otherwise a customer could type `from: ...` and forge it.

`HERMES_ALLOWED_USERS` gates who gets an agent run at all. Empty answers
everyone, which is right for a public line and wrong while testing.

### Measured cost, and why it matters

First real exchange, one short customer question:

| | |
|---|---|
| Prompt tokens | **146,769** |
| Completion tokens | 897 |
| Latency | **31.4 s** |

That is per inbound message. Hermes' own probe of the same endpoint with
"no uses tools" came back at 20,561 prompt tokens, so roughly 7x of this is
tool and skill context being loaded into every customer reply.

This is worth taking seriously before the line opens: 500 messages a month at
this rate is ~73M prompt tokens. The entire point of the local-transcription
work was avoiding ~$780/month, and an unbounded agent context can eat that back
without anyone noticing. Restrict the toolset for this session, or route
WhatsApp at a cheaper model, and re-measure before customers can reach it.

31 seconds is also slow for a chat channel, and the two problems have the same
cause.

## Local transcription (the "Hermes" step)

`src/transcribe.ts` — whisper.cpp via `whisper-cli`, resampling 8 kHz Twilio
audio to the 16 kHz mono whisper requires. This is the piece the cost argument
rests on: it replaces the $0.05/min Twilio service that would run ~$780/month at
DSS volume.

Verified 2026-08-09 on a real 26-second Meta verification call — transcript
correct, code extracted, 0.7s warm. The OTP route now transcribes automatically
and prints the code to the log, after hanging up rather than before, since
whisper is slower than Twilio's webhook patience.

`transcribeWav` returns null on any failure instead of throwing. Transcription
is enrichment; call archival is the part that cannot be redone later, and must
not fail because a model path is wrong.

### Verified in the container (maple, 2026-08-09)

The WhatsApp path decodes OGG/Opus, not WAV, so it was exercised end to end
inside the running container rather than assumed:

| | |
|---|---|
| `ffmpeg` OGG/Opus → 16 kHz mono | 0.13s, libopus present |
| `whisper-cli`, base-q5_0, 8.6s clip | **1.7s** |
| same clip, small-q5_1 | 5.5s |
| same clip, large-v3-turbo-q5_0 | 22–43s |

### Every call is transcribed and summarised

`TRANSCRIBE_CALLS=1` extends transcription from voicemail to answered calls;
`SUMMARISE_CALLS=1` has Hermes turn each transcript into a summary, a topic and
a list of follow-ups. Each recording produces three files side by side, sharing
a date prefix so they are found and expire together:

```
RE….wav   RE….transcript.json   RE….summary.json
```

The transcript is built **per utterance**, not per file: silence detection
splits each channel into turns and the language is decided for each one. That
is what makes a Montreal call legible — whisper assigns a single language to
whatever you hand it, so a whole-file pass renders the English half of a
bilingual call as French phonetics.

Model choice, measured on a real bilingual call from the 450 line:

| Model | 46s call | |
|---|---|---|
| base-q5_0 | 52s | invents English where there is French |
| small-q5_1 | 131s | closer, still garbles |
| **large-v3-turbo-q5_0** | **616s** | the only one to get "les fonds de salubrité santé" |

**Throughput is the thing to watch.** That is roughly 13× realtime with three
language passes per utterance, so a 3-minute call costs about 40 minutes of
CPU. Fine at current volume, and it runs detached after the webhook has already
answered — but it is the first thing that will fall behind. The lever is the
three passes: turbo's own detector is much better than base's, so a single
`-l auto` pass would cut it threefold. Untested; each measurement is ten
minutes.

### Language: score the text, not the audio

Whisper's own language detection is not usable here. Measured:

- `-l auto` on French was detected as **English** — p=0.93 on base, 0.89 on
  small, 0.56 on large-v3-turbo. All three wrong, confidently. The output is
  not a worse transcript, it is phonetic nonsense.
- `-l fr` on English audio returns clean English. A wrong hint can cost nothing.
- `-l fr` on Spanish audio returns nonsense: `Ola, Wenoz Dias, Heyunifuga`.

So neither `auto` nor any single fixed language serves all three. Instead
`transcribeMultilingual` runs **one pass per candidate language and scores the
resulting text** on how much it looks like the language it claims to be
(`src/language.ts`). Grammar is what survives: whisper cannot produce "il y a"
from Spanish audio, so the French pass on French audio wins even when every
content word is mangled.

Only affordable because transcription is local — three passes of the base model
on a short clip is ~5s of our own CPU. Against a per-minute API this would be
an obviously bad trade.

**Who is speaking decides the setting**, and that is not one question but four:

| Source | Who | Setting |
|---|---|---|
| WhatsApp voice note | customer | `WHISPER_CLIENT_LANGUAGES=fr,en,es` |
| Voicemail | customer | same |
| Employee side of a call | staff, mostly Spanish | `WHISPER_EMPLOYEE_LANGUAGE=es` — **tie-break only** |
| Meta verification call | a robot reading digits | `WHISPER_OTP_LANGUAGE=en`, pinned |

That employee row is a **prior, not a fact**, and treating it as a fact was
measurably wrong: on a real call David was speaking French and English, and
pinning his channel to Spanish returned "Ok, el beso de la abril, chiquo, la
lura" out of ordinary French. Both sides are now scored across all candidates;
the setting survives only as the tie-break for utterances too short to score.

Set `WHISPER_CLIENT_LANGUAGES` to one language to skip the extra passes.
`WHISPER_LANGUAGE` is the fallback for when scoring cannot decide — short
utterances like "oui" carry no grammar to measure.

**The employee setting does nothing yet.** Dual-channel recordings are still
downmixed before transcription, which mixes both sides so neither language
fits. Splitting the channels is what makes it apply, and there are now two
reasons to do it: diarization and language.

Caveat: the measurements above are macOS `say` output, not human speech, and
TTS prosody is exactly what throws language detection. The scorer is tested
against those real mangled transcripts, but re-measure with an actual voice
note before trusting the numbers.

The model lives at `~/dss-telephony/models/ggml-base-q5_0.bin` on maple, mounted
read-only at `/models`. It used to be borrowed from a sibling project's
directory; it is now owned by this service, so nothing else moving its files can
break telephony.

Downmixing to mono loses which channel each speaker was on. For dual-channel
call recordings where diarization matters, transcribe the two channels
separately rather than reusing this path as-is.

## WhatsApp (Vonage)

`src/vonage.ts` + `src/routes/whatsapp.ts`. Inbound and status webhooks, a send
function, and a token-guarded manual-send endpoint for the first test.

Webhooks are verified against Vonage's HS256 JWT, comparing the token's
`payload_hash` claim to a SHA-256 of the raw body. Verifying the token alone
would let a valid one be replayed against substituted content, so the route
captures raw bytes during parse rather than re-serializing.

WhatsApp routes only mount when key, secret, and from-number are all set — a
voice-only deployment does not expose message endpoints that cannot work.

### Message types

Sends text, quoted replies, images, video, files, voice notes, stickers
(`.webp` only), reactions and unreactions. Receives all of the above: media is
downloaded immediately — Vonage expires it — archived under `whatsapp/` with
the same retention as call recordings, and **voice notes are transcribed
locally** before the agent sees them, with language detection on `auto`.

Reactions are logged but do not trigger an agent run; a thumbs-up is not a
question.

| Variable | Default | |
|---|---|---|
| `WHATSAPP_MARK_READ` | `1` | Blue ticks. Cosmetic for a human, load-bearing for a bot that thinks for 30s. |
| `WHATSAPP_TYPING_INDICATOR` | `1` | The typing bubble, dismissed on reply or after 25s. |
| `WHATSAPP_DOWNLOAD_MEDIA` | `1` | |
| `WHATSAPP_TRANSCRIBE_VOICE_NOTES` | `1` | Needs `TRANSCRIPTION_ENABLED=1`. |
| `WHATSAPP_MAX_INBOUND_BYTES` | `32MB` | |

### Sending attachments

WhatsApp fetches media by URL, so `MEDIA_ROOT` is served publicly over
HMAC-signed, expiring links. **Keep it a different directory from the recordings
archive** — a signed link to a customer call is one forward away from a
disclosure. Public `https` URLs pass through unsigned; `http` is refused.

| Variable | Default | |
|---|---|---|
| `MEDIA_SIGNING_SECRET` | falls back to `ADMIN_TOKEN` | **Unset means local files cannot be sent at all** — the endpoint does not mount. |
| `MEDIA_ROOT` | `./media` | |
| `MEDIA_URL_TTL_SECONDS` | `3600` | |
| `MEDIA_MAX_BYTES` | `64MB` | WhatsApp's own ceiling. |

Test any type without involving the agent:

```bash
curl -X POST "$PUBLIC_BASE_URL/admin/whatsapp/send" -H "X-Admin-Token: $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"kind":"image","to":"+15144637712","url":"logo.png","caption":"essai"}'
```

### How Hermes sends more than text

Hermes returns text and configures itself, so instead of a tool surface it emits
directives on their own lines. Anything unrecognised stays in the prose.

```
::react 👍          ::image <url> | caption      ::audio <url>
::unreact           ::video <url> | caption      ::sticker <url>
::reply             ::file  <url> | name.pdf     ::call
```

`::reply` is a modifier: everything after it quotes the incoming message.
`::call` hands over the PSTN number — see below for why that is not a WhatsApp
call.

### WhatsApp calling: not available

Meta opened the WhatsApp Business Calling API through BSPs, but **Vonage
publishes no calling endpoints, webhook contract or snippets for it.** Nothing
was written against an undocumented shape; `/webhooks/vonage/calls` only logs
and flags an event loudly if one ever arrives.

Note also that WhatsApp has **no native call recording**, which conflicts with
an architecture that records and archives every call. Deflection to the PSTN
line — where the IVR answers and the recording pipeline applies — is the
working path.

### Deployed state (verified 2026-08-10)

Live on maple and confirmed at boot: generative `Chirp3-HD-Aoede` in all three
languages, the signed media root mounted, Hermes reachable (`ok v0.20.0`) with a
two-number allowlist, and the archive writable. Through the public URL,
`/health` answers 200 while both an unsigned `/media` request and an unsigned
Twilio webhook are refused with 403.

The IVR is **off**. Turning it on means spending part of the 20-second ring
window, so re-measure the Rogers divert with the menu enabled before trusting it.

### Account state (verified 2026-08-09)

| | |
|---|---|
| Twilio number | `+1 450 235 8434` — Quebec, SMS/MMS/voice, voice webhook live |
| Vonage application | `8e711bd8` — `messages` capability, webhooks live |
| WABA | `2105652107043268`, linked to the application |
| WhatsApp sender | `+1 450 235 8434` — same number as voice, via BYON |
| Display name | "Esperancita" — **pending Meta review** |
| Vonage number | `+1 226 277 0423` — Ontario, linked to nothing, **still billing** |

The 450 carries voice on Twilio and WhatsApp on Vonage at the same time. That
is BYON working as intended, not a misconfiguration.

### Runbook A — sandbox test (no Meta dependency)

Historical: production BYON is live (Runbook B), so this is here for rebuilding
the path from scratch, not for daily use. It needs a sandbox `.env` — the
deployed one points at production and Basic auth no longer works there.

Three terminals:

```bash
cloudflared tunnel --url http://localhost:8080
```

Copy the printed `https://….trycloudflare.com` URL into `PUBLIC_BASE_URL` in
`.env`. Quick tunnels get a new hostname every start, and Twilio's signature is
computed over that exact string, so a stale value makes every Twilio webhook
403. Then:

```bash
npm run dev
```

In the Vonage dashboard under **Messages API Sandbox**, allowlist the handset
you will test from, and point the sandbox inbound and status webhooks at
`{tunnel}/webhooks/vonage/inbound` and `{tunnel}/webhooks/vonage/status`.
Confirm the sandbox from-number there too and update `VONAGE_WHATSAPP_NUMBER`
if it differs. Then:

```bash
./scripts/send-test.sh +15145551234 "bonjour depuis DSS"
```

Outbound proves auth and the send path; replying from the handset proves the
inbound webhook. Both directions working is the whole sandbox goal.

### Runbook B — production BYON of +1 450 235 8434

Do this only after Runbook A passes. Steps 1–3 are API calls; 4–6 are yours,
because they need a Meta login and accepting Meta's terms.

1. ~~Create a Vonage Application with the `messages` capability.~~ **Done
   2026-08-09** — `8e711bd8-bbc8-4066-aa52-2a406a1ac829`. Private key saved to
   `vonage-private.key` (mode 600, gitignored). Vonage never shows it again;
   move it into Proton Pass and the file becomes disposable.
2. ~~Set the application's inbound and status webhooks.~~ Done, pointed at the
   quick tunnel. **These die with the tunnel** — repoint them on every restart,
   or on a real host once one exists.
3. Vonage Dashboard → WhatsApp → **Embedded Signup**. Needs the Meta Business
   account and Business verification, and you must accept Meta's terms.
4. Enter `+14502358434` and take the OTP **by voice, not SMS**. Meta sends SMS
   codes from short codes and Twilio long codes cannot receive those — the
   message never reaches the network, with no error anywhere to see it. The
   `/webhooks/twilio/otp` route exists precisely to answer that call, press the
   key the IVR asks for, and record the digits.

   **The verification call is an IVR, not a recording.** It says "to receive
   your WhatsApp verification code, press 0" and will not read anything until a
   key is pressed. Measured from the first attempt, relative to answer: the
   prompt starts at ~2.2s, runs twice, and leaves a one-second listening gap at
   ~6.5s before repeating. The route waits `OTP_DTMF_DELAY_SECONDS` (7) and
   sends `OTP_DTMF_DIGITS` (`0`) into that gap, then records.

   If Meta changes the wording or the key, both are env vars — no code change.
   Re-measure from the new recording with:
   `ffmpeg -i rec.wav -af silencedetect=n=-35dB:d=0.4 -f null -`
5. Confirm registration completed on Meta's side, then link the number to the
   application.

**Do not register the number in the WhatsApp Business mobile app.** A number
lives either in the mobile app or on the API through a BSP, never both. A mobile
registration has to be deleted before Vonage can claim the number, and Meta
sometimes enforces a cooldown before allowing re-registration.

Then flip `.env` to production — `VONAGE_MESSAGES_BASE_URL=https://api.nexmo.com`,
`VONAGE_WHATSAPP_NUMBER=14502358434`, and `VONAGE_SKIP_SIGNATURE_VALIDATION=0`
(production signs its webhooks; leaving this at 1 would accept unauthenticated
inbound messages) — and set `whatsappEnabled: true` in `src/directory.ts`.

**Precondition:** `+1 450 235 8434` must not be registered to the consumer
WhatsApp app by anyone at DSS. Registration will fail, or will deregister them.

### Testing order

Sandbox first. `VONAGE_MESSAGES_BASE_URL=https://messages-sandbox.nexmo.com`
exercises the entire send/receive/webhook path with no WABA, no Meta review, and
no cost — recipients just have to be allowlisted from the Vonage dashboard.
Moving to production is then a host and from-number change, not a code change.

Sandbox does not sign its webhooks, so it needs
`VONAGE_SKIP_SIGNATURE_VALIDATION=1`. Never set that against production.

## Still open

- **No real call has run end to end.** Voicemail, the archive pipeline and the
  SMS notification have never been exercised by an actual inbound call. The IVR
  was verified against the running service with forged requests, not a phone.
- **Nothing has been sent to a real handset.** Every WhatsApp message type is
  built to Vonage's published shape; none is confirmed against a device.
- **Rogers may answer before we do.** David's carrier diverts to its own
  voicemail around 20–25s. If it wins, Twilio reports `completed`, our voicemail
  branch never runs, and the message lands somewhere we never see — looking like
  success in every log we keep. Ring time is held at 20s to stay under it; the
  durable fix is disabling the carrier divert.
- **Language selection is unproven on human speech.** The multilingual scorer is
  tested against real mangled whisper output, but the audio behind it was macOS
  `say`, not a person. The first real French or Spanish voicemail is the test.
- **The line can go dark without the service noticing.** Reachability depends on
  Tailscale's control plane and a DERP relay; when they dropped for 30 minutes
  on 2026-08-10 the container logs stayed clean throughout. No alerting exists.
- **Hermes prompt tokens are unmeasured and could dominate.** ~33k per message
  at last look, on no telephony invoice. Every reply logs `promptTokens`.
- **Toll-free verification.** The requirement was truncated in the brief. Twilio's
  review takes days and rejects vague use-case descriptions.
- **The Vonage 226 number is billing for nothing.** `+1 226 277 0423` is linked to
  no application and is not the chosen WhatsApp number. Release it or repurpose it.
- **Three stale recordings on Twilio**, including a consumed OTP.
- **Retention period.** `RETENTION_DAYS` defaults to 365. Confirm against whatever
  DSS's actual record-keeping obligation is.
- **Display name "Esperancita" pending Meta review.** A first-name-only display
  name for a company account is the kind Meta rejects.
- **The persona is an AI agent behind a human name and photo.** A disclosure line
  in the WhatsApp About field is the cheap mitigation.
- **WhatsApp pricing premise.** The brief's claim that Vonage offers cheaper
  per-conversation billing than Twilio does not hold — WhatsApp rates are set by
  Meta and apply across BSPs. Verify current rates before treating the split as a
  saving.
