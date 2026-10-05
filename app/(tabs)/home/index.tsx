import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSpeech } from '../../../src/audio/useSpeech';
import { Screen } from '../../../src/components';
import { getGoal } from '../../../src/content/goals';
import { useDailySentences } from '../../../src/content/hooks';
import { Icon } from '../../../src/icons/Icon';
import { useProgressRepo, useStreak } from '../../../src/state/hooks';
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

const RING_SIZE = 56;
const RING_STROKE = 5;
const RING_R = (RING_SIZE - RING_STROKE) / 2 - 0.5; // 23 in the 56px design
const RING_C = 2 * Math.PI * RING_R;

function ProgressRing({ done, total }: { done: number; total: number }) {
  const { colors } = useTheme();
  const ratio = total > 0 ? Math.min(done / total, 1) : 0;
  return (
    <View style={{ width: RING_SIZE, height: RING_SIZE }}>
      <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} fill="none" stroke={colors.primaryOnHero} strokeWidth={RING_STROKE} />
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          fill="none"
          stroke={colors.white}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={RING_C * (1 - ratio)}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.white }}>
          {done}/{total}
        </Text>
      </View>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, space, shadows } = useTheme();

  const level = useSettingsStore((s) => s.level);
  const primaryGoal = useSettingsStore((s) => s.primaryGoal);
  const subTrack = useSettingsStore((s) => s.subTrack);
  const dailyGoalCount = useSettingsStore((s) => s.dailyGoal);
  const dailyCompletedSentenceIds = useSettingsStore((s) => s.dailyCompletedSentenceIds);
  const lastCompletedDate = useSettingsStore((s) => s.lastCompletedDate);

  const streak = useStreak();
  const progressRepo = useProgressRepo();

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
  const leftCount = Math.max(targetCount - completedTodayCount, 0);
  const allDone = targetCount > 0 && completedTodayCount >= targetCount;

  // Next uncompleted sentence for preview
  const previewSentence = useMemo(() => {
    if (!dailySentences || dailySentences.length === 0) return undefined;
    if (!isTodayCompleted) return dailySentences[0];
    const uncompleted = dailySentences.find((s) => !dailyCompletedSentenceIds.includes(s.id));
    return uncompleted ?? dailySentences[0];
  }, [dailySentences, dailyCompletedSentenceIds, isTodayCompleted]);

  const { isSpeaking: isPreviewSpeaking, speak: speakPreview } = useSpeech(previewSentence?.en);

  const overline = { fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.88, color: colors.muted } as const;

  return (
    <Screen scroll contentContainerStyle={{ paddingTop: insets.top + space[24], paddingBottom: space[24], gap: space[24] }}>
      {/* Greeting + streak + profile */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, lineHeight: 22, color: colors.muted }}>{greeting()}</Text>
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 26, lineHeight: 30, letterSpacing: -0.26, color: colors.ink }}>Hi</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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

          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Profile and settings"
            style={[
              {
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadows.e1,
            ]}
          >
            <Icon name="user" size={20} color={colors.ink} strokeWidth={1.75} />
          </Pressable>
        </View>
      </View>

      {/* Hero: today's practice */}
      <View
        style={[
          { backgroundColor: colors.primary, borderRadius: 28, padding: 20, gap: 18 },
          shadows.indigo,
        ]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.88, color: colors.onPrimarySoft }}>
              TODAY'S PRACTICE · අද පුහුණුව
            </Text>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 22, lineHeight: 26, color: colors.white }}>{activeGoal.en}</Text>
          </View>
          <ProgressRing done={Math.min(completedTodayCount, targetCount)} total={targetCount} />
        </View>

        {!allDone ? (
          <>
            {previewSentence ? (
              <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={overline}>NEXT · මීළඟ</Text>
                  <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 18, lineHeight: 24, color: colors.ink }}>{previewSentence.en}</Text>
                  <Text style={{ fontFamily: fontFamily.notoSinhala500, fontSize: 14, lineHeight: 22.4, color: colors.saffron }}>
                    {previewSentence.pronunciationSi}
                  </Text>
                  <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 15, lineHeight: 24, color: colors.primary }}>
                    {previewSentence.meaningSi}
                  </Text>
                </View>
                <Pressable
                  onPress={() => speakPreview()}
                  accessibilityRole="button"
                  accessibilityLabel={isPreviewSpeaking ? 'Playing' : 'Listen'}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: isPreviewSpeaking ? colors.primary : colors.primaryTint,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="volume-2" size={20} color={isPreviewSpeaking ? colors.white : colors.primary} />
                </Pressable>
              </View>
            ) : null}

            <Pressable
              onPress={() => router.push('/practice/workout')}
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
                {completedTodayCount > 0 ? `Continue · ${leftCount} left` : `Start · ${targetCount} sentences`}
              </Text>
              <Icon name="arrow-right" size={20} color={colors.primaryDark} strokeWidth={2} />
            </Pressable>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={24} color={colors.success} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 18, color: colors.white }}>
                  Done for today · <Text style={{ fontFamily: fontFamily.notoSinhala600 }}>නියමයි!</Text>
                </Text>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.onPrimarySoft }}>
                  Streak is now {streak} {streak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/practice/workout')}
              accessibilityRole="button"
              style={{
                height: 52,
                borderRadius: 26,
                borderWidth: 1.5,
                borderColor: '#8F8BE6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.white }}>Practise again</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Explore shortcuts */}
      <View style={{ gap: 12 }}>
        <Text style={overline}>KEEP GOING · දිගටම</Text>
        <View style={[{ backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden' }, shadows.e1]}>
          {[
            {
              key: 'sentences',
              icon: 'message-circle' as const,
              tint: colors.saffronTint,
              fg: colors.saffron,
              en: 'All sentences',
              si: 'ප්‍රයෝජනවත් වාක්‍ය 5,600+',
              onPress: () => router.push('/(tabs)/sentences'),
            },
            {
              key: 'practice',
              icon: 'cards' as const,
              tint: colors.primaryTint,
              fg: colors.primary,
              en: 'Card practice',
              si: 'ෆ්ලෑෂ් කාඩ් පුහුණුව',
              onPress: () => router.push('/(tabs)/practice'),
            },
          ].map((row, i, arr) => (
            <Pressable
              key={row.key}
              onPress={row.onPress}
              accessibilityRole="button"
              accessibilityLabel={row.en}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: colors.cardBorder,
                backgroundColor: pressed ? '#FAFAF8' : colors.surface,
              })}
            >
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: row.tint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={row.icon} size={22} color={row.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.ink }}>{row.en}</Text>
                <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, lineHeight: 20.8, color: colors.muted }}>{row.si}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
