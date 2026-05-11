import { z } from 'zod';

export const createGroupSchema = z.object({
  challengeId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1),
});
