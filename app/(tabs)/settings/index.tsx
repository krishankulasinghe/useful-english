import { Linking, Share, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import {
  GroupedList,
  ListRow,
  PrimaryButton,
  Screen,
  ScreenTitle,
  SegmentedControl,
  StatusChip,
  Switch,
} from '../../../src/components';
import { Icon } from '../../../src/icons/Icon';
import { useSettingsStore } from '../../../src/state/settingsStore';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

// TODO: replace with the real store URLs and privacy policy link before release.
const SUPPORT_LINKS = {
  shareMessage: 'Learn English through Sinhala with Sin-Eng!',
  rateUrl: 'https://example.com/rate',
  feedbackEmail: 'mailto:feedback@example.com?subject=Sin-Eng%20feedback',
  privacyPolicyUrl: 'https://example.com/privacy',
};

export default function Settings() {
  const router = useRouter();
  const { colors, space, level: levelMap } = useTheme();

  const level = useSettingsStore((s) => s.level);
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

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[20] }}>
      <View style={{ marginTop: space[12] }}>
        <ScreenTitle title="Settings" subtitle="සැකසුම්" />
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: space[16],
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[14],
        }}
      >
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={24} color={colors.white} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 18, color: colors.ink }}>My learning</Text>
          <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted }}>
            {levelMap[level].labelEn} · {dailyGoal} words a day
          </Text>
        </View>
        <PrimaryButton label="Edit" height={40} fullWidth={false} onPress={() => router.push('/onboarding/level?mode=edit')} />
      </View>

      <ListRow
        label="Saved words & sentences"
        sublabel="සුරැකි වචන සහ වාක්‍ය"
        left={
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bookmark" size={22} color={colors.saffron} strokeWidth={1.8} />
          </View>
        }
        onPress={() => router.push('/(tabs)/settings/saved')}
      />

      <View style={{ gap: space[8] }}>
        <SectionHeading>LEARNING · ඉගෙනීම</SectionHeading>
        <GroupedList>
          <ListRow
            label="English level"
            value={levelMap[level].labelEn}
            onPress={() => router.push('/onboarding/level?mode=edit')}
          />
          <ListRow label="Daily goal" value={`${dailyGoal} words`} onPress={() => router.push('/onboarding/goal?mode=edit')} />
          <ListRow
            label="Daily reminder"
            sublabel="Every day at 7:30 PM"
            minHeight={64}
            right={<Switch value={reminderOn} onValueChange={setReminderOn} accessibilityLabel="Daily reminder" />}
          />
        </GroupedList>
      </View>

      <View style={{ gap: space[8] }}>
        <SectionHeading>DISPLAY · පෙනුම</SectionHeading>
        <GroupedList>
          <View style={{ paddingHorizontal: space[16], paddingVertical: 14, gap: space[10], borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>Text size · අකුරු ප්‍රමාණය</Text>
            <SegmentedControl
              accessibilityLabel="Text size"
              height={44}
              value={textSize}
              onChange={(v) => setTextSize(v as 's' | 'm' | 'l')}
              options={[
                { value: 's', label: 'A', fontSize: 14 },
                { value: 'm', label: 'A', fontSize: 18 },
                { value: 'l', label: 'A', fontSize: 23 },
              ]}
            />
          </View>
          <ListRow
            label="Show pronunciation"
            sublabel="සිංහල උච්චාරණය පෙන්වන්න"
            minHeight={64}
            right={<Switch value={showPronunciation} onValueChange={setShowPronunciation} accessibilityLabel="Show pronunciation" />}
          />
          <ListRow
            label="Show Sinhala meaning"
            sublabel="Turn off to test yourself"
            minHeight={64}
            right={<Switch value={showMeaning} onValueChange={setShowMeaning} accessibilityLabel="Show Sinhala meaning" />}
          />
          <ListRow
            label="Dark mode"
            sublabel="අඳුරු පෙනුම"
            minHeight={64}
            right={<Switch value={theme === 'dark'} onValueChange={(v) => setTheme(v ? 'dark' : 'light')} accessibilityLabel="Dark mode" />}
          />
        </GroupedList>
      </View>

      <View style={{ gap: space[8] }}>
        <SectionHeading>APP LANGUAGE · යෙදුමේ භාෂාව</SectionHeading>
        <SegmentedControl
          accessibilityLabel="App language"
          height={48}
          radius={16}
          value={appLanguage}
          onChange={(v) => setAppLanguage(v as 'en' | 'si')}
          options={[
            { value: 'en', label: 'English', fontSize: 15 },
            { value: 'si', label: 'සිංහල', fontSize: 15 },
          ]}
        />
      </View>

      <View style={{ gap: space[8] }}>
        <SectionHeading>AUDIO · ශබ්දය</SectionHeading>
        <GroupedList>
          <ListRow
            label="Auto-play pronunciation"
            sublabel="English audio for every word"
            minHeight={64}
            right={<StatusChip />}
          />
        </GroupedList>
      </View>

      <View style={{ gap: space[8] }}>
        <SectionHeading>SUPPORT · සහාය</SectionHeading>
        <GroupedList>
          <ListRow
            label="Share with friends"
            minHeight={54}
            onPress={() => Share.share({ message: SUPPORT_LINKS.shareMessage })}
          />
          <ListRow label="Rate the app" minHeight={54} onPress={() => Linking.openURL(SUPPORT_LINKS.rateUrl)} />
          <ListRow label="Send feedback" minHeight={54} onPress={() => Linking.openURL(SUPPORT_LINKS.feedbackEmail)} />
          <ListRow label="Privacy policy" minHeight={54} onPress={() => Linking.openURL(SUPPORT_LINKS.privacyPolicyUrl)} />
        </GroupedList>
      </View>

      <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted, textAlign: 'center' }}>
        Sin-Eng · Version {Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </Screen>
  );
}

function SectionHeading({ children }: { children: string }) {
  const { colors, text } = useTheme();
  return <Text style={[text('sectionLabel'), { color: colors.muted, marginHorizontal: 4 }]}>{children}</Text>;
}
