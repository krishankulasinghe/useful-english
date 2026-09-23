import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Level } from '../content/types';

export interface SettingsState {
  onboarded: boolean;
  level: Level;
  dailyGoal: number;
  reminderOn: boolean;
  reminderTime: string; // "HH:mm"
  textSize: 's' | 'm' | 'l';
  showPronunciation: boolean;
  showMeaning: boolean;
  theme: 'light' | 'dark';
  appLanguage: 'en' | 'si';
  autoPlayAudio: boolean;
  lastCategoryId: string | undefined;
  practiceDirection: 'en' | 'si'; // 'en' = English -> Sinhala, 'si' = Sinhala -> English
  lastInterstitialAt: number | undefined;

  setOnboarded: (v: boolean) => void;
  setLevel: (v: Level) => void;
  setDailyGoal: (v: number) => void;
  setReminderOn: (v: boolean) => void;
  setReminderTime: (v: string) => void;
  setTextSize: (v: 's' | 'm' | 'l') => void;
  setShowPronunciation: (v: boolean) => void;
  setShowMeaning: (v: boolean) => void;
  setTheme: (v: 'light' | 'dark') => void;
  setAppLanguage: (v: 'en' | 'si') => void;
  setAutoPlayAudio: (v: boolean) => void;
  setLastCategoryId: (v: string | undefined) => void;
  setPracticeDirection: (v: 'en' | 'si') => void;
  setLastInterstitialAt: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      onboarded: false,
      level: 'beginner',
      dailyGoal: 10,
      reminderOn: true,
      reminderTime: '19:30',
      textSize: 'm',
      showPronunciation: true,
      showMeaning: true,
      theme: 'light',
      appLanguage: 'en',
      autoPlayAudio: false,
      lastCategoryId: undefined,
      practiceDirection: 'en',
      lastInterstitialAt: undefined,

      setOnboarded: (v) => set({ onboarded: v }),
      setLevel: (v) => set({ level: v }),
      setDailyGoal: (v) => set({ dailyGoal: v }),
      setReminderOn: (v) => set({ reminderOn: v }),
      setReminderTime: (v) => set({ reminderTime: v }),
      setTextSize: (v) => set({ textSize: v }),
      setShowPronunciation: (v) => set({ showPronunciation: v }),
      setShowMeaning: (v) => set({ showMeaning: v }),
      setTheme: (v) => set({ theme: v }),
      setAppLanguage: (v) => set({ appLanguage: v }),
      setAutoPlayAudio: (v) => set({ autoPlayAudio: v }),
      setLastCategoryId: (v) => set({ lastCategoryId: v }),
      setPracticeDirection: (v) => set({ practiceDirection: v }),
      setLastInterstitialAt: (v) => set({ lastInterstitialAt: v }),
    }),
    {
      name: 'sineng-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
