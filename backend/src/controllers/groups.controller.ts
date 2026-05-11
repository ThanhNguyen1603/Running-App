import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/db';
import { createGroupSchema, joinGroupSchema } from '../validators/group.validator';
import { getGroupLeaderboard } from '../services/leaderboard.service';

export async function createGroup(req: AuthRequest, res: Response): Promise<void> {
  const data = createGroupSchema.parse(req.body);

  const challenge = await prisma.challenge.findUnique({ where: { id: data.challengeId } });
  if (!challenge) {
    res.status(404).json({ error: 'Challenge not found' });
    return;
  }

  const group = await prisma.group.create({ data });
  res.status(201).json(group);
}

export async function getMyGroups(req: AuthRequest, res: Response): Promise<void> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId: req.userId },
    include: {
      group: {
        include: {
          challenge: { select: { id: true, name: true, startDate: true, endDate: true, monthlyKmGoal: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });

  res.json(memberships.map((m) => ({ ...m.group, joinedAt: m.joinedAt })));
}

export async function getGroupById(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params['id'] as string;
  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      challenge: true,
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
    },
  });

  if (!group) {
    res.status(404).json({ error: 'Group not found' });
    return;
  }

  res.json(group);
}

export async function joinGroup(req: AuthRequest, res: Response): Promise<void> {
  const { inviteCode } = joinGroupSchema.parse(req.body);

  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) {
    res.status(404).json({ error: 'Invalid invite code' });
    return;
  }

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: req.userId! } },
  });

  if (existing) {
    res.status(409).json({ error: 'Already a member of this group' });
    return;
  }

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: req.userId! },
  });

  res.status(201).json({ message: 'Joined group', groupId: group.id, groupName: group.name });
}

export async function getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  const groupId = req.params['id'] as string;
  const leaderboard = await getGroupLeaderboard(groupId);
  res.json(leaderboard);
}
