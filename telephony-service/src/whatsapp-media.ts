import { createHash } from 'node:crypto';
import { config } from './config.js';
import { downloadVonageMedia, type InboundWhatsApp } from './vonage.js';
import { extensionFor } from './media.js';
import { transcribeAudio } from './transcribe.js';
import type { RecordingStore } from './storage/index.js';

/**
 * Inbound WhatsApp attachments: fetch, archive, and - for voice notes - read.
 *
 * Vonage holds inbound media for a limited window and behind authentication,
 * so a photo nobody fetched now is a photo that is gone. That makes this the
 * one part of the inbound path that cannot be deferred, even though the reply
 * itself is detached.
 *
 * Voice notes matter most. The agent cannot listen, so an untranscribed voice
 * note is an ignored customer - and whisper already runs on this box for call
 * recordings, at no per-minute cost. Sending them to a paid speech API would
 * reintroduce exactly the line item this architecture exists to remove.
 */

export interface ArchivedMedia {
  key: string;
  bytes: number;
  contentType: string;
  /** Only ever set for audio. */
  transcript?: string;
}

function mediaKey(uuid: string, contentType: string, at: Date): string {
  const yyyy = at.getUTCFullYear();
  const mm = String(at.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(at.getUTCDate()).padStart(2, '0');
  // Same date partitioning as recordings, so retention sweeps and "what do
  // you hold on me" requests work the same way for both.
  return `whatsapp/${yyyy}/${mm}/${dd}/${uuid}${extensionFor(contentType)}`;
}

/**
 * Handles one inbound attachment.
 *
 * Returns null instead of throwing on every failure path. A customer who sent
 * a photo with a caption should still get an answer to the caption when the
 * download fails - dropping the whole message because the archive step broke
 * turns a degraded experience into no experience.
 */
export async function archiveInboundMedia(
  store: RecordingStore,
  message: InboundWhatsApp,
): Promise<ArchivedMedia | null> {
  if (!config.vonage.downloadInboundMedia) return null;
  if (!message.media?.url) return null;

  try {
    const { body, contentType } = await downloadVonageMedia(message.media.url);
    const key = mediaKey(message.messageUuid || createHash('sha256')
      .update(message.media.url)
      .digest('hex')
      .slice(0, 24), contentType, new Date());

    await store.put(key, body, {
      contentType,
      source: 'whatsapp',
      messageUuid: message.messageUuid,
      from: message.from,
      kind: message.kind,
      ...(message.media.name ? { originalName: message.media.name } : {}),
    });

    // Verify the same way call recordings are verified. Nothing is deleted
    // upstream here, so a mismatch is a warning rather than a dead-letter -
    // but an archive that silently holds truncated files is worse than none.
    const stored = await store.stat(key);
    if (!stored || stored.bytes !== body.byteLength) {
      console.warn('[whatsapp-media] stored object does not match what was written', {
        key,
        wrote: body.byteLength,
        reports: stored?.bytes ?? 0,
      });
    }

    const archived: ArchivedMedia = { key, bytes: body.byteLength, contentType };

    if (message.kind === 'audio' && config.vonage.transcribeVoiceNotes) {
      // 'auto': a call is answered in a known language, but a voice note is
      // whatever the customer happens to speak, and DSS serves all three.
      const transcript = await transcribeAudio(body, 'auto');
      if (transcript) archived.transcript = transcript;
    }

    console.log('[whatsapp-media] archived', {
      key,
      bytes: body.byteLength,
      contentType,
      transcribed: Boolean(archived.transcript),
    });
    return archived;
  } catch (err) {
    console.error('[whatsapp-media] could not archive inbound media', {
      uuid: message.messageUuid,
      kind: message.kind,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Renders a message into the text the agent actually reads.
 *
 * Hermes receives text, so a photo has to arrive as a described photo and a
 * voice note as its transcript. The description is explicit about what is a
 * transcript rather than typed words, because the two carry different
 * confidence and the agent should be able to hedge accordingly.
 */
export function describeForAgent(
  message: InboundWhatsApp,
  archived: ArchivedMedia | null,
): string {
  const parts: string[] = [];

  switch (message.kind) {
    case 'text':
      return message.text;

    case 'audio':
      if (archived?.transcript) {
        parts.push('[note vocale, transcrite automatiquement]');
        parts.push(archived.transcript);
      } else {
        parts.push('[note vocale reçue, transcription indisponible]');
      }
      break;

    case 'image':
      parts.push('[photo reçue]');
      if (message.text) parts.push(`Légende: ${message.text}`);
      break;

    case 'video':
      parts.push('[vidéo reçue]');
      if (message.text) parts.push(`Légende: ${message.text}`);
      break;

    case 'file':
      parts.push(`[fichier reçu${message.media?.name ? `: ${message.media.name}` : ''}]`);
      if (message.text) parts.push(`Légende: ${message.text}`);
      break;

    case 'sticker':
      parts.push('[sticker reçu]');
      break;

    case 'location':
      parts.push(
        `[position partagée: ${message.location?.lat}, ${message.location?.long}` +
          `${message.location?.address ? ` - ${message.location.address}` : ''}]`,
      );
      break;

    case 'reaction':
      parts.push(
        message.reaction?.action === 'unreact'
          ? '[réaction retirée]'
          : `[a réagi avec ${message.reaction?.emoji ?? '?'}]`,
      );
      break;

    default:
      parts.push(`[message de type ${message.rawType}, non pris en charge]`);
  }

  // The archive key is deliberately included: it is how a human can find the
  // file later, and the only handle the agent could quote back to an employee.
  if (archived) parts.push(`(archivé: ${archived.key})`);

  return parts.join('\n');
}
