import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, PrimaryButton, StepDots } from '../../src/components';
import { GOALS, type GoalId } from '../../src/content/goals';
import { Icon } from '../../src/icons/Icon';
import { useSettingsStore } from '../../src/state/settingsStore';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

export default function OnboardingGoals() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEdit = mode === 'edit';
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();

  const primaryGoal = useSettingsStore((s) => s.primaryGoal);
  const subTrack = useSettingsStore((s) => s.subTrack);
  const setPrimaryGoal = useSettingsStore((s) => s.setPrimaryGoal);

  const [selectedGoal, setSelectedGoal] = useState<GoalId>(primaryGoal || 'workplace');
  const [selectedSubTrack, setSelectedSubTrack] = useState<string | undefined>(subTrack);

  const activeGoal = GOALS.find((g) => g.id === selectedGoal) ?? GOALS[0];

  const handleSelectGoal = (id: GoalId) => {
    setSelectedGoal(id);
    setSelectedSubTrack(undefined); // reset sub-track when switching main goal
  };

  const onContinue = () => {
    setPrimaryGoal(selectedGoal, selectedSubTrack);
    if (isEdit) {
      router.back();
    } else {
      router.push('/onboarding/goal');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 20,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 }}>
        <BackButton onPress={() => router.back()} />
        {isEdit ? <View style={{ width: 44, height: 44 }} /> : <StepDots total={4} activeIndex={2} />}
        {isEdit ? (
          <View style={{ width: 44, height: 44 }} />
        ) : (
          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.muted }}>Skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }}>
        <View style={{ gap: 6, marginTop: 20 }}>
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, lineHeight: 34, color: colors.ink }}>
            What is your main goal?
          </Text>
          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 16, color: colors.ink2 }}>
            ඔබේ ප්‍රධාන අවශ්‍යතාවය තෝරන්න
          </Text>
        </View>

        {/* 5 Core Goals List */}
        <View style={{ gap: 12, marginTop: 8 }}>
          {GOALS.map((g) => {
            const isSelected = selectedGoal === g.id;
            return (
              <Pressable
                key={g.id}
                onPress={() => handleSelectGoal(g.id)}
                accessibilityRole="button"
                style={{
                  backgroundColor: isSelected ? colors.primaryTint : colors.surface,
                  borderWidth: 1.5,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                  borderRadius: 20,
                  padding: 16,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: isSelected ? colors.primary : colors.neutralFill,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={g.icon} size={20} color={isSelected ? colors.white : colors.ink} />
                    </View>
                    <View>
                      <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }}>
                        {g.en}
                      </Text>
                      <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 13, color: colors.primaryDark }}>
                        {g.si}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.line,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected ? (
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />
                    ) : null}
                  </View>
                </View>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.ink2, marginTop: 2 }}>
                  {g.descEn} · {g.descSi}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Sub-Tracks for Active Goal */}
        {activeGoal.subTracks.length > 0 ? (
          <View style={{ marginTop: 12, gap: 10 }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.ink, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Choose your focus area (Optional)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Pressable
                onPress={() => setSelectedSubTrack(undefined)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: selectedSubTrack === undefined ? colors.primary : colors.cardBorder,
                  backgroundColor: selectedSubTrack === undefined ? colors.primaryDark : colors.surface,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.jakarta600,
                    fontSize: 13,
                    color: selectedSubTrack === undefined ? colors.white : colors.ink,
                  }}
                >
                  All Topics
                </Text>
              </Pressable>

              {activeGoal.subTracks.map((sub) => {
                const isSubSelected = selectedSubTrack === sub.id;
                return (
                  <Pressable
                    key={sub.id}
                    onPress={() => setSelectedSubTrack(sub.id)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isSubSelected ? colors.primary : colors.cardBorder,
                      backgroundColor: isSubSelected ? colors.primaryDark : colors.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.jakarta600,
                        fontSize: 13,
                        color: isSubSelected ? colors.white : colors.ink,
                      }}
                    >
                      {sub.en}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ paddingHorizontal: 24, marginTop: 'auto' }}>
        <PrimaryButton label={isEdit ? 'Save Changes' : 'Continue · ඉදිරියට'} onPress={onContinue} height={56} />
      </View>
    </View>
  );
}
