import { prisma } from '../config/db';
import { ensureFreshToken, fetchStravaActivities, fetchSingleStravaActivity, StravaActivity } from './strava.service';
import { logger } from '../utils/logger';
import { Challenge } from '@prisma/client';

function validateActivity(
  act: StravaActivity,
  challenge: Challenge
): { isValid: boolean; validationReason: string } {
  if (act.type !== 'Run') {
    return { isValid: false, validationReason: 'not_a_run' };
  }

  if (act.distance < 1000) {
    return { isValid: false, validationReason: 'distance_too_short' };
  }

  if (act.average_speed <= 0) {
    return { isValid: false, validationReason: 'invalid_speed' };
  }

  const paceSecPerKm = Math.round(1000 / act.average_speed);

  if (challenge.minPaceSecPerKm !== null && paceSecPerKm > challenge.minPaceSecPerKm) {
    return { isValid: false, validationReason: 'pace_too_slow' };
  }

  if (challenge.maxPaceSecPerKm !== null && paceSecPerKm < challenge.maxPaceSecPerKm) {
    return { isValid: false, validationReason: 'pace_too_fast' };
  }

  return { isValid: true, validationReason: 'valid' };
}

async function getActiveChallengeForUser(userId: string): Promise<Challenge | null> {
  const now = new Date();
  const membership = await prisma.groupMember.findFirst({
    where: { userId },
    include: {
      group: {
        include: { challenge: true },
      },
    },
  });

  if (!membership) return null;
  const challenge = membership.group.challenge;
  if (challenge.startDate > now || challenge.endDate < now) return null;
  return challenge;
}

export async function syncActivitiesForUser(userId: string): Promise<{ synced: number; message: string }> {
  const accessToken = await ensureFreshToken(userId);
  const challenge = await getActiveChallengeForUser(userId);

  if (!challenge) {
    return { synced: 0, message: 'No active challenge found' };
  }

  const activities = await fetchStravaActivities(accessToken, challenge.startDate);
  let synced = 0;

  for (const act of activities) {
    const { isValid, validationReason } = validateActivity(act, challenge);

    await prisma.activity.upsert({
      where: { stravaActivityId: String(act.id) },
      create: {
        userId,
        stravaActivityId: String(act.id),
        distanceM: act.distance,
        movingTimeSec: act.moving_time,
        averageSpeedMs: act.average_speed,
        startDateLocal: new Date(act.start_date_local),
        isValid,
        validationReason,
      },
      update: { isValid, validationReason },
    });
    synced++;
  }

  logger.info(`Synced ${synced} activities for user ${userId}`);
  return { synced, message: `Synced ${synced} activities` };
}

export async function syncSingleActivityForUser(userId: string, stravaActivityId: string): Promise<void> {
  const accessToken = await ensureFreshToken(userId);
  const challenge = await getActiveChallengeForUser(userId);

  const act = await fetchSingleStravaActivity(accessToken, stravaActivityId);
  const { isValid, validationReason } = challenge
    ? validateActivity(act, challenge)
    : { isValid: false, validationReason: 'no_active_challenge' };

  await prisma.activity.upsert({
    where: { stravaActivityId: String(act.id) },
    create: {
      userId,
      stravaActivityId: String(act.id),
      distanceM: act.distance,
      movingTimeSec: act.moving_time,
      averageSpeedMs: act.average_speed,
      startDateLocal: new Date(act.start_date_local),
      isValid,
      validationReason,
    },
    update: { isValid, validationReason },
  });

  logger.info(`Synced single activity ${stravaActivityId} for user ${userId}`);
}
