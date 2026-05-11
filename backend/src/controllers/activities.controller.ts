import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { syncActivitiesForUser } from '../services/activities.service';
import { parsePagination } from '../utils/pagination';

export async function syncActivities(req: AuthRequest, res: Response): Promise<void> {
  const result = await syncActivitiesForUser(req.userId!);
  res.json(result);
}

export async function getActivities(req: AuthRequest, res: Response): Promise<void> {
  const { skip, perPage, page } = parsePagination(req.query as Record<string, unknown>);

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where: { userId: req.userId },
      orderBy: { startDateLocal: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.activity.count({ where: { userId: req.userId } }),
  ]);

  res.json({ activities, total, page, perPage });
}
