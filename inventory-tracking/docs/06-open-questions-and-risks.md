# Open questions and honest risks

A dedicated critique pass was run against the whole design to find what it *misses*. This
document is that output, curated. **The questions come first because several of them can
change the architecture — answer them before ordering hardware.**

---

## 1. Questions Freddy must answer (each with why it matters)

### Sizing and ROI
1. **What was actually lost in the last 12–24 months?** Which items, value, and at what
   stage (left at site / vanished from vehicle / from storage)? → sizes the ROI, picks the
   first 20 items to tag, and decides whether the $700 or the $5,000 solution is justified.
   Every design currently guesses.
2. **Exact counts:** machines, tools, supply bins today and expected in 18 months? "~50
   items" drives the whole budget; 30 vs 90 changes cost by 2×.
3. **Do items move as kits** (caddy of tools, hose sets, window kit)? Tag the container or
   each piece? Which small tools are deliberately untracked? → defines what "complete"
   means in the packing check; must precede the tag order.

### Operations
4. **Does equipment really cycle through 3084 daily**, or does a share live permanently in
   janitor closets at client sites (GDI buildings)? → if much of the fleet never visits
   3084, the storage-zone centerpiece tracks only a fraction of the risk and the design
   pivots toward per-site inventory.
5. **Vehicles: company-owned or leased? Personal cars ever used** ("the car of person X")?
   Vans home overnight? → leases can forbid hardwiring; personal cars rule out installed
   gateways and change consent; no nightly base return breaks "return to storage" triggers.
6. **Trailer usage:** ever dropped unhitched at a site for days? 7-pin power? → an
   unhitched trailer is an unpowered dead zone; needs a battery plan or a workflow rule.
7. **Crew working hours** — mostly evenings/nights? → alert windows and the digest hour
   derive from real shifts; a naive 21:00–06:30 quiet window would mute exactly the
   leave-site alerts that matter.
8. **How many client stops per day, and does any job schedule exist** (spreadsheet, n8n,
   calendar)? → without job-site linkage the system says "something is missing" but never
   "it's at Tour A". Linking trips to a schedule is the difference between an alert and a
   recovery.
9. **Are machines hosed down or pressure-washed, and with which chemicals?** → direct jets
   exceed IP66/67 tag ratings and solvents attack adhesives; sets tag model, mounting, and
   the annual tag-mortality budget.
10. **Winter reality:** are vans and 3084 heated? → coin cells fade below −20 °C, consumer
    ESP32/SD/LTE parts are 0–40 °C rated, LiFePO4 can't charge below 0 °C, gloved hands
    can't tap. Decides component grade and mandates a winter pilot before fleet rollout.
11. **Site survey at 3084:** internet? Wi-Fi reach at the garage door? Mains outlet near
    the door? Where does maple physically live relative to 3084? → the $0/month claim and
    the MQTT-at-base architecture hinge on these. If 3084 is dark, an LTE router and a
    monthly bill come first.
