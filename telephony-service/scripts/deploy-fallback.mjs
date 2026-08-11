#!/usr/bin/env node
/**
 * Deploys the Twilio-hosted fallback and points the numbers at it.
 *
 * maple stays the primary handler for everything - recording, transcription,
 * summaries, WhatsApp, the two-way relay. This publishes a much smaller copy of
 * the routing to Twilio's own infrastructure and registers it as the fallback,
 * which Twilio requests only when the primary fails outright: connection
 * refused, TLS failure, read timeout, or a 5xx. Exactly the shape of "maple is
 * down".
 *
 * Idempotent. Run it again after editing src/directory.ts - the routing table
 * is generated from the directory, so a redeploy is how the two stay in step.
 *
 *   npm run build
 *   node --env-file=.env scripts/deploy-fallback.mjs [--dry-run] [--skip-numbers]
 *
 * Credentials come from the environment, which is why --env-file is on the
 * command line rather than a parser in here.
 */

import { readFile } from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoutes, renderFunction } from '../dist/fallback/generate.js';
import { allLines } from '../dist/directory.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_NUMBERS = args.includes('--skip-numbers');

const SERVICE_NAME = 'dss-telephony-fallback';
const ENVIRONMENT = 'prod';

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
if (!SID || !TOKEN) die('TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not in the environment');

const AUTH = 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64');

const FUNCTIONS = [
  { file: 'sms.js', fnPath: '/sms', name: 'sms-fallback' },
  { file: 'voice.js', fnPath: '/voice', name: 'voice-fallback' },
];

// ---------------------------------------------------------------- render

const routes = buildRoutes();
console.log('routing table generated from src/directory.ts:');
for (const [key, route] of Object.entries(routes)) {
  console.log(`  ${key}  voice -> ${route.forwardTo}   sms -> ${route.staff.join(', ')}  (${route.mode})`);
}

const rendered = [];
for (const fn of FUNCTIONS) {
  const template = await readFile(path.join(ROOT, 'src/fallback', fn.file), 'utf8');
  rendered.push({ ...fn, source: renderFunction(template, routes) });
}

if (DRY_RUN) {
  console.log('\n--dry-run: nothing was deployed or changed.');
  process.exit(0);
}

// ---------------------------------------------------------------- deploy

const service = await findOrCreate(
  `https://serverless.twilio.com/v1/Services`,
  (s) => s.services.find((x) => x.unique_name === SERVICE_NAME),
  {
    UniqueName: SERVICE_NAME,
    FriendlyName: 'DSS telephony fallback (answers only when maple cannot)',
    // No credentials injected: this returns TwiML and never calls the API, so
    // there is no reason for an account token to sit in its environment.
    IncludeCredentials: 'false',
  },
);
console.log(`\nservice ${service.sid}`);

const environment = await findOrCreate(
  `https://serverless.twilio.com/v1/Services/${service.sid}/Environments`,
  (s) => s.environments.find((x) => x.unique_name === ENVIRONMENT),
  { UniqueName: ENVIRONMENT, DomainSuffix: ENVIRONMENT },
);
console.log(`environment ${environment.sid}  ${environment.domain_name}`);

const versionSids = [];
for (const fn of rendered) {
  const created = await findOrCreate(
    `https://serverless.twilio.com/v1/Services/${service.sid}/Functions`,
    (s) => s.functions.find((x) => x.friendly_name === fn.name),
    { FriendlyName: fn.name },
  );

  // 'protected' makes Twilio's runtime verify X-Twilio-Signature before the
  // handler runs. Public would leave an open endpoint that anyone who found
  // the URL could use to send MMS to David and Freddy on our bill.
  const form = new FormData();
  form.append('Path', fn.fnPath);
  form.append('Visibility', 'protected');
  form.append('Content', new Blob([fn.source], { type: 'application/javascript' }), fn.file);

  const version = await api(
    `https://serverless-upload.twilio.com/v1/Services/${service.sid}/Functions/${created.sid}/Versions`,
    { method: 'POST', body: form },
  );
  versionSids.push(version.sid);
  console.log(`function ${fn.fnPath}  ${created.sid}  version ${version.sid}`);
}

const buildBody = new URLSearchParams();
for (const sid of versionSids) buildBody.append('FunctionVersions', sid);
buildBody.append('Dependencies', '[]');
const build = await api(
  `https://serverless.twilio.com/v1/Services/${service.sid}/Builds`,
  { method: 'POST', body: buildBody },
);
console.log(`build ${build.sid} ...`);

const status = await waitForBuild(service.sid, build.sid);
if (status !== 'completed') die(`build finished as "${status}" - not deploying`);

