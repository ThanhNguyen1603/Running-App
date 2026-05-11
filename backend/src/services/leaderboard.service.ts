import { prisma } from '../config/db';

interface LeaderboardRow {
  userId: string;
  name: string;
  avatarUrl: string | null;
  totalKm: string;
  activeDays: string;
  activeWeeks: string;
}

export async function getGroupLeaderboard(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { challenge: true },
  });

  if (!group) {
    const err = new Error('Group not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const { startDate, endDate, monthlyKmGoal } = group.challenge;

  const rows = await prisma.$queryRaw<LeaderboardRow[]>`
    SELECT
      u.id              AS "userId",
      u.name            AS "name",
      u."avatarUrl"     AS "avatarUrl",
      COALESCE(SUM(a."distanceM"), 0) / 1000.0      AS "totalKm",
      COUNT(DISTINCT DATE(a."startDateLocal"))       AS "activeDays",
      COUNT(DISTINCT DATE_TRUNC('week', a."startDateLocal")) AS "activeWeeks"
    FROM "GroupMember" gm
    JOIN "User" u ON u.id = gm."userId"
    LEFT JOIN "Activity" a
      ON  a."userId"       = gm."userId"
      AND a."isValid"      = true
      AND a."startDateLocal" >= ${startDate}
      AND a."startDateLocal" <= ${endDate}
    WHERE gm."groupId" = ${groupId}
    GROUP BY u.id, u.name, u."avatarUrl"
    ORDER BY "totalKm" DESC
  `;

  return rows.map((row) => ({
    userId: row.userId,
    name: row.name,
    avatarUrl: row.avatarUrl,
    totalKm: parseFloat(row.totalKm),
    activeDays: Number(row.activeDays),
    activeWeeks: Number(row.activeWeeks),
    monthlyKmGoal,
    progressPercent: Math.min(100, Math.round((parseFloat(row.totalKm) / monthlyKmGoal) * 100)),
  }));
}
