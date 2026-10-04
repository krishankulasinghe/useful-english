import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useSpeech } from '../../../src/audio/useSpeech';
import { Card, HeroCard, IconButton, LevelChip, PrimaryButton, ProgressBar, Screen, TrioBlock } from '../../../src/components';
import { useContentContext } from '../../../src/content/ContentProvider';
import { getGoal } from '../../../src/content/goals';
import { useCategories, useCategory, useDailySentences, useTopics, useWord, useWordOfTheDay } from '../../../src/content/hooks';
import { Icon } from '../../../src/icons/Icon';
import { useProgressRepo, useSaved, useStreak } from '../../../src/state/hooks';
import { useSettingsStore } from '../../../src/state/settingsStore';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'සුබ උදෑසනක්';
  if (hour < 17) return 'සුබ දහවලක්';
  return 'සුබ සන්ධ්‍යාවක්';
}

export default function Home() {
  const router = useRouter();
  const { colors, space, radius, text } = useTheme();

  const level = useSettingsStore((s) => s.level);
  const primaryGoal = useSettingsStore((s) => s.primaryGoal);
  const subTrack = useSettingsStore((s) => s.subTrack);
  const dailyGoalCount = useSettingsStore((s) => s.dailyGoal);
  const dailyCompletedSentenceIds = useSettingsStore((s) => s.dailyCompletedSentenceIds);
  const lastCompletedDate = useSettingsStore((s) => s.lastCompletedDate);
  const totalMastered = useSettingsStore((s) => s.totalSentencesMastered);

  const streak = useStreak();
  const progressRepo = useProgressRepo();
  const { repository } = useContentContext();

  const today = useMemo(() => todayKey(), []);
  const activeGoal = useMemo(() => getGoal(primaryGoal), [primaryGoal]);

  // Today's 10 sentences
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

  // Next uncompleted sentence for preview
  const previewSentence = useMemo(() => {
    if (!dailySentences || dailySentences.length === 0) return undefined;
    if (!isTodayCompleted) return dailySentences[0];
    const uncompleted = dailySentences.find((s) => !dailyCompletedSentenceIds.includes(s.id));
    return uncompleted ?? dailySentences[0];
  }, [dailySentences, dailyCompletedSentenceIds, isTodayCompleted]);

  // Preview sentence speech
  const { isSpeaking: isPreviewSpeaking, speak: speakPreview } = useSpeech(previewSentence?.en);

  // Bonus Word of the Day
  const word = useWordOfTheDay(today, level);
  const saved = useSaved('word', word?.id);
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);
  useEffect(() => setSavedOverride(undefined), [word?.id]);
  const isSaved = savedOverride ?? saved;

  const handleToggleSave = useCallback(async () => {
    if (!progressRepo || !word) return;
    const next = await progressRepo.toggleSaved('word', word.id);
    setSavedOverride(next);
  }, [progressRepo, word]);

  const handleOpenWord = useCallback(() => {
    if (!word) return;
    progressRepo?.recordActivity(todayKey());
    router.push({ pathname: '/word/[wordId]', params: { wordId: word.id } });
  }, [router, word, progressRepo]);

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[16] }}>
      {/* Greeting and Header Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[12] }}>
        <View>
          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.muted }}>{greeting()}</Text>
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, lineHeight: 32, letterSpacing: -0.28, color: colors.ink }}>
            Hi
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[10] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              height: 36,
              paddingHorizontal: 12,
              borderRadius: 18,
              backgroundColor: colors.saffronTint,
            }}
          >
            <Icon name="flame" size={18} color={colors.saffron} strokeWidth={2} />
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.saffron }}>
              {streak} days
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Profile and settings"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="user" size={20} color={colors.white} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      {/* Hero Card: Today's Spoken English Workout */}
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
            <Icon name={activeGoal.icon} size={15} color={colors.primaryDark} />
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, color: colors.primaryDark }}>
              {activeGoal.en}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/onboarding/goals?mode=edit')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.muted }}>
              Change Goal
            </Text>
            <Icon name="chevron-right" size={14} color={colors.muted} />
          </Pressable>
        </View>

        {/* Workout Progress Bar */}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 16, color: colors.ink }}>
              Today's Sentence Workout
            </Text>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.primary }}>
              {completedTodayCount} / {targetCount} Spoken
            </Text>
          </View>
          <ProgressBar progress={progressRatio} />
        </View>

        {/* Featured Preview Sentence */}
        {previewSentence ? (
          <View
            style={{
              backgroundColor: colors.bg,
              borderRadius: radius[18],
              padding: 16,
              gap: 10,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11, letterSpacing: 0.8, color: colors.primary, textTransform: 'uppercase' }}>
                  Next Sentence · මීළඟ වාක්‍යය
                </Text>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 20, lineHeight: 26, color: colors.ink, marginTop: 4 }}>
                  {previewSentence.en}
                </Text>
              </View>

              <IconButton
                name="volume-2"
                size={40}
                variant="ghost"
                accessibilityLabel="Listen to preview sentence"
                color={isPreviewSpeaking ? colors.saffron : colors.primary}
                onPress={() => speakPreview()}
              />
            </View>

            <View style={{ gap: 2 }}>
              <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 14, color: colors.saffronDark }}>
                {previewSentence.pronunciationSi}
              </Text>
              <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.ink2 }}>
                {previewSentence.meaningSi}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Start Workout Button */}
        <PrimaryButton
          label={
            completedTodayCount >= targetCount
              ? 'Workout Done! Review Sentences · නැවත බලන්න'
              : completedTodayCount > 0
              ? `Continue Workout (${targetCount - completedTodayCount} left) · ඉදිරියට`
              : `Start Workout (${targetCount} Sentences) · පටන් ගන්න`
          }
          height={52}
          onPress={() => router.push('/practice/workout')}
        />
      </HeroCard>

      {/* Quick Stats Grid */}
      <View style={{ flexDirection: 'row', gap: space[10] }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="message-circle" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 18, color: colors.ink }}>
              {totalMastered}
            </Text>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11, color: colors.muted }}>
              Sentences Spoken
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/onboarding/level?mode=edit')}
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="compass" size={18} color={colors.saffron} />
          </View>
          <View>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 15, color: colors.ink, textTransform: 'capitalize' }}>
              {level}
            </Text>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11, color: colors.muted }}>
              Level · මට්ටම
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Explore Situations & Sentence Topics */}
      <View style={{ flexDirection: 'row', gap: space[12] }}>
        <Pressable style={{ flex: 1 }} onPress={() => router.push('/(tabs)/sentences')} accessibilityRole="button" accessibilityLabel="Sentences by Topic">
          <Card style={{ gap: space[10] }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="message" size={22} color={colors.saffron} strokeWidth={1.8} />
            </View>
            <View>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }}>All Sentences</Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>ප්‍රයෝජනවත් වාක්‍ය 5,600+</Text>
            </View>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.saffron }}>Explore categories →</Text>
          </Card>
        </Pressable>

        <Pressable style={{ flex: 1 }} onPress={() => router.push('/(tabs)/practice')} accessibilityRole="button" accessibilityLabel="Practice Modes">
          <Card style={{ gap: space[10] }}>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="cards" size={22} color={colors.primary} strokeWidth={1.8} />
            </View>
            <View>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }}>Card Practice</Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>ෆ්ලෑෂ් කාඩ් පුහුණුව</Text>
            </View>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.primary }}>Custom decks →</Text>
          </Card>
        </Pressable>
      </View>

      {/* Compact Word of the Day (Bonus) */}
      {word ? (
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[text('sectionLabel'), { color: colors.primary, textTransform: 'uppercase' }]}>Bonus Word</Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 12, color: colors.muted }}>අද දවසේ වචනය</Text>
            </View>
            <IconButton
              name="bookmark"
              accessibilityLabel={isSaved ? 'Unsave word' : 'Save word'}
              size={36}
              filled={isSaved}
              color={isSaved ? colors.primary : colors.muted}
              onPress={handleToggleSave}
            />
          </View>

          <TrioBlock variant="example" en={word.en} pron={word.pronunciationSi} meaning={word.meaningSi} />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable onPress={handleOpenWord} style={{ paddingVertical: 4 }}>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.primary }}>
                View word details →
              </Text>
            </Pressable>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
