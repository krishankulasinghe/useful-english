import { Linking, Pressable, Share, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import {
  BackButton,
  GroupedList,
  ListRow,
  NavHeader,
  PrimaryButton,
  Screen,
  SegmentedControl,
  Switch,
} from '../../src/components';
import { Icon } from '../../src/icons/Icon';
import { useAds } from '../../src/ads/AdsProvider';
import { getGoal } from '../../src/content/goals';
import { useSettingsStore } from '../../src/state/settingsStore';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

const SUPPORT_LINKS = {
  shareMessage: 'Learn English through Sinhala with Sin-Eng!',
  rateUrl: 'https://example.com/rate',
  feedbackEmail: 'mailto:feedback@example.com?subject=Sin-Eng%20feedback',
  privacyPolicyUrl: 'https://example.com/privacy',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, space, level: levelMap, radius } = useTheme();
  const { isPrivacyOptionsRequired, showPrivacyOptions } = useAds();

  const level = useSettingsStore((s) => s.level);
  const primaryGoal = useSettingsStore((s) => s.primaryGoal);
  const subTrack = useSettingsStore((s) => s.subTrack);
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const reminderOn = useSettingsStore((s) => s.reminderOn);
  const setReminderOn = useSettingsStore((s) => s.setReminderOn);
  const textSize = useSettingsStore((s) => s.textSize);
  const setTextSize = useSettingsStore((s) => s.setTextSize);
  const showPronunciation = useSettingsStore((s) => s.showPronunciation);
  const setShowPronunciation = useSettingsStore((s) => s.setShowPronunciation);
  const showMeaning = useSettingsStore((s) => s.showMeaning);
  const setShowMeaning = useSettingsStore((s) => s.setShowMeaning);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const appLanguage = useSettingsStore((s) => s.appLanguage);
  const setAppLanguage = useSettingsStore((s) => s.setAppLanguage);

  const activeGoal = getGoal(primaryGoal);

  return (
    <Screen scroll padded={false} contentContainerStyle={{ paddingBottom: space[32] }}>
      <NavHeader title="Settings" subtitle="සැකසුම්" backLabel="Back" onBack={() => router.back()} />

      <View style={{ paddingHorizontal: space[20], gap: space[20], paddingTop: space[12] }}>
        {/* Learning Path Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius[22],
            borderWidth: 1.2,
            borderColor: colors.cardBorder,
            padding: space[16],
            gap: space[12],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="user" size={22} color={colors.white} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }}>
                My Learning Path
              </Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>
                {activeGoal.en} · {levelMap[level].labelEn}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Change Goal"
                height={40}
                onPress={() => router.push('/onboarding/goals?mode=edit')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Change Level"
                height={40}
                onPress={() => router.push('/onboarding/level?mode=edit')}
              />
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/onboarding/diagnostic?mode=edit')}
            style={{
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderTopWidth: 1,
              borderColor: colors.cardBorder,
              marginTop: 2,
            }}
          >
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.primaryDark }}>
              Retake 1-Minute Level Diagnostic Test →
            </Text>
          </Pressable>
        </View>

        {/* Learning Habit & Reminders */}
        <View style={{ gap: space[10] }}>
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.8, color: colors.muted, textTransform: 'uppercase' }}>
            Daily Habit & Reminders
          </Text>
          <GroupedList>
            <ListRow
              label="Daily Goal"
              sublabel={`${dailyGoal} sentences per day`}
              onPress={() => router.push('/onboarding/goal?mode=edit')}
            />
            <ListRow
              label="Daily Reminder"
              sublabel="7:30 PM reminder notification"
              right={<Switch value={reminderOn} onValueChange={setReminderOn} accessibilityLabel="Daily reminder toggle" />}
            />
          </GroupedList>
        </View>

        {/* Display Settings */}
        <View style={{ gap: space[10] }}>
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.8, color: colors.muted, textTransform: 'uppercase' }}>
            Display & Appearance
          </Text>
          <GroupedList>
            <ListRow
              label="Sinhala Pronunciation"
              sublabel="Show phonetic guide under sentences"
              right={<Switch value={showPronunciation} onValueChange={setShowPronunciation} accessibilityLabel="Pronunciation toggle" />}
            />
            <ListRow
              label="Sinhala Meaning"
              sublabel="Show translation by default"
              right={<Switch value={showMeaning} onValueChange={setShowMeaning} accessibilityLabel="Meaning toggle" />}
            />
            <ListRow
              label="Text Size"
              right={
                <SegmentedControl
                  value={textSize}
                  onChange={(v) => setTextSize(v as 's' | 'm' | 'l')}
                  options={[
                    { value: 's', label: 'S' },
                    { value: 'm', label: 'M' },
                    { value: 'l', label: 'L' },
                  ]}
                  accessibilityLabel="Text size selector"
                />
              }
            />
          </GroupedList>
        </View>

        {/* Support & Legal */}
        <View style={{ gap: space[10] }}>
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.8, color: colors.muted, textTransform: 'uppercase' }}>
            About & Support
          </Text>
          <GroupedList>
            <ListRow
              label="Share this App"
              sublabel="මිතුරන් සමඟ බෙදාගන්න"
              onPress={() => Share.share({ message: SUPPORT_LINKS.shareMessage })}
            />
            <ListRow
              label="Privacy Policy"
              onPress={() => Linking.openURL(SUPPORT_LINKS.privacyPolicyUrl)}
            />
            {isPrivacyOptionsRequired ? (
              <ListRow label="Ad Privacy Options" onPress={showPrivacyOptions} />
            ) : null}
            <ListRow
              label="App Version"
              right={
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.muted }}>
                  {Constants.expoConfig?.version ?? '1.0.0'}
                </Text>
              }
            />
          </GroupedList>
        </View>
      </View>
    </Screen>
  );
}