12. **Garage door dimensions/material, and does the van back right up to it?** → determines
    storage-vs-vehicle zone bleed (the #1 BLE tuning risk).

### People
13. **Will the crew install and use Telegram?** They live on WhatsApp today. → responsible-
    person checklists are worthless unopened. Plan: Telegram for Freddy/David/alerts
    regardless; if crew adoption fails, the staff-facing flow is the only part needing a
    WhatsApp port later.
14. **Who besides Freddy can act on alerts** — David as fallback/vacation mode? → a
    single-human alert loop silently rots the first flu week. Designed in from day one, but
    needs the actual person confirmed.
15. **Which phones does the crew carry** (NFC-capable? personal or company)? → the tap
    layer assumes BYOD NFC phones; personal-phone use for work tracking has its own Law 25
    wrinkle.
16. **Will responsibility data ever feed discipline or payroll?** → changes the legal
    notice, proportionality analysis, retention policy, and how the crew receives the
    system. Recommendation: declare it **purely operational, no-fault**, in writing.

### Legal / insurance (Quebec)
17. **Law 25 basics before switching on person-linked tracking:** designated privacy
    officer (defaults to the highest executive; title/contact must be published), a short
    **French** employee notice (Charter/Bill 96), minimal collection, stated purpose
    (equipment custody, not people tracking). Cheap now, expensive retroactively.
18. **The ledger is discoverable evidence.** Departure/return timestamps tied to named
    employees reconstruct hours worked and can be subpoenaed and cross-checked against
    payroll/CNESST/comité paritaire filings. Set retention (and accuracy discipline) with
    a lawyer, not with disk space.
19. **Insurance:** does the commercial policy cover theft from unattended vehicles? Many
    exclude it — and a `keep_in_vehicle` flag would then *document* policy-voiding
    overnight storage. Conversely, the serial+photo+value register may earn a premium
    credit. Ask the insurer both questions.
20. **Ownership boundaries:** rented machines, GDI-supplied or client-owned gear — tagging
    scope, "property of DSS" labeling, what happens when a tagged rental goes back.

## 2. Honest risk register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **Quebec winter** (batteries, 0–40 °C parts, condensation, salt, gloves) | High | industrial-temp parts where exposed; first winter = pilot; battery strategy per season; expect January STALE storms and don't let them become false MISSING alerts |
| 2 | **Staff adoption / missed taps** (Phase 1's core dependency) | High | 3-second taps, ES-language strings, batch load via vehicle door tag, door station, nightly reconciliation converts misses into corrections; Phase 3 removes the dependency |
| 3 | **False alerts erode trust** (the #1 system-killer) | High | digests not pings, edit-in-place, silent expected transitions, debounced presence, `keep_in_vehicle` flag, kill criteria in the roadmap |
| 4 | **Metal + water vs radio** (NFC dead on metal; BLE −10–20 dB near metal, silent inside metal) | Medium | ferrite NFC tags; BLE standoff mounting, IP67 cases; order samples and test on real wet machines before the bulk order |
| 5 | **Zone bleed** (storage gateway hears into the van at the door) | Medium | RSSI thresholds, median-wins + hysteresis, gateway placement deep in 3084; Phase 3 entry gate measures it |
| 6 | **Offline vehicles** (no LTE) | Medium | in-van buzzer works offline; store-and-forward with timestamp reconciliation; optional LTE later |
| 7 | **Gateway clocks** (ESP32/Pi have no battery RTC — buffered events can carry garbage times after power cuts) | Medium | RTC module (~$3) or monotonic-uptime deltas reconciled at sync — required in the vehicle firmware spec |
| 8 | **Van battery drain** | Medium | duty-cycled deep sleep + hardware low-voltage disconnect |
| 9 | **Coin-cell trickle** (2–4 swaps/month at 50 tags) | Low | battery telemetry + monthly digest + spares shelf; STALE state so dead ≠ missing |
| 10 | **Custom vehicle firmware** (store-and-forward NimBLE — the long pole, ~2–3 weekends) | Medium | storage gateway ships first on no-code ESPHome; firmware scoped small; taps remain the fallback forever |
| 11 | **maple single point of failure** | Low | failure is loud (taps get no reply), gateways buffer, nightly GCS restore runbook |
| 12 | **BLE spoofability** (beacon MACs are cloneable; advertisements unauthenticated) | Low (insider) | acknowledged limitation — this is loss-prevention, not security; the append-only ledger + taps are the audit path |
| 13 | **Tag sabotage / removal** | Low | robust mounting, photographed placements, per-tag miss counters, framing the system as protective (see below) |
| 14 | **Maintenance/repair loop** (machines away for weeks) | Low | explicit MAINTENANCE state; by-product: usage-days per machine for preventive maintenance |
| 15 | **Freddy-hours are the real budget** | High | phases sized to weekends; every phase standalone; the plan explicitly yields to open compliance work |

## 3. Introducing it to the crew (do not skip this)

"Responsible person" can read as "who gets blamed". The system dies in a week if the crew
hears it that way. The framing that works, said explicitly and in writing (ES + FR):

- *It proves you returned it.* The ledger protects the crew from "someone took my..."
  disputes as much as it protects DSS's equipment.
- *No-fault period* for the first 1–2 months: alerts fix inventory, never people.
- *It does not affect pay*, and it isn't a punctuality tracker (and per the legal note
  above, decide and declare that it never will be).
- *It tracks machines, not people.* Location pins are optional, tap-moment-only, on the
  equipment's history — nobody's phone is followed.
- The packing-check alert is the crew's friend: it saves them the return trip and the
  awkward call.

## 4. Deliberate verification drills

Once a month, deliberately leave an item behind at a "job" and record whether the system
catches it (buzzer, alert, digest). This is the only ground truth of the packing check's
real catch rate, the earliest detector of winter degradation, and it takes ten minutes.
Log results in the repo — the register's accuracy is itself an insurance asset.

*Next: [07-sources.md](07-sources.md).*
