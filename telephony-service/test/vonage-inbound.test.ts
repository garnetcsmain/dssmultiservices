import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseInbound } from '../src/vonage.js';

/**
 * Inbound classification. Before this change every non-text message was
 * dropped on the floor with a log line, so these are the cases that used to
 * silently ignore a customer.
 */

test('text messages parse as before', () => {
  const message = parseInbound({
    channel: 'whatsapp',
    message_type: 'text',
    message_uuid: 'abc',
    from: '15144637712',
    to: '14502358434',
    text: 'Bonjour',
  });
  assert.equal(message?.kind, 'text');
  assert.equal(message?.text, 'Bonjour');
  assert.equal(message?.from, '+15144637712');
});

test('a voice note carries its media url', () => {
  const message = parseInbound({
    channel: 'whatsapp',
    message_type: 'audio',
    message_uuid: 'abc',
    from: '15144637712',
    to: '14502358434',
    audio: { url: 'https://api.nexmo.com/v1/media/xyz' },
  });
  assert.equal(message?.kind, 'audio');
  assert.equal(message?.media?.url, 'https://api.nexmo.com/v1/media/xyz');
});

test('an image caption becomes the message text', () => {
  const message = parseInbound({
    channel: 'whatsapp',
    message_type: 'image',
    message_uuid: 'abc',
    from: '15144637712',
    to: '14502358434',
    image: { url: 'https://x/y.jpg', caption: 'la fuite est ici' },
  });
  assert.equal(message?.text, 'la fuite est ici');
  assert.equal(message?.media?.caption, 'la fuite est ici');
});

test('a reply carries the uuid it is quoting', () => {
  const message = parseInbound({
    channel: 'whatsapp',
    message_type: 'text',
    message_uuid: 'new',
    from: '15144637712',
    to: '14502358434',
    text: 'oui',
    context: { message_uuid: 'older' },
  });
  assert.equal(message?.contextUuid, 'older');
});

test('media with no url degrades instead of pretending to have one', () => {
  const message = parseInbound({
    channel: 'whatsapp',
    message_type: 'image',
    message_uuid: 'abc',
    from: '1', to: '2',
    image: {},
  });
  assert.equal(message?.kind, 'unsupported');
});

test('unknown types are classified, not dropped', () => {
  const message = parseInbound({
    channel: 'whatsapp',
    message_type: 'contact',
    message_uuid: 'abc',
    from: '1', to: '2',
  });
  assert.equal(message?.kind, 'unsupported');
  assert.equal(message?.rawType, 'contact');
});

test('non-whatsapp channels are still refused outright', () => {
  assert.equal(parseInbound({ channel: 'sms', message_type: 'text' }), null);
});
