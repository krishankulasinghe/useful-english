import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Card,
  DarkButton,
  HeroCard,
  OutlineButton,
  PrimaryButton,
  ProgressBar,
  Screen,
  SegmentedControl,
} from '../../../src/components';
import { preloadPracticeInterstitial, showPracticeInterstitial } from '../../../src/ads/interstitial';
import { useContentContext } from '../../../src/content/ContentProvider';
import { GOALS, getGoal } from '../../../src/content/goals';
import { useDailySentences } from '../../../src/content/hooks';
import type { VocabItem } from '../../../src/content/types';
import { Icon, type IconName } from '../../../src/icons/Icon';
import { useProgressRepo, useSaved, useStreak } from '../../../src/state/hooks';
import { useSettingsStore } from '../../../src/state/settingsStore';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

const FALLBACK_CATEGORY_ID = 'v-verbs';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ResolvedDeck {
  categoryId: string | undefined;
  label: string;
  words: VocabItem[];
}

export default function PracticeScreen() {
  const router = useRouter();
  const { colors, space, radius, shadows } = useTheme();
  const { deck: deckParam } = useLocalSearchParams<{ deck?: string }>();
  const { repository, contentRevision } = useContentContext();
  const progressRepo = useProgressRepo();
  const streak = useStreak();

  const primaryGoal = useSettingsStore((s) => s.primaryGoal);
  const subTrack = useSettingsStore((s) => s.subTrack);
  const level = useSettingsStore((s) => s.level);
  const dailyGoalCount = useSettingsStore((s) => s.dailyGoal);
  const dailyCompletedSentenceIds = useSettingsStore((s) => s.dailyCompletedSentenceIds);
  const lastCompletedDate = useSettingsStore((s) => s.lastCompletedDate);
  const totalMastered = useSettingsStore((s) => s.totalSentencesMastered);

  const lastCategoryId = useSettingsStore((s) => s.lastCategoryId);
  const direction = useSettingsStore((s) => s.practiceDirection);
  const setDirection = useSettingsStore((s) => s.setPracticeDirection);
  const lastInterstitialAt = useSettingsStore((s) => s.lastInterstitialAt);
  const setLastInterstitialAt = useSettingsStore((s) => s.setLastInterstitialAt);

  const [activeGymTab, setActiveGymTab] = useState<'workouts' | 'vocab'>(deckParam ? 'vocab' : 'workouts');
  const [savedCount, setSavedCount] = useState(0);

  // Today's Sentences
  const today = useMemo(() => todayKey(), []);
  const activeGoal = useMemo(() => getGoal(primaryGoal), [primaryGoal]);

  const dailySentences = useDailySentences({
    date: today,
    level,
    goalId: primaryGoal,
    subTrackId: subTrack,
    count: dailyGoalCount || 10,
  });

  const isTodayCompleted = lastCompletedDate === today;
  const completedTodayCount = isTodayCompleted ? dailyCompletedSentenceIds.length : 0;
  const targetCount = dailySentences.length || dailyGoalCount || 10;
  const progressRatio = targetCount > 0 ? Math.min(completedTodayCount / targetCount, 1) : 0;

  // Load saved count
  useEffect(() => {
    (async () => {
      const saved = (await progressRepo?.listSaved()) ?? [];
      setSavedCount(saved.length);
    })();
  }, [progressRepo]);

  // Vocab Deck logic
  const [deck, setDeck] = useState<ResolvedDeck | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    preloadPracticeInterstitial();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!repository) return;
    const repo = repository;

    (async () => {
      async function savedWords(): Promise<VocabItem[]> {
        const saved = (await progressRepo?.listSaved()) ?? [];
        const ids = saved.filter((s) => s.itemType === 'word').map((s) => s.itemId);
        const items = await Promise.all(ids.map((id) => repo.getWord(id)));
        return items.filter((w): w is VocabItem => !!w);
      }

      const paramCategoryId = deckParam?.startsWith('category:') ? deckParam.slice('category:'.length) : undefined;
      const wantsSaved = deckParam === 'saved';

      let categoryId: string | undefined;
      let words: VocabItem[];

      if (paramCategoryId) {
        categoryId = paramCategoryId;
        words = await repo.getWords(categoryId);
      } else if (wantsSaved) {
        words = await savedWords();
      } else if (lastCategoryId) {
        categoryId = lastCategoryId;
        words = await repo.getWords(categoryId);
        if (words.length === 0) {
          categoryId = undefined;
          words = await savedWords();
        }
      } else {
        words = await savedWords();
      }

      if (words.length === 0 && !categoryId && !wantsSaved) {
        categoryId = FALLBACK_CATEGORY_ID;
        words = await repo.getWords(categoryId);
      }

      let label = 'Core Vocabulary';
      if (categoryId) {
        const category = await repo.getCategory(categoryId);
        label = category?.en ?? label;
      }

      if (!cancelled) {
        setDeck({ categoryId, label, words });
        setIndex(0);
        setRevealed(false);
        setFinished(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [repository, contentRevision, deckParam, lastCategoryId, progressRepo]);

  const advanceVocab = useCallback(() => {
    if (!deck) return;
    progressRepo?.recordActivity(todayKey());
    if (index < deck.words.length - 1) {
      setIndex((i) => i + 1);
      setRevealed(false);
    } else {
      showPracticeInterstitial({
        lastInterstitialAt,
        recordInterstitialShown: setLastInterstitialAt,
        onDismiss: () => setFinished(true),
      });
    }
  }, [deck, index, progressRepo, lastInterstitialAt, setLastInterstitialAt]);

  const handleKnowThis = useCallback(() => {
    const word = deck?.words[index];
    if (word) progressRepo?.markLearned(word.id);
    advanceVocab();
  }, [deck, index, progressRepo, advanceVocab]);

  const handlePracticeAgain = useCallback(() => {
    setIndex(0);
    setRevealed(false);
    setFinished(false);
  }, []);

  const word = deck?.words[index];
  const isEnFront = direction === 'en';

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[16] }}>
      {/* Top Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[12] }}>
        <View>
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, color: colors.ink }}>
            Practice Gym
          </Text>
          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.muted }}>
            කතා පුහුණුව හා ෆ්ලෑෂ් කාඩ්
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="settings" size={20} color={colors.ink} strokeWidth={1.8} />
        </Pressable>
      </View>

      {/* Gym Mode Selector: Spoken Workouts vs Vocabulary Deck */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, padding: 4, borderRadius: 16, borderWidth: 1, borderColor: colors.cardBorder }}>
        <Pressable
          onPress={() => setActiveGymTab('workouts')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: activeGymTab === 'workouts' ? colors.primaryDark : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.jakarta700,
              fontSize: 13,
              color: activeGymTab === 'workouts' ? colors.white : colors.ink,
            }}
          >
            Spoken Workouts · කතා පුහුණුව
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveGymTab('vocab')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: activeGymTab === 'vocab' ? colors.primaryDark : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: fontFamily.jakarta700,
              fontSize: 13,
              color: activeGymTab === 'vocab' ? colors.white : colors.ink,
            }}
          >
            Vocab Flashcards · වචන
          </Text>
        </Pressable>
      </View>

      {/* ================= WORKOUTS TAB ================= */}
      {activeGymTab === 'workouts' ? (
        <View style={{ gap: space[16] }}>
          {/* Daily 10 Sentences Hero Workout */}
          <HeroCard radius={26} padding={space[20]} style={{ gap: space[14] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: colors.primaryTint,
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                }}
              >
                <Icon name="sparkles" size={15} color={colors.primaryDark} />
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, color: colors.primaryDark }}>
                  Daily Spoken Habit
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Icon name="flame" size={16} color={colors.saffron} />
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.saffron }}>
                  {streak} days
                </Text>
              </View>
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 22, color: colors.ink }}>
                Today's 10 Sentences Workout
              </Text>
              <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.muted }}>
                {activeGoal.en} · {activeGoal.si}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.muted }}>
                  Progress
                </Text>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.primary }}>
                  {completedTodayCount} / {targetCount} Spoken
                </Text>
              </View>
              <ProgressBar progress={progressRatio} />
            </View>

            <PrimaryButton
              label={
                completedTodayCount >= targetCount
                  ? 'Review Today’s Sentences · නැවත බලන්න'
                  : 'Start Daily Workout · පුහුණුව අරඹන්න'
              }
              height={52}
              onPress={() => router.push('/practice/workout?mode=daily')}
            />
          </HeroCard>

          {/* Practice Saved Notebook Section */}
          <Pressable
            onPress={() => router.push('/practice/workout?mode=saved')}
            accessibilityRole="button"
            accessibilityLabel="Practice saved sentences"
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius[22],
              padding: space[18],
              borderWidth: 1.5,
              borderColor: colors.cardBorder,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              ...shadows.hero,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: colors.saffronTint,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="bookmark" size={24} color={colors.saffron} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 16, color: colors.ink }}>
                  Practice Saved Notebook
                </Text>
                <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.muted, marginTop: 2 }}>
                  {savedCount > 0
                    ? `ඔබ සුරැකි වාක්‍ය ${savedCount}ක් පුහුණු වන්න`
                    : 'ඔබ සුරැකි වාක්‍ය මෙතැනින් පුහුණු වන්න'}
                </Text>
              </View>
            </View>
            <Icon name="arrow-right" size={20} color={colors.primary} />
          </Pressable>

          {/* Practice Real-World Situations Header */}
          <View style={{ marginTop: 4 }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Practice Real-World Situations · අවස්ථා අනුව පුහුණුව
            </Text>
          </View>

          {/* 5 Real-World Situation Cards */}
          <View style={{ gap: space[10] }}>
            {GOALS.map((g) => (
              <Pressable
                key={g.id}
                onPress={() =>
                  router.push({
                    pathname: '/practice/workout',
                    params: { mode: 'situation', goal: g.id },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Practice ${g.en}`}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius[18],
                  padding: space[16],
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor: colors.primaryTint,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={g.icon} size={20} color={colors.primaryDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 15.5, color: colors.ink }}>
                      {g.en}
                    </Text>
                    <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 12.5, color: colors.muted }}>
                      {g.si}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.primary }}>
                    Drill →
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        /* ================= VOCABULARY DECK TAB ================= */
        <View style={{ gap: space[14] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {deck?.label ?? 'Flashcards'}
            </Text>
            {deck && deck.words.length > 0 ? (
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.ink2 }}>
                {index + 1} of {deck.words.length}
              </Text>
            ) : null}
          </View>

          {deck && deck.words.length > 0 ? <ProgressBar progress={(index + 1) / deck.words.length} /> : null}

          {deck && deck.words.length === 0 ? (
            <View style={{ padding: space[32], alignItems: 'center', justifyContent: 'center', gap: space[8] }}>
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>Nothing to practice yet</Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
                Save some words or browse a category to build a deck.
              </Text>
            </View>
          ) : deck && word ? (
            <>
              <SegmentedControl
                accessibilityLabel="Card direction"
                height={40}
                value={direction}
                onChange={(v) => setDirection(v as 'en' | 'si')}
                options={[
                  { value: 'en', label: 'English → සිංහල' },
                  { value: 'si', label: 'සිංහල → English' },
                ]}
              />

              {finished ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={[
                    { backgroundColor: colors.surface, borderRadius: radius[28], padding: space[24], justifyContent: 'center', alignItems: 'center', gap: space[14], minHeight: 300 },
                    shadows.flashcard,
                  ]}
                >
                  <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, color: colors.ink, textAlign: 'center' }}>Deck complete!</Text>
                  <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.muted, textAlign: 'center' }}>
                    You practiced {deck.words.length} {deck.words.length === 1 ? 'word' : 'words'}.
                  </Text>
                  <DarkButton label="Practice again" icon="cards" onPress={handlePracticeAgain} fullWidth={false} />
                </View>
              ) : (
                <View
                  accessibilityLiveRegion="polite"
                  style={[
                    { backgroundColor: colors.surface, borderRadius: radius[28], padding: space[24], justifyContent: 'center', gap: space[14], minHeight: 300 },
                    shadows.flashcard,
                  ]}
                >
                  {isEnFront ? (
                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 44, lineHeight: 48, letterSpacing: -0.4, color: colors.ink, textAlign: 'center' }}>
                        {word.en}
                      </Text>
                      <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 20, color: colors.saffron, textAlign: 'center' }}>
                        {word.pronunciationSi}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.muted }}>
                        WHAT IS THIS IN ENGLISH?
                      </Text>
                      <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 30, lineHeight: 42, color: colors.primary, textAlign: 'center' }}>
                        {word.meaningSi}
                      </Text>
                    </View>
                  )}

                  {revealed ? (
                    <View style={{ gap: space[12] }}>
                      <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
                      {isEnFront ? (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.muted }}>
                            තේරුම · MEANING
                          </Text>
                          <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 26, lineHeight: 38, color: colors.primary, textAlign: 'center' }}>
                            {word.meaningSi}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 36, lineHeight: 40, color: colors.ink, textAlign: 'center' }}>
                            {word.en}
                          </Text>
                          <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 18, color: colors.saffron, textAlign: 'center' }}>
                            {word.pronunciationSi}
                          </Text>
                        </View>
                      )}
                      <View style={{ backgroundColor: colors.bg, borderRadius: radius[16], paddingVertical: 12, paddingHorizontal: 14, gap: 2 }}>
                        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.ink }}>{word.example.en}</Text>
                        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.saffron }}>{word.example.pronunciationSi}</Text>
                        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.primary }}>{word.example.meaningSi}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}

              {!finished ? (
                revealed ? (
                  <View style={{ flexDirection: 'row', gap: space[10] }}>
                    <View style={{ flex: 1 }}>
                      <OutlineButton label="Still learning" tone="muted" height={54} onPress={advanceVocab} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <PrimaryButton label="I know this" height={54} onPress={handleKnowThis} />
                    </View>
                  </View>
                ) : (
                  <PrimaryButton
                    label={isEnFront ? 'Show meaning · තේරුම බලන්න' : 'Show English · ඉංග්‍රීසි බලන්න'}
                    height={54}
                    onPress={() => setRevealed(true)}
                  />
                )
              ) : null}
            </>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
