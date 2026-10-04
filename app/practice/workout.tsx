import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, PrimaryButton, ProgressBar, SentenceFlipCard, type PracticeMode } from '../../src/components';
import { useContentContext } from '../../src/content/ContentProvider';
import { getGoal, type GoalId } from '../../src/content/goals';
import { useCategory, useDailySentences, useTopic } from '../../src/content/hooks';
import type { SentenceItem } from '../../src/content/types';
import { Icon } from '../../src/icons/Icon';
import { useProgressRepo } from '../../src/state/hooks';
import { useSettingsStore } from '../../src/state/settingsStore';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function PracticeWorkout() {
  const router = useRouter();
  const { colors, space, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    mode?: 'daily' | 'situation' | 'saved' | 'category';
    goal?: GoalId;
    subTrack?: string;
    topicId?: string;
    categoryId?: string;
  }>();

  const storeGoal = useSettingsStore((s) => s.primaryGoal);
  const storeSubTrack = useSettingsStore((s) => s.subTrack);
  const level = useSettingsStore((s) => s.level);
  const dailyGoalCount = useSettingsStore((s) => s.dailyGoal);
  const recordSentenceMastered = useSettingsStore((s) => s.recordSentenceMastered);
  const totalMastered = useSettingsStore((s) => s.totalSentencesMastered);
  const { repository } = useContentContext();
  const progressRepo = useProgressRepo();

  const goalId = (params.goal as GoalId) ?? storeGoal ?? 'workplace';
  const subTrackId = params.subTrack ?? storeSubTrack;
  const activeGoal = getGoal(goalId);

  const today = useMemo(() => todayString(), []);

  // Today's daily sentences hook
  const dailySentences = useDailySentences({
    date: today,
    level,
    goalId,
    subTrackId,
    count: dailyGoalCount || 10,
  });

  // Custom sentences state for situation or saved modes
  const [customSentences, setCustomSentences] = useState<SentenceItem[] | null>(null);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);

  const isSavedMode = params.mode === 'saved';
  const isSituationMode = params.mode === 'situation' || params.mode === 'category';

  const categoryInfo = useCategory(params.categoryId);
  const topicInfo = useTopic(params.topicId);

  useEffect(() => {
    let cancelled = false;
    if (!repository) return;

    if (isSavedMode) {
      setIsLoadingCustom(true);
      (async () => {
        const saved = (await progressRepo?.listSaved()) ?? [];
        const sentenceIds = new Set(saved.filter((s) => s.itemType === 'sentence').map((s) => s.itemId));
        const all = await repository.getAllSentences();
        const filtered = all.filter((s) => sentenceIds.has(s.id));
        if (!cancelled) {
          setCustomSentences(filtered);
          setIsLoadingCustom(false);
        }
      })();
    } else if (isSituationMode) {
      setIsLoadingCustom(true);
      (async () => {
        if (params.categoryId) {
          const items = await repository.getSentences(params.categoryId);
          if (!cancelled) {
            setCustomSentences(items);
            setIsLoadingCustom(false);
          }
        } else if (params.topicId) {
          const cats = await repository.getCategories(params.topicId);
          const catIds = new Set(cats.map((c) => c.id));
          const all = await repository.getAllSentences();
          const items = all.filter((s) => catIds.has(s.categoryId));
          if (!cancelled) {
            setCustomSentences(items);
            setIsLoadingCustom(false);
          }
        }
      })();
    } else {
      setCustomSentences(null);
    }

    return () => {
      cancelled = true;
    };
  }, [repository, progressRepo, isSavedMode, isSituationMode, params.categoryId, params.topicId]);

  const sentences = isSavedMode || isSituationMode ? customSentences ?? [] : dailySentences;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('standard');

  const currentSentence = sentences[currentIndex];
  const currentCategory = useCategory(currentSentence?.categoryId);

  const total = sentences.length;
  const progressRatio = total > 0 ? (currentIndex + 1) / total : 0;

  const handleNext = (mastered: boolean) => {
    if (currentSentence && mastered) {
      recordSentenceMastered(currentSentence.id);
      progressRepo?.recordActivity(today);
    }

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCompleted(true);
    }
  };

  const workoutTitle = useMemo(() => {
    if (isSavedMode) return 'Saved Sentences';
    if (isSituationMode) return categoryInfo?.en ?? topicInfo?.en ?? 'Situation Practice';
    return activeGoal.en;
  }, [isSavedMode, isSituationMode, categoryInfo?.en, topicInfo?.en, activeGoal.en]);

  const workoutSubtitle = useMemo(() => {
    if (isSavedMode) return 'සුරැකි වාක්‍ය පුහුණුව';
    if (isSituationMode) return categoryInfo?.si ?? topicInfo?.si ?? 'සැබෑ අවස්ථා පුහුණුව';
    return 'දිනපතා පුහුණුව';
  }, [isSavedMode, isSituationMode, categoryInfo?.si, topicInfo?.si]);

  if (completed) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          paddingHorizontal: 24,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: colors.saffronTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="sparkles" size={44} color={colors.saffron} />
          </View>

          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 32, color: colors.ink, textAlign: 'center' }}>
              Awesome Work!
            </Text>
            <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 20, color: colors.primary, textAlign: 'center' }}>
              වාක්‍ය {sentences.length} පුහුණුව සම්පූර්ණයි!
            </Text>
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.ink2, textAlign: 'center', maxWidth: 300 }}>
              You practiced {sentences.length} spoken English sentences for {workoutTitle}.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginVertical: 10,
            }}
          >
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, color: colors.primary }}>
                {sentences.length}
              </Text>
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.muted }}>
                Practiced Today
              </Text>
            </View>

            <View style={{ width: 1, height: 40, backgroundColor: colors.line }} />

            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, color: colors.saffron }}>
                {totalMastered}
              </Text>
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.muted }}>
                Total Spoken
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
            දිනපතා පුරුදු වීමෙන් ඉංග්‍රීසි කතා කිරීම පහසු වේ!
          </Text>
        </ScrollView>

        <PrimaryButton
          label="Back to Home · මුල් පිටුවට"
          height={56}
          onPress={() => router.replace('/(tabs)/home')}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: 20,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 20,
      }}
    >
      {/* Top Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.ink }}>
            {total > 0 ? `Sentence ${currentIndex + 1} of ${total}` : 'Practice Workout'}
          </Text>
          <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 12, color: colors.muted }} numberOfLines={1}>
            {workoutTitle}
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }}
        >
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.muted }}>End</Text>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={{ marginTop: 12, marginBottom: 12 }}>
        <ProgressBar progress={progressRatio} />
      </View>

      {/* Mode Preset Selector */}
      <View
        style={{
          flexDirection: 'row',
          gap: 6,
          marginBottom: 12,
          justifyContent: 'center',
        }}
      >
        {(
          [
            { id: 'standard', label: 'Standard (සාමාන්‍ය)' },
            { id: 'recall', label: 'Recall (සිංහල → EN)' },
            { id: 'comprehend', label: 'Comprehend (EN → සිංහල)' },
          ] as const
        ).map((m) => {
          const isSelected = practiceMode === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setPracticeMode(m.id)}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: isSelected ? colors.primaryTint : colors.surface,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.cardBorder,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamily.jakarta700,
                  fontSize: 11,
                  color: isSelected ? colors.primaryDark : colors.muted,
                }}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Flip Card with Progressive Disclosure */}
      {currentSentence ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <SentenceFlipCard
            sentence={currentSentence}
            categoryName={currentCategory?.en}
            initialMode={practiceMode}
          />
        </ScrollView>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {isLoadingCustom ? (
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.muted }}>
              Loading practice sentences...
            </Text>
          ) : (
            <>
              <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 20, color: colors.ink }}>
                No sentences found
              </Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
                {isSavedMode
                  ? 'You have not saved any sentences yet. Save sentences to practice them here!'
                  : "We couldn't find sentences for this track."}
              </Text>
              <PrimaryButton
                label="Go Back"
                height={46}
                onPress={() => router.back()}
              />
            </>
          )}
        </View>
      )}

      {/* Bottom Action Controls */}
      {currentSentence ? (
        <View style={{ gap: 10, marginTop: 14 }}>
          <PrimaryButton
            label={currentIndex === total - 1 ? 'Finish Workout · අවසන් කරන්න' : 'Next Sentence · ඊළඟ වාක්‍යය'}
            height={54}
            onPress={() => handleNext(true)}
          />
          <Pressable
            onPress={() => handleNext(false)}
            style={{ height: 38, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13.5, color: colors.muted }}>
              Review this again later · ආයෙත් බලන්න
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
