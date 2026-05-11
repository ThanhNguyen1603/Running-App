import { apiClient } from './client';

export interface Activity {
  id: string;
  stravaActivityId: string;
  distanceM: number;
  movingTimeSec: number;
  averageSpeedMs: number;
  startDateLocal: string;
  isValid: boolean;
  validationReason: string;
}

export interface PaginatedActivities {
  data: Activity[];
  total: number;
  page: number;
  pageSize: number;
}

export async function syncActivities(): Promise<{ synced: number; message: string }> {
  const { data } = await apiClient.post('/activities/sync');
  return data;
}

export async function getActivities(page = 1, pageSize = 20): Promise<PaginatedActivities> {
  const { data } = await apiClient.get<PaginatedActivities>('/activities', {
    params: { page, pageSize },
  });
  return data;
}
