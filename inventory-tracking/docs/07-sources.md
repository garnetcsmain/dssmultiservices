# Sources

Research was done in August 2026 by independent fact-checking passes (one per claim area),
searching the live web rather than answering from memory. Prices are street prices at the
time of research — re-quote before purchase.

## NFC physics — why a door portal is impossible

The claim "an NFC sticker can be detected passing through a garage door" was **refuted**:
NXP's NTAG datasheet caps operating distance at 100 mm; commercial readers achieve
0.5–5 cm; academic skimming attacks with oversized antennas reach ~25 cm; the FEIG
long-range HF gates (~1–2 m) read ISO 15693 library tags only, never NTAG/ISO 14443; a
metal door blocks the 13.56 MHz inductive field entirely.

- NXP NTAG213/215/216 product page & datasheet — https://www.nxp.com/products/NTAG213_215_216 · https://www.mouser.com/ds/2/302/NTAG213_215_216-531621.pdf
- Shop NFC reader range guide — https://shopnfc.com/en/content/31-nfc-reader-guide
- RFID Journal, NFC max read distance — https://www.rfidjournal.com/ask-the-experts/how-can-i-maximize-the-read-distance-of-an-nfc-system/ · https://www.rfidjournal.com/ask-the-experts/what-is-an-rfid-readers-maximum-range/
- BSI whitepaper, ISO 14443 — https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/RFID/Whitepaper-ISO-14443/whitepaper-iso-14443_node.html
- Skimming-range research — https://www.researchgate.net/publication/220065426_Practical_Eavesdropping_and_Skimming_Attacks_on_High-Frequency_RFID_Tokens · https://cypherpunk.nl/papers/rfidsec15.pdf
- FEIG long-range HF (ISO 15693 only) — https://www.atlasrfidstore.com/feig-lrm5400-hf-rfid-long-range-reader-module/
- ISO 15693 vs 14443 — https://rfidtag.com/iso-iec-15693-explained-hf-rfid-standards-and-industry-applications/ · https://www.rfidcard.com/iso-iec15693-vs-iso-iec14443/
- Anti-metal HF tags (why ferrite backing) — https://www.kimeeryrfidtag.com/how-to-choose-a-13-56-mhz-anti-metal-rfid-coin-tag/

## BLE beacons, gateways and metal behaviour

Prices confirmed; ESP32 continuous scanning confirmed **with** a scan-window/coexistence
caveat; naive "BLE works fine on metal" **refuted** (enclosed = silent; nearby metal
−10–20 dB; on-metal mounting works with standoffs/exterior antenna orientation).

