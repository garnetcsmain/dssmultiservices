import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractVerificationCode } from '../src/transcribe.js';
import { isVerificationRobot } from '../src/routes/voice.js';

/**
 * The verification path, which is the only way a code ever reaches anyone:
 * Twilio redacts inbound one-time codes and fails the message with error
 * 30038, so the SMS a service thinks it sent does not exist by the time it
 * would have arrived here.
 *
 * Two things decide whether it works. Recognising the robot, because a call
 * that is routed to somebody's phone instead is a code lost - and reading the
 * digits back out of the transcript, because a code the extractor cannot see
 * is a code somebody has to go and listen for by hand.
 */

/** Verbatim from the Intuit call to +1 438 500 6595 on 2026-08-12, 14:22 UTC. */
const INTUIT_CALL =
  'Votre code de vérification téléphonique pour un tuyau est 7 3 4 6 5 1 ' +
  'A nouveau 7 3 4 6 5 1 Une dernière fois. 7 3 4 6 5 1 Au revoir.';

test('the code is read out of a robot dictating digit by digit', () => {
  // This exact transcript reported "(no 6-digit run found)" in production
  // while the code sat in plain sight.
  assert.equal(extractVerificationCode(INTUIT_CALL), '734651');
});

test('a code written as one run is still read', () => {
  assert.equal(extractVerificationCode('Your WhatsApp code is 483920'), '483920');
});

test('separators other than spaces do not hide the code', () => {
  assert.equal(extractVerificationCode('code: 4-8-3-9-2-0'), '483920');
  assert.equal(extractVerificationCode('code 4.8.3.9.2.0 merci'), '483920');
});

test('the repeated code wins over a mangled repetition', () => {
  const mangled = 'est 1 2 3 4 5 6 a nouveau 123456 une dernière fois 723456';
  assert.equal(extractVerificationCode(mangled), '123456');
});

test('a transcript with no code yields nothing rather than a guess', () => {
  assert.equal(extractVerificationCode('Bonjour, je rappelle plus tard.'), null);
  assert.equal(extractVerificationCode(''), null);
});

test('joining digits cannot drag a word into the middle of a code', () => {
  // "1. Bonjour 234567" must not become "1234567" and yield a false six-run.
  assert.equal(extractVerificationCode('1. Bonjour 234567'), '234567');
});

test('both verification robots are recognised', () => {
  assert.ok(isVerificationRobot('+18607242481'), 'Meta / WhatsApp');
  assert.ok(isVerificationRobot('+18677942309'), 'Intuit / QuickBooks');
});

test('how the number is written does not decide whether it is a robot', () => {
  for (const written of ['18607242481', '(860) 724-2481', '+1 860 724 2481']) {
    assert.ok(isVerificationRobot(written), `failed on ${written}`);
  }
});

test('a customer is never mistaken for a robot', () => {
  // The consequence of a false positive is a caller silently recorded and
  // never connected to anyone.
  assert.equal(isVerificationRobot('+15145551234'), false);
  assert.equal(isVerificationRobot('+15144637712'), false);
  assert.equal(isVerificationRobot(''), false);
  assert.equal(isVerificationRobot('anonymous'), false);
});
