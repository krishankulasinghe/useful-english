import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  DarkButton,
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
  const insets = useSafeAreaInsets();
  const { colors, space, shadows } = useTheme();
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

  const overline = { fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.88, color: colors.muted } as const;
  const remaining = Math.max(targetCount - completedTodayCount, 0);

  return (
    <Screen scroll contentContainerStyle={{ paddingTop: insets.top + space[24], paddingBottom: space[24], gap: space[20] }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, lineHeight: 22, color: colors.muted }}>කතා පුහුණුව</Text>
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 26, lineHeight: 30, color: colors.ink }}>Practice</Text>
        </View>
        <View
          accessibilityLabel={`${streak} day streak`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            height: 40,
            paddingHorizontal: 14,
            borderRadius: 999,
            backgroundColor: colors.saffronTint,
          }}
        >
          <Icon name="flame" size={18} color={colors.saffron} strokeWidth={2} />
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 15, color: colors.saffron }}>{streak}</Text>
        </View>
      </View>

      {/* Mode switch: Spoken workouts / Vocab flashcards */}
      <SegmentedControl
        accessibilityLabel="Practice mode"
        height={36}
        radius={22}
        value={activeGymTab}
        onChange={(v) => setActiveGymTab(v as 'workouts' | 'vocab')}
        options={[
          { value: 'workouts', label: 'Spoken workouts' },
          { value: 'vocab', label: 'Vocab flashcards' },
        ]}
      />

      {/* ================= WORKOUTS TAB ================= */}
      {activeGymTab === 'workouts' ? (
        <View style={{ gap: space[20] }}>
          {/* Daily spoken habit hero */}
          <View style={[{ backgroundColor: colors.primary, borderRadius: 28, padding: 20, gap: 16 }, shadows.indigo]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.88, color: colors.onPrimarySoft }}>
                  DAILY SPOKEN HABIT
                </Text>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 22, lineHeight: 26, color: colors.white }}>
                  Today's {targetCount} sentences
                </Text>
                <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, lineHeight: 20.8, color: colors.onPrimarySoft }}>
                  {activeGoal.en} · {activeGoal.si}
                </Text>
              </View>
              <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, lineHeight: 28, color: colors.white }}>
                {Math.min(completedTodayCount, targetCount)}
                <Text style={{ fontSize: 16, color: colors.onPrimarySoft }}>/{targetCount}</Text>
              </Text>
            </View>
            <ProgressBar progress={progressRatio} height={8} trackColor={colors.primaryOnHero} fillColor={colors.white} />
            <Pressable
              onPress={() => router.push('/practice/workout?mode=daily')}
              accessibilityRole="button"
              style={({ pressed }) => ({
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.white,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 16, color: colors.primaryDark }}>
                {remaining === 0
                  ? 'Review today’s sentences'
                  : completedTodayCount > 0
                  ? `Continue workout · ${remaining} left`
                  : 'Start daily workout'}
              </Text>
              <Icon name="arrow-right" size={20} color={colors.primaryDark} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Saved sentences */}
          <Pressable
            onPress={() => router.push('/practice/workout?mode=saved')}
            accessibilityRole="button"
            accessibilityLabel="Practice saved sentences"
            style={[
              {
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              },
              shadows.e1,
            ]}
          >
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bookmark" size={22} color={colors.saffron} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>Saved sentences</Text>
              <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, lineHeight: 20.8, color: colors.muted }}>
                {savedCount > 0 ? `ඔබ සුරැකි වාක්‍ය ${savedCount}ක් පුහුණු වන්න` : 'ඔබ සුරැකි වාක්‍ය මෙතැනින් පුහුණු වන්න'}
              </Text>
            </View>
            {savedCount > 0 ? (
              <View style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.neutralFill, justifyContent: 'center' }}>
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.ink }}>{savedCount}</Text>
              </View>
            ) : null}
          </Pressable>

          {/* Practise by situation */}
          <View style={{ gap: 12 }}>
            <Text style={overline}>PRACTISE BY SITUATION · අවස්ථා අනුව</Text>
            <View style={[{ backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden' }, shadows.e1]}>
              {GOALS.map((g, i) => (
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
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: i < GOALS.length - 1 ? 1 : 0,
                    borderBottomColor: colors.cardBorder,
                    backgroundColor: pressed ? '#FAFAF8' : colors.surface,
                  })}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={g.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.ink }}>{g.en}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, lineHeight: 20.8, color: colors.muted }}>
                      {g.si}
                    </Text>
                  </View>
                  <View style={{ height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.primaryTint, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.primaryDark }}>Drill</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ) : (
        /* ================= VOCABULARY DECK TAB ================= */
        <View style={{ gap: space[20] }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text style={overline}>{(deck?.label ?? 'Flashcards').toUpperCase()}</Text>
            {deck && deck.words.length > 0 ? (
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.ink2 }}>
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
                height={36}
                radius={22}
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
                    { backgroundColor: colors.surface, borderRadius: 28, padding: 28, justifyContent: 'center', alignItems: 'center', gap: space[14], minHeight: 300 },
                    shadows.e2,
                  ]}
                >
                  <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, color: colors.ink, textAlign: 'center' }}>Deck complete!</Text>
                  <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.muted, textAlign: 'center' }}>
                    You practiced {deck.words.length} {deck.words.length === 1 ? 'word' : 'words'}.
                  </Text>
                  <DarkButton label="Practice again" icon="cards" onPress={handlePracticeAgain} fullWidth={false} />
                </View>
              ) : (
                <Pressable
                  onPress={() => setRevealed(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Tap the card to check"
                  accessibilityLiveRegion="polite"
                  style={[
                    {
                      backgroundColor: colors.surface,
                      borderRadius: 28,
                      paddingVertical: 28,
                      paddingHorizontal: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 12,
                      minHeight: 300,
                    },
                    shadows.e2,
                  ]}
                >
                  {isEnFront ? (
                    <>
                      <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 44, lineHeight: 48, letterSpacing: -0.88, color: colors.ink, textAlign: 'center' }}>
                        {word.en}
                      </Text>
                      <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 20, lineHeight: 32, color: colors.saffron, textAlign: 'center' }}>
                        {word.pronunciationSi}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={overline}>WHAT IS THIS IN ENGLISH?</Text>
                      <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 28, lineHeight: 42, color: colors.primary, textAlign: 'center' }}>
                        {word.meaningSi}
                      </Text>
                    </>
                  )}

                  {revealed ? (
                    <View style={{ alignSelf: 'stretch', alignItems: 'center', gap: 12 }}>
                      <View style={{ alignSelf: 'stretch', height: 1, backgroundColor: colors.cardBorder, marginVertical: 6 }} />
                      {isEnFront ? (
                        <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 24, lineHeight: 36, color: colors.primary, textAlign: 'center' }}>
                          {word.meaningSi}
                        </Text>
                      ) : (
                        <>
                          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 34, lineHeight: 38, color: colors.ink, textAlign: 'center' }}>
                            {word.en}
                          </Text>
                          <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 18, lineHeight: 29, color: colors.saffron, textAlign: 'center' }}>
                            {word.pronunciationSi}
                          </Text>
                        </>
                      )}
                      <View style={{ alignSelf: 'stretch', backgroundColor: colors.bg, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, gap: 2 }}>
                        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.ink }}>{word.example.en}</Text>
                        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, lineHeight: 20.8, color: colors.saffron }}>{word.example.pronunciationSi}</Text>
                        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, lineHeight: 22.4, color: colors.primary }}>{word.example.meaningSi}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ marginTop: 8, fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted }}>Tap the card to check</Text>
                  )}
                </Pressable>
              )}

              {!finished ? (
                revealed ? (
                  <View style={{ flexDirection: 'row', gap: space[12] }}>
                    <View style={{ flex: 1 }}>
                      <OutlineButton label="Still learning" tone="muted" height={56} onPress={advanceVocab} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <PrimaryButton label="I know this" height={56} onPress={handleKnowThis} />
                    </View>
                  </View>
                ) : (
                  <PrimaryButton
                    label={isEnFront ? 'Show meaning · තේරුම බලන්න' : 'Show English · ඉංග්‍රීසි බලන්න'}
                    height={56}
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
