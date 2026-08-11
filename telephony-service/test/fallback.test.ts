import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import twilio from 'twilio';
import { buildRoutes, renderFunction } from '../src/fallback/generate.js';
import { allLines } from '../src/directory.js';

/**
 * These tests run the artifact, not a model of it.
 *
 * The source is rendered exactly as the deploy script renders it, then executed
 * with the same TwiML classes Twilio's runtime provides, and the assertions are
 * made against the XML that comes out. That matters more here than anywhere
 * else in this codebase: this code only ever executes when the main service is
 * already down, so a defect in it is invisible until the worst possible moment
 * and produces no logs we can read afterwards.
 */

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function load(which: 'sms' | 'voice'): Promise<(event: Record<string, string>) => string> {
  const template = await readFile(path.join(ROOT, `src/fallback/${which}.js`), 'utf8');
  const source = renderFunction(template, buildRoutes());

  const exported: { handler?: Function } = {};
  // The fallback is CommonJS against a global `Twilio`, because that is the
  // shape Twilio Functions run. Handing it the real twilio package rather than
  // a stub is what makes the rendered XML trustworthy.
  new Function('exports', 'Twilio', source)(exported, twilio);

  return (event) => {
    let xml = '';
    exported.handler!({}, event, (_err: unknown, response: { toString(): string }) => {
      xml = response.toString();
    });
    return xml;
  };
}

const MAIN = '+14502358434'; // notify: David + Freddy, nobody answers customers
const FRANCISCA = '+14385006595'; // relay: two-way in normal operation
const DAVID = '+15144637712';
const FREDDY = '+17276136004';
const CUSTOMER = '+15145551234';

test('every line in the directory is covered by the fallback', async () => {
  // The drift guard. A number added to the directory without regenerating this
  // table looks fine every day except the one day this code runs.
  const routes = buildRoutes();
  for (const { number } of allLines()) {
    const key = number.replace(/\D/g, '').slice(-10);
    assert.ok(routes[key], `${number} would be unrouted during an outage`);
    assert.ok(routes[key]!.forwardTo, `${number} has no voice destination`);
    assert.ok(routes[key]!.staff.length > 0, `${number} would drop texts`);
  }
});

test('an unsubstituted template is refused rather than deployed', () => {
  assert.throws(
    () => renderFunction('const ROUTES = {};', buildRoutes()),
    /placeholder/,
  );
});

test("a customer's text reaches everyone who covers the line", async () => {
  const handler = await load('sms');
  const xml = handler({ To: MAIN, From: CUSTOMER, Body: 'Bonjour', NumMedia: '0' });

  assert.match(xml, new RegExp(`<Message to="\\${DAVID}"`));
  assert.match(xml, new RegExp(`<Message to="\\${FREDDY}"`));
  // The sender's number has to travel with it - during an outage there is no
  // other record of who wrote in.
  assert.ok(xml.includes(CUSTOMER), 'the customer number was not carried through');
  assert.ok(xml.includes('Bonjour'));
});

test('forwarded messages are marked, so an outage is visible from a phone', async () => {
  const handler = await load('sms');
  const xml = handler({ To: MAIN, From: CUSTOMER, Body: 'test', NumMedia: '0' });
  assert.ok(xml.includes('[SECOURS]'), 'a silent fallback hides the outage');
});

test('MMS attachments survive the fallback', async () => {
  const handler = await load('sms');
  const xml = handler({
    To: MAIN, From: CUSTOMER, Body: '', NumMedia: '2',
    MediaUrl0: 'https://api.twilio.com/a.jpg',
    MediaUrl1: 'https://api.twilio.com/b.jpg',
  });
  assert.ok(xml.includes('a.jpg') && xml.includes('b.jpg'));
});

test('a staff message on a notify line sends nothing at all', async () => {
  // The security property. There is no thread memory here, so anything sent
  // outward would be guesswork - and on this line the traffic is 2FA codes.
  const handler = await load('sms');
  const xml = handler({ To: MAIN, From: DAVID, Body: 'code 445566', NumMedia: '0' });

  assert.ok(!xml.includes('<Message'), 'a staff message was forwarded during fallback');
  assert.ok(!xml.includes('445566'), 'message content leaked into the response');
});

test('a staff reply on the relay line is refused to their face, not dropped', async () => {
  const handler = await load('sms');
  const xml = handler({ To: FRANCISCA, From: '+14387287236', Body: 'je passe demain', NumMedia: '0' });

  // Exactly one message, and it goes back to her.
  assert.equal(xml.match(/<Message/g)?.length, 1);
  assert.match(xml, /<Message to="\+14387287236"/);
  assert.match(xml, /degrade/);
  // Her words must not be in it - the point is that they went nowhere.
  assert.ok(!xml.includes('je passe demain'));
});

test('a text to an unknown line is answered with silence', async () => {
  const handler = await load('sms');
  const xml = handler({ To: '+14388178400', From: CUSTOMER, Body: 'hello', NumMedia: '0' });
  assert.ok(!xml.includes('<Message'));
});

test('a call is bridged to the right phone, showing the DSS number', async () => {
  const handler = await load('voice');

  const main = handler({ To: MAIN, From: CUSTOMER });
  assert.match(main, new RegExp(`callerId="\\${MAIN}"`));
  assert.ok(main.includes(DAVID));

  const francisca = handler({ To: FRANCISCA, From: CUSTOMER });
  assert.match(francisca, new RegExp(`callerId="\\${FRANCISCA}"`));
  assert.ok(francisca.includes('+14387287236'));
  // Wrong-number check: a routing mistake here bridges a customer to a
  // colleague who never expected the call.
  assert.ok(!francisca.includes(DAVID));
});

test('the fallback never records', async () => {
  // Compliance, not preference. The archive is on maple and maple is down, so
  // a recording made here would sit on Twilio past the retention window - and
  // the caller never heard the notice, because the fallback does not play it.
  const handler = await load('voice');
  for (const number of [MAIN, FRANCISCA]) {
    const xml = handler({ To: number, From: CUSTOMER });
    assert.ok(!/record/i.test(xml), `${number} would be recorded with nowhere to archive it`);
  }
});

test('an unrouted call is told something, not hung up on in silence', async () => {
  const handler = await load('voice');
  const xml = handler({ To: '+14388178400', From: CUSTOMER });
  assert.match(xml, /<Say/);
  assert.ok(!xml.includes('<Dial'), 'an unknown line must not bridge anywhere');
});
