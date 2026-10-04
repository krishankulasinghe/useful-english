import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface TopicRowProps {
  en: string;
  si: string;
  preview: string;
  icon: IconName;
  variant: 'teal' | 'saffron';
  countText?: string;
  onPress?: () => void;
}

export function TopicRow({ en, si, preview, icon, variant, countText, onPress }: TopicRowProps) {
  const { colors, space, radius, shadows } = useTheme();
  const isTeal = variant === 'teal';
  const tileBg = isTeal ? colors.primaryTint : colors.saffronTint;
  const tileFg = isTeal ? colors.primaryDark : colors.saffronDark;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${en}, ${si}`}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius[22],
        borderWidth: 1.2,
        borderColor: colors.cardBorder,
        padding: space[16],
        gap: space[12],
        ...shadows.hero,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[12], flex: 1, minWidth: 0 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: radius[16],
              backgroundColor: tileBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={26} color={tileFg} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 18, color: colors.ink }} numberOfLines={1}>
              {en}
            </Text>
            <Text
              style={{
                fontFamily: fontForText(si, fontFamily.jakarta600, fontFamily.notoSinhala600),
                fontSize: 13.5,
                color: isTeal ? colors.primary : colors.saffron,
                marginTop: 1,
              }}
              numberOfLines={1}
            >
              {si}
            </Text>
          </View>
        </View>

        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: colors.neutralFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="arrow-right" size={16} color={colors.ink} strokeWidth={2} />
        </View>
      </View>

      {/* Subcategory Pills Preview */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.bg,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: radius[14],
        }}
      >
        <Text
          style={{
            flex: 1,
            fontFamily: fontForText(preview, fontFamily.jakarta400, fontFamily.notoSinhala400),
            fontSize: 12,
            color: colors.muted,
          }}
          numberOfLines={1}
        >
          {preview}
        </Text>
        {countText ? (
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, color: isTeal ? colors.primary : colors.saffronDark, marginLeft: 8 }}>
            {countText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
