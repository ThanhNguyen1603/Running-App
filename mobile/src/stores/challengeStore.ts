import { create } from 'zustand';

interface ChallengeRules {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  monthlyKmGoal: number;
  minDaysPerWeek: number;
  minPaceSecPerKm: number | null;
  maxPaceSecPerKm: number | null;
}

interface ChallengeState {
  activeChallenge: ChallengeRules | null;
  setActiveChallenge: (c: ChallengeRules | null) => void;
}

export const useChallengeStore = create<ChallengeState>()((set) => ({
  activeChallenge: null,
  setActiveChallenge: (c) => set({ activeChallenge: c }),
}));
