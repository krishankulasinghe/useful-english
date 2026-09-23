import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, PrimaryButton, RadioCard, StepDots, Switch } from '../../src/components';
import { Icon } from '../../src/icons/Icon';
import { useSettingsStore } from '../../src/state/settingsStore';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

const GOALS = [
  { n: 5, en: 'Casual · 5 words a day', si: 'සැහැල්ලුවෙන් · දිනකට වචන 5ක්' },
  { n: 10, en: 'Regular · 10 words a day', si: 'නිතිපතා · දිනකට වචන 10ක්' },
  { n: 20, en: 'Serious · 20 words a day', si: 'උනන්දුවෙන් · දිනකට වචන 20ක්' },
];

export default function OnboardingGoal() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEdit = mode === 'edit';
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal);
  const reminderOn = useSettingsStore((s) => s.reminderOn);
  const setReminderOn = useSettingsStore((s) => s.setReminderOn);
  const setOnboarded = useSettingsStore((s) => s.setOnboarded);

  const onFinish = () => {
    if (isEdit) {
      router.back();
    } else {
      setOnboarded(true);
      router.replace('/(tabs)/home');
    }
  };

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
        {isEdit ? <View style={{ width: 44, height: 44 }} /> : <StepDots total={3} activeIndex={2} />}
        <View style={{ width: 44, height: 44 }} />
      </View>

      <View style={{ gap: 6, marginTop: 28 }}>
        <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 30, lineHeight: 35, color: colors.ink }}>
          Set a daily goal
        </Text>
        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 17, color: colors.ink2 }}>
          දිනකට වචන කීයක් ඉගෙන ගන්නද?
        </Text>
      </View>

      <View accessibilityRole="radiogroup" style={{ gap: 12, marginTop: 24 }}>
        {GOALS.map((g) => (
          <RadioCard
            key={g.n}
            variant="tile"
            selected={dailyGoal === g.n}
            onPress={() => setDailyGoal(g.n)}
            label={g.en}
            description={g.si}
            tileValue={g.n}
          />
        ))}
      </View>

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          borderRadius: 20,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.saffronTint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="bell" size={20} color={colors.saffron} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 16, color: colors.ink }}>Daily reminder</Text>
          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.ink2 }}>
            හැමදාම 7:30 PM ට මතක් කරන්න
          </Text>
        </View>
        <Switch value={reminderOn} onValueChange={setReminderOn} accessibilityLabel="Daily reminder" />
      </View>

      <View style={{ marginTop: 'auto' }}>
        <PrimaryButton label={isEdit ? 'Save' : 'Start learning · පටන් ගමු'} onPress={onFinish} height={56} />
      </View>
    </View>
  );
}
