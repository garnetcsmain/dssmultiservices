/**
 * Voice fallback. Runs on Twilio when maple cannot answer the webhook.
 *
 * Connects the call and nothing more. Specifically it does NOT record, and
 * that is a decision rather than an omission: the archive lives on maple, so a
 * recording made here would have nowhere to go and would sit on Twilio's side
 * indefinitely - outliving the retention window, and taken without the notice
 * the caller normally hears. A connected call that is not recorded is a
 * degraded service; a recording we cannot account for is a compliance problem.
 *
 * There is no voicemail branch either, for the same reason - there is nowhere
 * to put the audio. An unanswered call rings until the employee's own carrier
 * mailbox picks up, which on at least one of these lines it does. The message
 * ends up in a personal mailbox instead of the archive. That is worse than
 * normal and better than a dropped call.
 *
 * ROUTES is injected at deploy time from src/directory.ts.
 */
const ROUTES = __ROUTES__;

/** How long to ring. Long enough for a carrier mailbox to answer. */
const RING_SECONDS = 20;

exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.VoiceResponse();

  const line = ROUTES[nanp(event.To || '')];
  if (!line || !line.forwardTo) {
    // Unrouted. Say something in the three languages the business answers in
    // rather than hanging up on a customer with no explanation.
    twiml.say(
      { language: 'fr-CA' },
      "Nous ne pouvons pas prendre votre appel pour le moment. Merci de rappeler plus tard.",
    );
    twiml.hangup();
    return callback(null, twiml);
  }

  // callerId is the DSS number, matching what the primary flow does - the
  // employee should see the same thing on their screen either way, so a
  // fallback call does not look like a stranger.
  twiml.dial(
    { callerId: event.To, timeout: RING_SECONDS },
    line.forwardTo,
  );

  callback(null, twiml);
};

function nanp(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 11 && digits.charAt(0) === '1' ? digits.slice(1) : digits;
}
