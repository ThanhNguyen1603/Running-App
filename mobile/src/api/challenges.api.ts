import { apiClient } from './client';

export interface Challenge {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  monthlyKmGoal: number;
  minDaysPerWeek: number;
  minPaceSecPerKm: number | null;
  maxPaceSecPerKm: number | null;
}

export async function getChallenges(): Promise<Challenge[]> {
  const { data } = await apiClient.get<Challenge[]>('/challenges');
  return data;
}

export async function createChallenge(payload: Omit<Challenge, 'id'>): Promise<Challenge> {
  const { data } = await apiClient.post<Challenge>('/challenges', payload);
  return data;
}
