// The local player profile. AsyncStorage on phones, localStorage on the web.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface Profile {
  name: string;
  /** Best score of `bestDay`. A new day starts from zero. */
  best: number;
  bestDay: string;
  setName(name: string): void;
  recordScore(day: string, score: number): void;
}

export const useProfile = create<Profile>()(
  persist(
    (set, get) => ({
      name: 'Player',
      best: 0,
      bestDay: '',
      setName: (name) => set({ name: name.slice(0, 16) }),
      recordScore: (day, score) => {
        const { best, bestDay } = get();
        if (day !== bestDay) set({ best: score, bestDay: day });
        else if (score > best) set({ best: score });
      },
    }),
    { name: 'profile', version: 1, storage: createJSONStorage(() => AsyncStorage) },
  ),
);
