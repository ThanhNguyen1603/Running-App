import { Request, Response } from 'express';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { syncSingleActivityForUser } from '../services/activities.service';
import { logger } from '../utils/logger';

export function stravaWebhookValidation(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    logger.info('Strava webhook validated');
    res.json({ 'hub.challenge': challenge });
    return;
  }

  res.status(403).json({ error: 'Forbidden' });
}

export function stravaWebhookEvent(req: Request, res: Response): void {
  // Always respond 200 immediately — Strava requires < 2s response
  res.sendStatus(200);

  const { object_type, aspect_type, object_id, owner_id } = req.body as {
    object_type: string;
    aspect_type: string;
    object_id: number;
    owner_id: number;
  };

  if (object_type !== 'activity' || aspect_type !== 'create') return;

  // Process asynchronously — do not block the response
  setImmediate(async () => {
    try {
      const conn = await prisma.stravaConnection.findUnique({
        where: { stravaAthleteId: String(owner_id) },
      });

      if (!conn) {
        logger.warn(`No user found for Strava athlete ${owner_id}`);
        return;
      }

      await syncSingleActivityForUser(conn.userId, String(object_id));
      logger.info(`Webhook: synced activity ${object_id} for user ${conn.userId}`);
    } catch (err) {
      logger.error(`Webhook processing error for activity ${object_id}`, err);
    }
  });
}
