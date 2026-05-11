import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { createChallengeSchema } from '../validators/challenge.validator';

export async function createChallenge(req: AuthRequest, res: Response): Promise<void> {
  const data = createChallengeSchema.parse(req.body);

  const challenge = await prisma.challenge.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdBy: req.userId!,
    },
  });

  res.status(201).json(challenge);
}

export async function getChallenges(_req: AuthRequest, res: Response): Promise<void> {
  const challenges = await prisma.challenge.findMany({
    orderBy: { startDate: 'desc' },
    include: { _count: { select: { groups: true } } },
  });
  res.json(challenges);
}

export async function getChallengeById(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params['id'] as string;
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: { groups: { include: { _count: { select: { members: true } } } } },
  });

  if (!challenge) {
    res.status(404).json({ error: 'Challenge not found' });
    return;
  }

  res.json(challenge);
}
