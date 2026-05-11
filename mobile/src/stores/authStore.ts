import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAdmin: boolean;
  stravaConnected: boolean;
  userName: string | null;
  avatarUrl: string | null;

  setTokens: (access: string, refresh: string) => void;
  setProfile: (userId: string, isAdmin: boolean, name: string, avatarUrl?: string | null) => void;
  setStravaConnected: (val: boolean) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAdmin: false,
      stravaConnected: false,
      userName: null,
      avatarUrl: null,

      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setProfile: (userId, isAdmin, name, avatarUrl) =>
        set({ userId, isAdmin, userName: name, avatarUrl: avatarUrl ?? null }),
      setStravaConnected: (val) => set({ stravaConnected: val }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          isAdmin: false,
          stravaConnected: false,
          userName: null,
          avatarUrl: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
