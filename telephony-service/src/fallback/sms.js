/**
 * SMS/MMS fallback. Runs on Twilio, not on maple - that is the whole point.
 *
 * Twilio requests this only when the primary handler has already failed: TCP
 * refused, TLS broken, read timeout, or a 5xx. In other words, when maple is
 * down, the container is down, or the Funnel is down. On a good day this file
 * never executes.
 *
 * It deliberately does less than the service it stands in for. There is no
 * archive here, no transcript, no thread memory - so it forwards inbound
 * messages and nothing else. The one thing it must never do is invent
 * behaviour the real service would not have: a fallback that quietly does
 * something different is worse than one that does less, because nobody is
 * watching it.
 *
 * ROUTES is injected at deploy time from src/directory.ts. Never edit it here;
 * edit the directory and redeploy, or the two will drift and the drift will
 * only surface during an outage.
 */
const ROUTES = __ROUTES__;

/**
 * Marks every forwarded message.
 *
 * Not decoration. A maple outage is otherwise invisible from a phone - texts
 * keep arriving and look normal, while recordings, transcripts and summaries
 * quietly stop. This tag is the only signal David or Freddy get that the
 * system is running on one engine.
 */
const TAG = '[SECOURS]';

exports.handler = function (context, event, callback) {
  const twiml = new Twilio.twiml.MessagingResponse();

  const line = ROUTES[nanp(event.To || '')];
  if (!line) {
    // Unknown line. Silence beats guessing a destination.
    return callback(null, twiml);
  }

  const from = nanp(event.From || '');
  const isStaff = from !== '' && line.staff.some(function (s) { return nanp(s) === from; });

  if (isStaff) {
    // Staff wrote in. Relaying needs to know which customer they are answering,
    // and that memory lives on maple - which is down, or we would not be here.
    //
    // On a notify line this is a non-event: nobody holds conversations there,
    // so production drops it too. On a relay line it matters, and saying so is
    // the only honest option - the alternative is their message vanishing while
    // they believe a customer received it.
    if (line.mode === 'relay') {
      twiml.message(
        { to: event.From },
        TAG + " Systeme en mode degrade: impossible d'acheminer votre reponse. "
          + 'Le client ne la recevra pas.',
      );
    }
    return callback(null, twiml);
  }

  // Inbound from a customer. Fan out to whoever the directory says covers this
  // line, carrying the sender's number - during an outage that number is the
  // only way anyone can answer at all.
  const media = collectMedia(event);
  const body = [TAG + ' De ' + event.From, event.Body || ''].join('\n').trim();

  line.staff.forEach(function (dest) {
    const message = twiml.message({ to: dest });
    message.body(body);
    media.forEach(function (url) { message.media(url); });
  });

  callback(null, twiml);
};

/**
 * Ten significant digits of a North American number.
 *
 * Same normalisation the service uses, and for the same reason: the directory
 * is hand-edited, and an entry written without the +1 must still be recognised
 * as staff. Getting that wrong here would forward an internal message onward.
 */
function nanp(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 11 && digits.charAt(0) === '1' ? digits.slice(1) : digits;
}

/** Twilio numbers media fields rather than sending an array. */
function collectMedia(event) {
  const count = Number(event.NumMedia || 0);
  const urls = [];
  for (let i = 0; i < count; i++) {
    if (event['MediaUrl' + i]) urls.push(event['MediaUrl' + i]);
  }
  return urls;
}
