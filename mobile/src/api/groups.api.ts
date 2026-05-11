import { apiClient } from './client';

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  challengeId: string;
  joinedAt: string;
  challenge: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    monthlyKmGoal: number;
  };
  _count: { members: number };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalKm: number;
  activeDays: number;
  activeWeeks: number;
}

export async function getMyGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<Group[]>('/groups');
  return data;
}

export async function getGroupById(id: string): Promise<Group & { members: any[]; challenge: any }> {
  const { data } = await apiClient.get(`/groups/${id}`);
  return data;
}

export async function joinGroup(inviteCode: string): Promise<{ message: string; groupId: string; groupName: string }> {
  const { data } = await apiClient.post('/groups/join', { inviteCode });
  return data;
}

export async function getLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get<LeaderboardEntry[]>(`/groups/${groupId}/leaderboard`);
  return data;
}

export async function createGroup(challengeId: string, name: string): Promise<Group> {
  const { data } = await apiClient.post<Group>('/groups', { challengeId, name });
  return data;
}
