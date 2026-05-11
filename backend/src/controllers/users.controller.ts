import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, avatarUrl: true, isAdmin: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const stravaConn = await prisma.stravaConnection.findUnique({
    where: { userId: req.userId },
    select: { connectedAt: true },
  });

  res.json({ ...user, stravaConnected: !!stravaConn });
}

export async function updateMe(req: AuthRequest, res: Response): Promise<void> {
  const data = updateProfileSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.userId },
    data,
    select: { id: true, email: true, name: true, avatarUrl: true, isAdmin: true },
  });

  res.json(user);
}
