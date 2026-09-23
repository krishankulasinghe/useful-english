import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, StepDots } from '../../src/components';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

export default function OnboardingWelcome() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

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
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          accessibilityRole="button"
          accessibilityLabel="Skip"
          style={{ minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' }}
        >
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 15, color: colors.muted }}>Skip</Text>
        </Pressable>
      </View>

      <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
        <View style={{ width: 280, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 270,
              height: 250,
              marginTop: -125,
              marginLeft: -135,
              borderRadius: 28,
              backgroundColor: colors.saffronTint,
              transform: [{ rotate: '-6deg' }, { translateX: -14 }, { translateY: 6 }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 270,
              height: 250,
              marginTop: -125,
              marginLeft: -135,
              borderRadius: 28,
              backgroundColor: colors.primaryTint,
              transform: [{ rotate: '5deg' }, { translateX: 14 }, { translateY: 4 }],
            }}
          />
          <View
            style={{
              width: 280,
              borderRadius: 28,
              backgroundColor: colors.surface,
              paddingVertical: 26,
              paddingHorizontal: 24,
              gap: 14,
              shadowColor: '#16181D',
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.88, color: colors.muted }}>ENGLISH</Text>
              <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 44, color: colors.ink, lineHeight: 48 }}>Reach</Text>
            </View>
            <View>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.44, color: colors.saffronDark }}>
                උච්චාරණය
              </Text>
              <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 24, color: colors.saffron }}>රීච්</Text>
            </View>
            <View>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, letterSpacing: 0.44, color: colors.primaryDark }}>
                තේරුම
              </Text>
              <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 24, color: colors.primary }}>ළඟා වෙනවා</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 16 }}>
        <Text
          style={{
            fontFamily: fontFamily.frauncesSemiBold,
            fontSize: 32,
            fontWeight: '600',
            lineHeight: 37,
            letterSpacing: -0.32,
            color: colors.ink,
          }}
        >
          Learn English through Sinhala
        </Text>
        <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 17, color: colors.ink2 }}>
          හැම වචනයකටම සිංහල උච්චාරණය සහ තේරුම. එදිනෙදා භාවිතා වන ඉංග්‍රීසි පහසුවෙන් ඉගෙන ගන්න.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <StepDots total={3} activeIndex={0} />
        <PrimaryButton
          label="Next"
          icon="arrow-right"
          iconPosition="right"
          height={56}
          fullWidth={false}
          onPress={() => router.push('/onboarding/level')}
        />
      </View>
    </View>
  );
}
