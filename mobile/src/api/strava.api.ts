import { apiClient } from './client';

export async function getStravaConnectUrl(): Promise<string> {
  const { data } = await apiClient.get<{ url: string }>('/strava/connect');
  return data.url;
}

export async function disconnectStrava(): Promise<void> {
  await apiClient.delete('/strava/disconnect');
}

export async function getStravaStatus(): Promise<{ connected: boolean }> {
  const { data } = await apiClient.get<{ connected: boolean }>('/strava/status');
  return data;
}