- Minew store & beacon line (MTB09 $3.99, MTB08 $5.99) — https://www.minewstore.com/ · https://www.minew.com/bluetooth-beacon/
- Holyiot nRF52810 tags on AliExpress — https://www.aliexpress.com/item/1005007690122773.html · https://www.aliexpress.com/item/1005006245711900.html
- Feasycom FSC-BP104D (IP67) — https://www.feasycom.com/product/fsc-bp104d/ · https://www.alibaba.com/product-detail/Feasycom-Long-Battery-Life-Mini-450m_1600987295668.html
- Lansitec CR2477 beacon — https://www.choovio.com/product/lansitec-ibeacon-cr2477-bluetooth-beacon/
- BeaconZone: realistic battery life — https://www.beaconzone.co.uk/blog/beacon-battery-size-type-capacity-and-life/
- AirTag pricing/battery — https://www.apple.com/shop/buy-airtag/airtag/4-pack · https://9to5toys.com/2026/08/16/airtag-2-lowest-price-ever-deal/ · https://en.wikipedia.org/wiki/AirTag
- ESPHome BLE scan-window/coex fix (2026.8.0) — https://github.com/esphome/esphome/issues/18356 · https://github.com/espressif/esp-idf/issues/18931 · https://github.com/esphome/esphome/issues/18546
- ESPHome BLE scanner docs — https://esphome.io/components/text_sensor/ble_scanner/
- OpenMQTTGateway BLE — https://docs.openmqttgateway.com/dev/use/ble.html
- NimBLE/Bluedroid duplicate-filter issues — https://github.com/espressif/arduino-esp32/issues/4126
- ESPresense room presence — https://sensorpoweredhome.com/espresence-room-occupancy-tracking-ble-esp32/
- Novel Bits RF-chamber material attenuation (metal enclosure = total blockage) — https://novelbits.io/rf-chamber-episode-1-material-attenuation-public/
- BLE RSSI limitations — https://www.gipstech.com/en/2025/11/20/the-bluetooth-rssi-myth-why-beacon-only-indoor-location-fails-in-practice-smartphone/
- Commercial on-metal BLE asset tags (proof it's done) — https://www.tenna.com/asset-trackers/ble-beacon/ · https://www.mokosmart.com/asset-tracking-beacon-m2/

## UHF RFID portal costs (the parked option)

Costs **confirmed**: enterprise readers $1,050–2,185; budget integrated readers $209–550;
antennas $60–192; on-metal tags $0.43–4.17; vehicle-mount gotchas documented (PoE+ power,
stray reads through windows, metal-cavity tuning). Precedent: Ford/DeWalt "Tool Link"
factory-integrated van RFID (2009).

- Impinj R700 — https://www.atlasrfidstore.com/impinj-r700-RAIN-rfid-reader/ · https://www.logiscenter.us/impinj-r700-scanners
- Zebra FX7500 — https://www.atlasrfidstore.com/zebra-fx7500-fixed-rfid-reader-4-port/ · https://www.barcodefactory.com/zebra/rfid/readers · https://gatewayrfidstore.com/shop/zebra-fx7500-rfid-reader-4-port/ · https://www.midwestbarcodingsolutions.com/fx7500-42320a56-us/
- Chainway UR4 (budget 4-port) — https://www.rfidplaza.com/products/chainway-ur4-33dbm-uhf-etsi-4-port-cm710-4-module-in-enclosure-incl-pwr-supp · https://www.chainway.net/Products/Info/56 · https://www.impinj.com/partners/chainway/ur4-fixed-rfid-reader
- Yanzeo SR682 integrated reader — https://www.amazon.com/YANZEO-Reader-Wiegand26-Network-Integrated/dp/B0CTF7L1QJ
- Hopeland integrated readers — https://www.hopelandrfid.com/product/integrated-rfid-reader/sharp-100.html
- Antennas — https://store.gototags.com/uhf-rfid-8-dbi-902-928-mhz-circular-polarization-antenna/ · https://www.atlasrfidstore.com/vulcan-rfid-vul-262006-trh-a-k-rhcp-outdoor-rfid-antenna-fcc/ · https://www.amazon.com/Yanzeo-902-928MHz-Circular-Polarization-Waterproof/dp/B08DFQRQYM
- On-metal tag catalog + costs — https://www.atlasrfidstore.com/metal-mount-rfid-tags/?limit=96&sort=bestselling&page=1 · https://koronapos.com/blog/rfid-tag-cost/ · https://cpcongroup.com/insights/article/rfid-chip-cost-guide/ · https://jiarfidtag.com/understanding-rfid-tag-costs/
- Impinj: handling unwanted/stray reads — https://support.impinj.com/hc/en-us/articles/360000025980-Strategies-for-handling-unwanted-tag-reads
- Stray-read problem class — https://www.rfidjournal.com/news/to-thwart-stray-rfid-reads-idro-develops-glowfly/75348/
- Ford/DeWalt Tool Link vans — https://www.rfidjournal.com/news/ford-builds-rfid-into-pickups-and-vans-to-track-cargo/83179/ · https://www.jadaktech.com/wp-content/uploads/2022/08/Ford-and-Dewalt-partner-with-Jadak-to-track-contractor-tools-using-RFID-1.pdf · https://www.achrnews.com/articles/103748-march-4-2008-dewalt-and-ford-to-offer-vehicle-based-rfid-tool-tracking
- Vehicle-mounted UHF readers — https://gaorfid.com/devices/readers-by-feature/uhf-vehicle-mounted-rfid-readers/ · https://www.s4a-access.com/uhf-rfid-passive-reader-with-915m-long-distance-access-control-vehicle-logistics-application_p345.html

## Telegram bot flows + NFC deep links

Inline keyboards/callback queries and `t.me/<bot>?start=<payload>` deep links (≤64 chars)
**confirmed**; n8n Telegram Trigger handles callback queries (with caveats: awkward
dynamic keyboards, a reported triple-fire bug — deduplicate on `callback_query.id`);
phone NFC tap **confirmed** app-free on Android and iPhone XS+, but *completing* the flow
needs Telegram installed or a logged-in web session.

- Telegram Bot API — https://core.telegram.org/bots/api · https://core.telegram.org/bots/features
- answerCallbackQuery — https://gramio.dev/telegram/methods/answercallbackquery
- InlineKeyboardButton reference — https://docs.python-telegram-bot.org/en/stable/telegram.inlinekeyboardbutton.html
- n8n Telegram Trigger / callback / message ops — https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/ · https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations · https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations
- n8n caveats — https://github.com/n8n-io/n8n/issues/15483 · https://github.com/n8n-io/n8n/pull/17258 · https://community.n8n.io/t/dynamic-inline-keyboard-for-telegram-bot/86568 · https://n8n.io/workflows/7664-telegram-bot-inline-keyboard-with-dynamic-menus-and-rating-system/
- iOS background NFC reading — https://developer.apple.com/documentation/corenfc/adding-support-for-background-tag-reading · https://support.apple.com/en-euro/guide/iphone/aside/asd-nfc-reader/15.0/ios · https://gototags.com/help/ios/nfc/reading/background
- Android NFC dispatch — https://developer.android.com/develop/connectivity/nfc/nfc
- NFC on iPhone overview — https://shopnfc.com/en/content/20-nfc-iphone
