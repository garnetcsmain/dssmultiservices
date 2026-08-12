import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRecipient } from '../src/routes/sms.js';
import { lookupByNumber, smsRecipients, allEntries } from '../src/directory.js';

/**
 * Which way a message is travelling. Getting this backwards is not a cosmetic
 * bug: mistaking a customer for staff relays their message straight back to
 * them, and mistaking staff for a customer forwards an internal reply to the
 * wrong phone. Both are visible to people outside the company.
 */

const STAFF = ['+15144637712', '+17276136004'];

test('a customer is not mistaken for staff', () => {
  assert.equal(matchRecipient('+15145551234', STAFF), null);
});

test('each staff member is recognised, and identified', () => {
  assert.equal(matchRecipient('+15144637712', STAFF), '+15144637712');
  assert.equal(matchRecipient('+17276136004', STAFF), '+17276136004');
});

test('formatting differences do not change who someone is', () => {
  // The same phone appears as +1..., 1..., and (514) 463-7712 depending on
  // who typed it where.
  for (const written of ['15144637712', '(514) 463-7712', '+1 514 463 7712', '514.463.7712']) {
    assert.equal(matchRecipient(written, STAFF), '+15144637712', `failed on ${written}`);
  }
});

test('an empty or junk sender is never staff', () => {
  assert.equal(matchRecipient('', STAFF), null);
  assert.equal(matchRecipient('unknown', STAFF), null);
});

test('a line with no staff listed matches nobody', () => {
  assert.equal(matchRecipient('+15144637712', []), null);
});

test('the main line texts both David and Freddy', () => {
  const main = lookupByNumber('+14502358434');
  assert.ok(main);
  assert.deepEqual(smsRecipients(main), ['+15144637712', '+17276136004']);
});

test("Francisca's line texts only her, falling back to the voice destination", () => {
  const line = lookupByNumber('+14385006595');
  assert.ok(line);
  assert.equal(line.name, 'Francisca Rojas');
  // No smsForwardTo on this entry, so it must fall back rather than go empty -
  // an empty list means her texts reach nobody at all.
  assert.deepEqual(smsRecipients(line), ['+14387287236']);
});

test('every line in the directory can receive a text', () => {
  for (const number of ['+14502358434', '+14385006595']) {
    const entry = lookupByNumber(number)!;
    assert.ok(smsRecipients(entry).length > 0, `${number} would drop texts silently`);
  }
});

/**
 * Relay versus notify. This is a safety property: on a notify line a staff
 * message must never be forwarded, because there is no conversation to forward
 * it into and the last customer to write in would receive it.
 */
import { smsMode } from '../src/directory.js';

test('the main line is notify-only', () => {
  const main = lookupByNumber('+14502358434')!;
  assert.equal(smsMode(main), 'notify');
});

test("Francisca's line does not relay either", () => {
  // It used to. Turned off 2026-08-12: she has no need to answer by text, and
  // a relay line sends anything from her phone to the last customer who wrote
  // in - a verification code forwarded to the office being the obvious way
  // that goes wrong.
  const line = lookupByNumber('+14385006595')!;
  assert.equal(smsMode(line), 'notify');
});

test('no line in the directory relays a staff message onward', () => {
  // The whole-directory version of the two tests above, so a line added later
  // cannot quietly reintroduce the failure mode by declaring itself a relay.
  // Deleting this test is a decision; passing it by accident is not possible.
  for (const entry of allEntries()) {
    assert.equal(smsMode(entry), 'notify', `${entry.name} would relay staff messages`);
  }
});

test('a line that forgets to declare a mode does not relay', () => {
  // The safe default matters more than the convenient one: an entry added in a
  // hurry must not start relaying staff messages to strangers.
  assert.equal(smsMode({ employeeId: 'x', name: 'x', forwardTo: '+15551234567', whatsappEnabled: false }), 'notify');
});
