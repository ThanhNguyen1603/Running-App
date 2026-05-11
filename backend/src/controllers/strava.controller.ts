import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { exchangeCodeForTokens } from '../services/strava.service';
import { logger } from '../utils/logger';

export async function connectStrava(req: AuthRequest, res: Response): Promise<void> {
  const params = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID,
    redirect_uri: env.STRAVA_REDIRECT_URI,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
    state: req.userId!,
  });

  const url = `https://www.strava.com/oauth/authorize?${params.toString()}`;
  res.json({ url });
}

export async function stravaCallback(req: Request, res: Response): Promise<void> {
  const { code, state: userId, error } = req.query as Record<string, string>;
  const deepLink = env.MOBILE_DEEP_LINK;

  if (error || !code || !userId) {
    logger.warn('Strava OAuth error', { error, code: !!code, userId: !!userId });
    res.redirect(`${deepLink}://strava?success=false&error=${error ?? 'missing_params'}`);
    return;
  }

  try {
    const data = await exchangeCodeForTokens(code);

    await prisma.stravaConnection.upsert({
      where: { userId },
      create: {
        userId,
        stravaAthleteId: String(data.athlete.id),
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(data.expires_at * 1000),
        scope: data.scope,
      },
      update: {
        stravaAthleteId: String(data.athlete.id),
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(data.expires_at * 1000),
        scope: data.scope,
      },
    });

    // Update user avatar from Strava profile
    const avatarUrl = data.athlete.profile;
    if (avatarUrl && !avatarUrl.includes('avatar/athlete/large')) {
      await prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
    }

    logger.info(`Strava connected for user ${userId}`);
    res.redirect(`${deepLink}://strava?success=true`);
  } catch (err) {
    logger.error('Strava callback error', err);
    res.redirect(`${deepLink}://strava?success=false&error=server_error`);
  }
}

export async function disconnectStrava(req: AuthRequest, res: Response): Promise<void> {
  await prisma.stravaConnection.deleteMany({ where: { userId: req.userId } });
  res.json({ message: 'Strava disconnected' });
}

export async function stravaStatus(req: AuthRequest, res: Response): Promise<void> {
  const conn = await prisma.stravaConnection.findUnique({
    where: { userId: req.userId },
    select: { connectedAt: true, scope: true },
  });
  res.json({ connected: !!conn, connectedAt: conn?.connectedAt ?? null });
}
