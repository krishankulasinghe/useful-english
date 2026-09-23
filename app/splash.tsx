import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useContentContext } from '../src/content/ContentProvider';
import { useSettingsStore } from '../src/state/settingsStore';
import { fontFamily } from '../src/theme/typography';
import { useTheme } from '../src/theme/useTheme';

const MIN_DISPLAY_MS = 1200;

export default function Splash() {
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const { ready } = useContentContext();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const goNext = () => {
    if (navigated.current || !ready) return;
    navigated.current = true;
    router.replace(onboarded ? '/(tabs)/home' : '/onboarding/welcome');
  };

  useEffect(() => {
    if (ready && minTimeElapsed) goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, minTimeElapsed]);

  return (
    <Pressable
      onPress={goNext}
      accessibilityRole="button"
      accessibilityLabel="Continue to welcome"
      style={{
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingBottom: 56,
      }}
    >
      <View style={{ height: 120 }} />
      <View style={{ alignItems: 'center', gap: 22 }}>
        <View
          style={[
            {
              width: 108,
              height: 108,
              borderRadius: 32,
              backgroundColor: '#F7F4EE',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 2,
            },
            shadows.splashMark,
          ]}
        >
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 50, color: colors.primary, lineHeight: 50 }}>A</Text>
          <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 42, color: colors.splashMarkSi, lineHeight: 50 }}>අ</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 40, color: colors.white, letterSpacing: -0.4, lineHeight: 44 }}>
            Sin-Eng
          </Text>
          <Text style={{ fontFamily: fontFamily.jakarta500, fontSize: 17, color: colors.splashText }}>English, the easy way</Text>
          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 17, color: colors.splashText }}>ඉංග්‍රීසි, පහසුවෙන්</Text>
        </View>
      </View>
      <View style={{ alignItems: 'center', gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' }} />
        </View>
        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.splashText }}>සිංහල කතා කරන අයට</Text>
      </View>
    </Pressable>
  );
}
