import { prisma } from '../config/db';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile: string;
  };
}

export async function exchangeCodeForTokens(code: string): Promise<StravaTokenResponse> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const err = new Error('Failed to exchange Strava code') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  return res.json() as Promise<StravaTokenResponse>;
}

export async function ensureFreshToken(userId: string): Promise<string> {
  const conn = await prisma.stravaConnection.findUnique({ where: { userId } });
  if (!conn) {
    const err = new Error('Strava not connected') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  if (conn.tokenExpiresAt > fiveMinutesFromNow) {
    return conn.accessToken;
  }

  logger.info(`Refreshing Strava token for user ${userId}`);
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      refresh_token: conn.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = new Error('Failed to refresh Strava token') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_at: number };

  await prisma.stravaConnection.update({
    where: { userId },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(data.expires_at * 1000),
    },
  });

  return data.access_token;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  average_speed: number;
  start_date_local: string;
}

export async function fetchStravaActivities(
  accessToken: string,
  after: Date,
  page = 1
): Promise<StravaActivity[]> {
  const afterTs = Math.floor(after.getTime() / 1000);
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${afterTs}&page=${page}&per_page=100`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`Strava API error: ${res.status}`);
  }

  return res.json() as Promise<StravaActivity[]>;
}

export async function fetchSingleStravaActivity(
  accessToken: string,
  activityId: string
): Promise<StravaActivity> {
  const res = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    throw new Error(`Strava API error: ${res.status}`);
  }

  return res.json() as Promise<StravaActivity>;
}
