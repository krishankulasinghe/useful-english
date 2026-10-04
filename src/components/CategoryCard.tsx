import { Pressable, Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';
import { Icon } from '../icons/Icon';

interface CategoryCardProps {
  letter: string; // first char of `en`
  en: string;
  si: string;
  variant: 'teal' | 'saffron';
  countText?: string;
  onPress?: () => void;
}

export function CategoryCard({ letter, en, si, variant, countText, onPress }: CategoryCardProps) {
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
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius[22],
        borderWidth: 1.2,
        borderColor: colors.cardBorder,
        padding: space[16],
        minHeight: 135,
        justifyContent: 'space-between',
        ...shadows.hero,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius[14],
            backgroundColor: tileBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 20, color: tileFg }}>
            {letter}
          </Text>
        </View>

        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevron-right" size={16} color={colors.muted} />
        </View>
      </View>

      <View style={{ gap: 3 }}>
        <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 16, color: colors.ink }} numberOfLines={1}>
          {en}
        </Text>
        <Text
          style={{
            fontFamily: fontForText(si, fontFamily.jakarta600, fontFamily.notoSinhala600),
            fontSize: 13,
            color: isTeal ? colors.primary : colors.saffron,
          }}
          numberOfLines={1}
        >
          {si}
        </Text>
        {countText ? (
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11, color: colors.muted2, marginTop: 2 }}>
            {countText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