await api(
  `https://serverless.twilio.com/v1/Services/${service.sid}/Environments/${environment.sid}/Deployments`,
  { method: 'POST', body: new URLSearchParams({ BuildSid: build.sid }) },
);
console.log('deployed');

const base = `https://${environment.domain_name}`;
const smsUrl = `${base}/sms`;
const voiceUrl = `${base}/voice`;

// ---------------------------------------------------------------- verify

// Deploying is not the same as working, and this code is only ever exercised
// when nobody is watching. So exercise it now: sign a request the way Twilio
// signs one, and read back the TwiML it would actually return.
console.log('\nverifying against the live endpoints:');
for (const { number } of allLines()) {
  const voice = await probe(voiceUrl, { To: number, From: '+15145550100', CallSid: 'CAtest' });
  const sms = await probe(smsUrl, {
    To: number, From: '+15145550100', Body: 'verification probe', NumMedia: '0', MessageSid: 'SMtest',
  });
  console.log(`  ${number}`);
  console.log(`    voice: ${summarise(voice)}`);
  console.log(`    sms  : ${summarise(sms)}`);
}

// ---------------------------------------------------------------- wire up

if (SKIP_NUMBERS) {
  console.log('\n--skip-numbers: the numbers were left pointing where they were.');
  console.log(`  sms fallback   ${smsUrl}`);
  console.log(`  voice fallback ${voiceUrl}`);
  process.exit(0);
}

console.log('\nsetting fallback URLs (primary handlers are left untouched):');
const numbers = await api(
  `https://api.twilio.com/2010-04-01/Accounts/${SID}/IncomingPhoneNumbers.json?PageSize=50`,
);

for (const { number } of allLines()) {
  const record = numbers.incoming_phone_numbers.find((n) => n.phone_number === number);
  if (!record) {
    console.warn(`  ${number} is in the directory but not on this Twilio account - skipped`);
    continue;
  }

  await api(
    `https://api.twilio.com/2010-04-01/Accounts/${SID}/IncomingPhoneNumbers/${record.sid}.json`,
    {
      method: 'POST',
      body: new URLSearchParams({
        SmsFallbackUrl: smsUrl,
        SmsFallbackMethod: 'POST',
        VoiceFallbackUrl: voiceUrl,
        VoiceFallbackMethod: 'POST',
      }),
    },
  );
  console.log(`  ${number} -> fallback wired`);
}

console.log('\ndone. maple is still primary; this only answers when maple cannot.');

// ---------------------------------------------------------------- helpers

async function api(url, init = {}) {
  const headers = { Authorization: AUTH, ...(init.headers ?? {}) };
  if (init.body instanceof URLSearchParams) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  if (!response.ok) die(`${init.method ?? 'GET'} ${url}\n  ${response.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

/** Creates the resource unless an equivalent one is already there. */
async function findOrCreate(url, pick, body) {
  const existing = pick(await api(`${url}?PageSize=50`));
  if (existing) return existing;
  return api(url, { method: 'POST', body: new URLSearchParams(body) });
}

async function waitForBuild(serviceSid, buildSid) {
  for (let i = 0; i < 60; i++) {
    const { status } = await api(
      `https://serverless.twilio.com/v1/Services/${serviceSid}/Builds/${buildSid}/Status`,
    );
    if (status === 'completed' || status === 'failed') return status;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return 'timed out';
}

/**
 * Calls a protected function the way Twilio would.
 *
 * The signature is HMAC-SHA1 over the URL followed by every parameter in key
 * order, which is the same scheme the service validates on the way in.
 */
async function probe(url, params) {
  const payload = Object.keys(params).sort().reduce((acc, k) => acc + k + params[k], url);
  const signature = createHmac('sha1', TOKEN).update(Buffer.from(payload, 'utf8')).digest('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Twilio-Signature': signature,
    },
    body: new URLSearchParams(params),
  });
  const text = await response.text();
  if (!response.ok) return `HTTP ${response.status}: ${text.slice(0, 200)}`;
  return text;
}

/** One-line shape of a TwiML response, for the console. */
function summarise(xml) {
  if (!xml.startsWith('<')) return xml;
  const dial = xml.match(/<Dial[^>]*>([^<]+)</);
  if (dial) return `dials ${dial[1]}`;
  const to = [...xml.matchAll(/<Message to="([^"]+)"/g)].map((m) => m[1]);
  if (to.length) return `texts ${to.join(', ')}`;
  const say = xml.match(/<Say[^>]*>([^<]+)</);
  if (say) return `says "${say[1].slice(0, 40)}..."`;
  return 'empty response (nothing sent)';
}

function die(message) {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}
