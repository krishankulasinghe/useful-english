import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, PrimaryButton, RadioCard, StepDots } from '../../src/components';
import { useSettingsStore } from '../../src/state/settingsStore';
import type { Level } from '../../src/content/types';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

const LEVELS: { id: Level; en: string; si: string; desc: string }[] = [
  { id: 'beginner', en: 'Beginner', si: 'ආරම්භක', desc: 'මම ඉංග්‍රීසි වචන කිහිපයක් දන්නවා' },
  { id: 'intermediate', en: 'Intermediate', si: 'මධ්‍යම', desc: 'මට සරල වාක්‍ය හදන්න පුළුවන්' },
  { id: 'advanced', en: 'Advanced', si: 'උසස්', desc: 'මට ස්වාභාවිකව කතා කරන්න ඕනේ' },
];

export default function OnboardingLevel() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEdit = mode === 'edit';
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const level = useSettingsStore((s) => s.level);
  const setLevel = useSettingsStore((s) => s.setLevel);

  const onContinue = () => {
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
        paddingHorizontal: 24,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton onPress={() => router.back()} />
        {isEdit ? (
          <View style={{ width: 44, height: 44 }} />
        ) : (
          <StepDots total={3} activeIndex={1} />
        )}
        {isEdit ? (
          <View style={{ width: 44, height: 44 }} />
        ) : (
          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            accessibilityRole="button"
            accessibilityLabel="Skip"
            style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.muted }}>Skip</Text>
          </Pressable>
        )}
      </View>

      <View style={{ gap: 6, marginTop: 28 }}>
        <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 30, lineHeight: 35, color: colors.ink }}>
          How is your English?
        </Text>
        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 17, color: colors.ink2 }}>
          ඔබේ ඉංග්‍රීසි දැනුම කොහොමද?
        </Text>
      </View>

      <View accessibilityRole="radiogroup" style={{ gap: 12, marginTop: 24 }}>
        {LEVELS.map((l) => (
          <RadioCard
            key={l.id}
            variant="dot"
            selected={level === l.id}
            onPress={() => setLevel(l.id)}
            label={`${l.en} · ${l.si}`}
            description={l.desc}
          />
        ))}
      </View>

      <Text style={{ marginTop: 18, fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted }}>
        Not sure? Start with Beginner. You can change this anytime in Settings.
      </Text>

      <View style={{ marginTop: 'auto' }}>
        <PrimaryButton label={isEdit ? 'Save' : 'Continue · ඉදිරියට'} onPress={onContinue} icon={undefined} height={56} />
      </View>
    </View>
  );
}
