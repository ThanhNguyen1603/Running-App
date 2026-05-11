import { z } from 'zod';

export const createChallengeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  minDaysPerWeek: z.number().int().min(1).max(7).default(3),
  minPaceSecPerKm: z.number().int().positive().optional(),
  maxPaceSecPerKm: z.number().int().positive().optional(),
  monthlyKmGoal: z.number().positive(),
}).refine(
  (d) => new Date(d.endDate) > new Date(d.startDate),
  { message: 'endDate must be after startDate', path: ['endDate'] }
).refine(
  (d) => !d.minPaceSecPerKm || !d.maxPaceSecPerKm || d.minPaceSecPerKm > d.maxPaceSecPerKm,
  { message: 'minPaceSecPerKm (slowest) must be greater than maxPaceSecPerKm (fastest)', path: ['minPaceSecPerKm'] }
);
