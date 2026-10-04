import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, PrimaryButton } from '../../src/components';
import { Icon } from '../../src/icons/Icon';
import type { Level } from '../../src/content/types';
import { useSettingsStore } from '../../src/state/settingsStore';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

interface Question {
  id: number;
  levelTarget: Level;
  scenarioEn: string;
  scenarioSi: string;
  options: { text: string; isCorrect: boolean }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    levelTarget: 'beginner',
    scenarioEn: 'Someone greets you: "How are you doing today?"',
    scenarioSi: 'කෙනෙක් "How are you doing today?" කියා ඇසුවොත් වඩාත්ම ස්වාභාවික පිළිතුර:',
    options: [
      { text: "I'm doing well, thank you!", isCorrect: true },
      { text: 'I am do good today yes.', isCorrect: false },
    ],
  },
  {
    id: 2,
    levelTarget: 'beginner',
    scenarioEn: 'You didn\'t hear someone clearly. How do you ask them politely to repeat?',
    scenarioSi: 'යමෙක් කියූ දෙයක් පැහැදිලි නැති විට කාරුණිකව නැවත අසන්නේ කෙසේද?',
    options: [
      { text: 'Say that again loudly.', isCorrect: false },
      { text: 'Could you please repeat that?', isCorrect: true },
    ],
  },
  {
    id: 3,
    levelTarget: 'intermediate',
    scenarioEn: 'In a workplace meeting, you want to disagree politely:',
    scenarioSi: 'රැස්වීමකදී හෝ සාකච්ඡාවකදී විනීතව අදහසකට විරුද්ධ වන්නේ කෙසේද?',
    options: [
      { text: 'I see your point, but we could also consider another option.', isCorrect: true },
      { text: 'You are completely wrong on that.', isCorrect: false },
    ],
  },
  {
    id: 4,
    levelTarget: 'advanced',
    scenarioEn: 'A colleague tells you: "Let\'s touch base tomorrow morning."',
    scenarioSi: '"Let\'s touch base tomorrow morning" යන්නෙහි සැබෑ අර්ථය කුමක්ද?',
    options: [
      { text: 'Let\'s have a quick discussion tomorrow morning.', isCorrect: true },
      { text: 'Let\'s meet at the company building base tomorrow.', isCorrect: false },
    ],
  },
];

export default function OnboardingDiagnostic() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isEdit = params.mode === 'edit';
  const { colors, space, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const setDiagnosticResult = useSettingsStore((s) => s.setDiagnosticResult);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQ = QUESTIONS[currentIndex];

  const handleSelect = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    const isCorrect = currentQ.options[optionIdx].isCorrect;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        // Calculate result level
        let finalLevel: Level = 'beginner';
        if (newScore >= 4) finalLevel = 'advanced';
        else if (newScore >= 2) finalLevel = 'intermediate';
        else finalLevel = 'beginner';

        setDiagnosticResult(newScore, finalLevel);
        setShowResult(true);
      }
    }, 700);
  };

  const getResultInfo = () => {
    if (score >= 4) {
      return {
        level: 'advanced' as Level,
        title: '⭐ Advanced & Professional',
        titleSi: 'උසස් / වෘත්තීය මට්ටම',
        desc: 'Impressive! You have great comprehension. Your daily plan will focus on corporate diplomacy, meeting confidence, and refined expression.',
        badgeColor: colors.ink,
      };
    }
    if (score >= 2) {
      return {
        level: 'intermediate' as Level,
        title: '🚀 Intermediate Fluency',
        titleSi: 'මධ්‍යම කථන මට්ටම',
        desc: 'Great job! You know the foundations. Your daily plan will eliminate hesitations and help you speak smoothly without mental translation.',
        badgeColor: colors.saffronDark,
      };
    }
    return {
      level: 'beginner' as Level,
      title: '🌱 Starter / Everyday Explorer',
      titleSi: 'ආරම්භක මට්ටම',
      desc: 'A wonderful place to begin! Your daily plan will give you high-frequency everyday sentences that you can speak immediately.',
      badgeColor: colors.primary,
    };
  };

  if (showResult) {
    const res = getResultInfo();
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          paddingHorizontal: 24,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primaryTint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="sparkles" size={38} color={colors.primary} />
          </View>

          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, letterSpacing: 1.2, color: colors.muted, textTransform: 'uppercase' }}>
              Assessment Result
            </Text>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 30, color: colors.ink, textAlign: 'center' }}>
              {res.title}
            </Text>
            <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 18, color: colors.primary, textAlign: 'center' }}>
              {res.titleSi}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              gap: 12,
              width: '100%',
            }}
          >
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, lineHeight: 22, color: colors.ink }}>
              {res.desc}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Icon name="check" size={18} color={colors.primary} strokeWidth={2.5} />
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.primary }}>
                {score} of 4 situational questions correct
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted, textAlign: 'center' }}>
            You can always change your level anytime in Settings.
          </Text>
        </ScrollView>

        <PrimaryButton
          label={isEdit ? 'Done · සුරකින්න' : 'Choose Your Goal · ඉදිරියට'}
          height={56}
          onPress={() => {
            if (isEdit) {
              router.back();
            } else {
              router.push('/onboarding/goals');
            }
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: 24,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={{
                width: 24,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === currentIndex ? colors.primary : i < currentIndex ? colors.primaryTint2 : colors.line,
              }}
            />
          ))}
        </View>
        <Pressable
          onPress={() => (isEdit ? router.back() : router.push('/onboarding/level'))}
          style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }}
        >
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.muted }}>Skip</Text>
        </Pressable>
      </View>

      <View style={{ gap: 8, marginTop: 24 }}>
        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.primary, letterSpacing: 1, textTransform: 'uppercase' }}>
          Question {currentIndex + 1} of {QUESTIONS.length}
        </Text>
        <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 24, lineHeight: 30, color: colors.ink }}>
          {currentQ.scenarioEn}
        </Text>
        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 15, lineHeight: 22, color: colors.ink2 }}>
          {currentQ.scenarioSi}
        </Text>
      </View>

      <View style={{ gap: 14, marginTop: 32 }}>
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          let bgColor = colors.surface;
          let borderColor = colors.cardBorder;
          let textColor = colors.ink;

          if (isSelected) {
            if (opt.isCorrect) {
              bgColor = colors.primaryTint;
              borderColor = colors.primary;
              textColor = colors.primaryDark;
            } else {
              bgColor = colors.saffronTint;
              borderColor = colors.saffron;
              textColor = colors.saffronDark;
            }
          }

          return (
            <Pressable
              key={idx}
              onPress={() => handleSelect(idx)}
              accessibilityRole="button"
              style={{
                backgroundColor: bgColor,
                borderWidth: 1.5,
                borderColor,
                borderRadius: 18,
                paddingVertical: 18,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: isSelected ? borderColor : colors.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? borderColor : 'transparent',
                }}
              >
                {isSelected ? (
                  <Icon name="check" size={16} color={colors.white} strokeWidth={2.5} />
                ) : (
                  <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.muted }}>
                    {idx === 0 ? 'A' : 'B'}
                  </Text>
                )}
              </View>
              <Text style={{ flex: 1, fontFamily: fontFamily.jakarta600, fontSize: 16, lineHeight: 22, color: textColor }}>
                {opt.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 'auto' }}>
        <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted, textAlign: 'center' }}>
          Takes under 1 minute · zero grammar pressure
        </Text>
      </View>
    </View>
  );
}
