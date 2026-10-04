import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Level } from '../content/types';
import type { GoalId } from '../content/goals';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface SettingsState {
  onboarded: boolean;
  level: Level;
  primaryGoal: GoalId;
  subTrack: string | undefined;
  diagnosticCompleted: boolean;
  diagnosticScore: number | undefined;
  dailyGoal: number; // sentences per day (default: 10)
  dailyCompletedSentenceIds: string[];
  lastCompletedDate: string;
  totalSentencesMastered: number;

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
  setPrimaryGoal: (goal: GoalId, subTrack?: string) => void;
  setSubTrack: (subTrack?: string) => void;
  setDiagnosticResult: (score: number, level: Level) => void;
  setDailyGoal: (v: number) => void;
  recordSentenceMastered: (sentenceId: string) => void;
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
    (set, get) => ({
      onboarded: false,
      level: 'beginner',
      primaryGoal: 'workplace',
      subTrack: undefined,
      diagnosticCompleted: false,
      diagnosticScore: undefined,
      dailyGoal: 10,
      dailyCompletedSentenceIds: [],
      lastCompletedDate: todayString(),
      totalSentencesMastered: 0,

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
      setPrimaryGoal: (goal, subTrack) => set({ primaryGoal: goal, subTrack }),
      setSubTrack: (subTrack) => set({ subTrack }),
      setDiagnosticResult: (score, level) =>
        set({ diagnosticScore: score, level, diagnosticCompleted: true }),
      setDailyGoal: (v) => set({ dailyGoal: v }),
      recordSentenceMastered: (sentenceId: string) => {
        const today = todayString();
        const state = get();
        const isSameDay = state.lastCompletedDate === today;
        const currentIds = isSameDay ? state.dailyCompletedSentenceIds : [];

        if (!currentIds.includes(sentenceId)) {
          set({
            lastCompletedDate: today,
            dailyCompletedSentenceIds: [...currentIds, sentenceId],
            totalSentencesMastered: (state.totalSentencesMastered || 0) + 1,
          });
        }
      },
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
