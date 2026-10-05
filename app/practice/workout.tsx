import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, ProgressBar, SentenceFlipCard, type PracticeMode } from '../../src/components';
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
  const { colors, shadows } = useTheme();
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
  const [spokenCount, setSpokenCount] = useState(0);
  const [laterCount, setLaterCount] = useState(0);

  const currentSentence = sentences[currentIndex];
  const currentCategory = useCategory(currentSentence?.categoryId);

  const total = sentences.length;
  const progressRatio = total > 0 ? (currentIndex + 1) / total : 0;

  const handleNext = (mastered: boolean) => {
    if (currentSentence && mastered) {
      recordSentenceMastered(currentSentence.id);
      progressRepo?.recordActivity(today);
      setSpokenCount((n) => n + 1);
    } else if (currentSentence) {
      setLaterCount((n) => n + 1);
    }

    if (currentIndex < sentences.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSpokenCount(0);
    setLaterCount(0);
    setCompleted(false);
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
    const stats = [
      { value: spokenCount, label: 'Spoken', color: colors.success },
      { value: laterCount, label: 'Review later', color: colors.saffron },
      { value: totalMastered, label: 'Total spoken', color: colors.primary },
    ];
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          paddingHorizontal: 20,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 28,
          gap: 16,
        }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.successTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={40} color={colors.success} strokeWidth={2.25} />
          </View>
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 32, lineHeight: 36, letterSpacing: -0.64, color: colors.ink, textAlign: 'center' }}>
            Workout done
          </Text>
          <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 18, lineHeight: 29, color: colors.primary, textAlign: 'center' }}>
            වාක්‍ය {sentences.length} පුහුණුව සම්පූර්ණයි!
          </Text>
          <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, lineHeight: 22, color: colors.ink2, textAlign: 'center', maxWidth: 280 }}>
            You practised {sentences.length} spoken sentences for {workoutTitle}.
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 8 }}>
            {stats.map((st) => (
              <View key={st.label} style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: 20, padding: 14, gap: 2 }, shadows.e1]}>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 26, color: st.color }}>{st.value}</Text>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 12, color: colors.muted }}>{st.label}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, lineHeight: 22.4, color: colors.muted, textAlign: 'center' }}>
            දිනපතා පුරුදු වීමෙන් ඉංග්‍රීසි කතා කිරීම පහසු වේ!
          </Text>
        </ScrollView>

        <PrimaryButton label="Back to home · මුල් පිටුවට" height={56} onPress={() => router.replace('/(tabs)/home')} />
        <Pressable onPress={handleRestart} accessibilityRole="button" style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.primary }}>Practise again</Text>
        </Pressable>
      </View>
    );
  }

  const modes: { id: PracticeMode; en: string; si: string }[] = [
    { id: 'standard', en: 'Standard', si: 'සාමාන්‍ය' },
    { id: 'recall', en: 'Recall', si: 'සිංහල → EN' },
    { id: 'comprehend', en: 'Comprehend', si: 'EN → සිංහල' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 24,
          gap: 16,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={[
              { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
              shadows.e1,
            ]}
          >
            <Icon name="x" size={20} color={colors.ink} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.ink }}>
              {total > 0 ? `Sentence ${currentIndex + 1} of ${total}` : 'Practice workout'}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>
              {workoutTitle}
            </Text>
          </View>
          <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ height: 44, paddingHorizontal: 8, justifyContent: 'center' }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.muted }}>End</Text>
          </Pressable>
        </View>

        <ProgressBar progress={progressRatio} height={8} trackColor={colors.line} />

        {/* Reveal mode */}
        <View style={{ flexDirection: 'row', gap: 6, padding: 4, borderRadius: 18, backgroundColor: colors.neutralFill }}>
          {modes.map((m) => {
            const on = practiceMode === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setPracticeMode(m.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[
                  {
                    flex: 1,
                    minWidth: 0,
                    height: 48,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? colors.surface : 'transparent',
                  },
                  on ? shadows.e1 : null,
                ]}
              >
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: on ? colors.ink : colors.muted }}>{m.en}</Text>
                <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 11, lineHeight: 16, color: colors.muted }}>{m.si}</Text>
              </Pressable>
            );
          })}
        </View>

        {currentSentence ? (
          <SentenceFlipCard sentence={currentSentence} categoryName={currentCategory?.en} initialMode={practiceMode} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 48 }}>
            {isLoadingCustom ? (
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.muted }}>Loading practice sentences...</Text>
            ) : (
              <>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 20, color: colors.ink }}>No sentences found</Text>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
                  {isSavedMode
                    ? 'You have not saved any sentences yet. Save sentences to practice them here!'
                    : "We couldn't find sentences for this track."}
                </Text>
                <PrimaryButton label="Go back" height={46} fullWidth={false} onPress={() => router.back()} />
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      {currentSentence ? (
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.line,
            gap: 6,
          }}
        >
          <PrimaryButton
            label={currentIndex === total - 1 ? 'Finish workout · අවසන් කරන්න' : 'Next sentence'}
            icon="arrow-right"
            height={56}
            onPress={() => handleNext(true)}
          />
          <Pressable onPress={() => handleNext(false)} accessibilityRole="button" style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.muted }}>
              Review this again later · <Text style={{ fontFamily: fontFamily.notoSinhala600 }}>ආයෙත් බලන්න</Text>
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
