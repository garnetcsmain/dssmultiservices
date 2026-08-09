import { Router } from 'express';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { config } from '../config.js';
import { verifyMediaSignature, resolveMediaPath, contentTypeFor } from '../media.js';

/**
 * Serves outbound WhatsApp attachments to Meta's fetchers.
 *
 * This is the one endpoint here that answers unauthenticated requests from the
 * open internet, because WhatsApp fetches media server-side with no way to
 * carry a credential. The signature in the query string is therefore the only
 * thing standing between MEDIA_ROOT and anyone who guesses a filename.
 *
 * Two habits keep that honest: the signature covers the path and the expiry
 * together, and MEDIA_ROOT is a different directory from the recordings
 * archive. Do not merge them - a signed link to a customer call is one
 * forwarded message away from a disclosure.
 */
export function createMediaRoutes(): Router {
  const router = Router();

  router.get(/^\/media\/(.+)$/, async (req, res) => {
    const name = decodeURIComponent((req.params as unknown as string[])[0] ?? '');
    const { exp, sig } = req.query as { exp?: string; sig?: string };

    // Signed over req.path rather than originalUrl: the query string carries
    // the signature itself, and signing over it would be circular.
    if (!exp || !sig || !verifyMediaSignature(req.path, exp, sig)) {
      console.warn('[media] rejected unsigned or expired request', { path: req.path });
      res.status(403).type('text/plain').send('Forbidden');
      return;
    }

    const target = resolveMediaPath(name);
    if (!target) {
      res.status(403).type('text/plain').send('Forbidden');
      return;
    }

    const info = await stat(target).catch(() => null);
    if (!info?.isFile()) {
      res.status(404).type('text/plain').send('Not found');
      return;
    }

    res.setHeader('Content-Type', contentTypeFor(name));
    res.setHeader('Content-Length', String(info.size));
    // The link is already short-lived; caching it anywhere in between only
    // extends the window in which a leaked url still resolves.
    res.setHeader('Cache-Control', 'private, no-store');

    const stream = createReadStream(target);
    stream.on('error', (err) => {
      console.error('[media] read failed', { name, error: err.message });
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
    stream.pipe(res);
  });

  router.get('/media-health', (_req, res) => {
    res.json({ root: config.media.root, ttlSeconds: config.media.ttlSeconds });
  });

  return router;
}
