import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    avatarUrl: string | null;
    stravaConnected: boolean;
  };
}

export async function register(email: string, password: string, name: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/register', { email, password, name });
  return data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  return data;
}
