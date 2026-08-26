# Telegram flows — every message, button and command

Verified against the Bot API (sources in [07-sources.md](07-sources.md)): inline keyboards +
callback queries support exactly the alert-then-assign pattern; deep links
(`t.me/<bot>?start=<payload>`, ≤64 chars `A-Za-z0-9_-`) open the bot with an item
pre-loaded from an NFC tap; the bot edits its own messages in place so threads stay clean.

**Language:** the crew is mostly Spanish-speaking, Freddy operates FR/EN — every string
ships in **ES + FR + EN**, per person's `lang`. Examples below in English for readability.

**One honest limitation (verified):** the tap itself needs no app, but *acting* on the bot
requires Telegram installed (or a logged-in web session). The crew currently lives on
WhatsApp — getting Telegram onto their phones is a rollout task, not a technical one. See
doc 06.

---

## 1. Design principles (alert fatigue kills systems like this)

1. **Buttons, never typing.** Every action is one tap.
2. **Digest, don't spam.** Loading 9 items = one grouped message, not 9 pings.
3. **Edit in place.** As a trip progresses, the original message updates ("Responsible:
   Maria ✓ → Loaded in Van 1 07:51 → Closed 17:20") instead of new notifications.
4. **Silent by default** for expected transitions (job-in-progress) — visible in `/trip`
   and the digest, no ping.
5. **Alert windows follow real shifts.** Cleaning is an evening/night industry — a fixed
   21:00–06:30 quiet window would mute exactly the alerts that matter. Quiet hours are
   configured per crew schedule, and **leave-site missing alerts are never muted**.
6. **Pre-assign when identity is known.** If Maria's phone did the loading taps, she IS the
   responsible — Freddy's alert becomes an FYI with a [Change] button. The manual step
   Freddy described exists but usually collapses to zero.

## 2. The flows

### Flow A — Departure + responsible assignment (Freddy's core ask)

```mermaid
sequenceDiagram
    participant M as Maria's phone
    participant B as DSS Bot
    participant F as Freddy
    M->>B: NFC tap x5 items, button "→ Van 1"
    B->>B: opens trip, groups 10-min window
    B->>F: 🚚 Van 1 loading: 5 items [list]. Responsible: Maria ✓ (tapped) [Change]
    Note over B,F: unknown tapper instead → buttons [Maria] [David] [Me] [Other…]<br/>one tap saves it; unanswered 15 min → one re-ping
    B->>M: 📋 Your checklist for this trip: 5 items [view]
```

The responsible person **receives their assigned list** the moment assignment happens —
Freddy's "when it gets assigned, a list of things" requirement. `/mine` shows it any time.

### Flow B — Job in progress + location pin

Tap at the site (or Phase 3 inference) → item marked in progress; the tap flow offers
**[📍 share location]** once per site; silent for Freddy (no ping), visible in `/trip`.

### Flow C — Packing check (the killer feature)

Triggered when the crew taps "leaving site" / `/depart`, or Phase 3: ignition-on after a
stationary period away from base.

> 🔁 *Van 1 leaving Tour A — 4 of 5 items back.*
> ⚠️ ***Missing: extension cord EXT-04** (unloaded 09:10).*
> *Check before driving! [Found it ✓] [Left on purpose 📍] [Can't find it ❌]*

- Goes to **the responsible person first** (they can fix it in 2 minutes) *and* Freddy.
- Phase 3 adds the **in-van buzzer** — works with zero cell coverage.
- *[Left on purpose]* moves the item to that site with a 7-day reminder (some gear
  legitimately stays at clients; a `keep_in_vehicle` flag likewise suppresses false alarms
  for van-resident items).
- *[Can't find it]* → `MISSING_SUSPECT`; auto-escalates to `MISSING_CONFIRMED` at 48 h
  with a loss dossier (item value, serial, photo, last pin, full history — police/insurance
  ready). Any later sighting anywhere auto-resolves it and edits the alert.

### Flow D — Return to storage

Items tapped/seen back at 3084 close their manifest rows; when all rows resolve:
> ✅ *Trip #142 closed — 5/5 items back at 3084. (edited into the original message)*

### Flow E — Nightly digest (the safety net)

One message at a shift-appropriate hour:
> 📋 *41 in storage · 6 in Van 1 (Maria) · 2 in Van 2 (David)*
> ⚠️ *VAC-02 "in progress" 26 h [Ask David] [Fix] · 1 unresolved missing*
> 🧴 *Floor soap below minimum*
> 🔋 *(Phase 3) 2 beacons low battery, 1 silent 3 days*

Plus a 30-second **weekly summary** (trips, top movers, anything in MAINTENANCE) — the
habit that keeps Freddy trusting the data.

### Flow F — After-hours movement alarm (Phase 2/3)

Anything leaving the storage zone (or the garage door opening) outside business hours:
> 🚨 *3084: FM-01 left storage at 02:14 — outside work hours! [It's OK — planned] [⚠ Check]*

Immediate, never digested, ignores quiet hours. The one genuine anti-theft feature, nearly
free.

### Flow G — System health (Phase 3)

Gateway heartbeat missed 30 min → maintenance ping to Freddy only. Monthly battery digest.
Every *"the reader missed it"* button press increments a per-tag miss counter — the
maintenance digest names which tags need remounting.

## 3. Command reference

| Command | Who | Does |
|---|---|---|
| `/where VAC-03` (or tap the item's NFC) | anyone allowlisted | current state, holder, last pin, history |
| `/mine` | crew | items currently under my responsibility |
| `/trip` | anyone | open trips, live manifests |
| `/take` `/return` | crew | manual flow when a tag is dead (pick item from list) |
| `/depart` `/back` | crew | trip departure / return triggers (Phase 1) |
| `/missing` | Freddy | open missing items + dossiers |
| `/fix VAC-03` | Freddy/David | correction event (never edits history) |
| `/stock soap -1` | crew | bin-level consumable decrement; low-stock hits the digest |
| `/inventory` | Freddy | counts per location |
| `/newitem` `/retire` | Freddy | registry management |

## 4. Access control

- Chat-ID allowlist (Freddy, David, crew). Unknown users who tap a tag see only
  *"Contact DSS"* — and Freddy gets an onboarding button.
- **David is the fallback recipient**: alerts unacknowledged by Freddy for N hours escalate
  to him; vacation mode swaps the primary. A single-human alert loop fails the first flu
  week — this is designed in from day one.
- Bot token in `.env` (mode 600); ingest endpoints HMAC-signed; no public ports (long
  polling).

*Next: [05-roadmap.md](05-roadmap.md).*
