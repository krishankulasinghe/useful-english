import { Pressable, Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface CategoryCardProps {
  letter: string; // first char of `en`
  en: string;
  si: string;
  variant: 'teal' | 'saffron';
  onPress?: () => void;
}

// Letter tile 38px/radius12, card min-height 124, radius 18.
export function CategoryCard({ letter, en, si, variant, onPress }: CategoryCardProps) {
  const { colors, space, radius } = useTheme();
  const tileBg = variant === 'teal' ? colors.primaryTint : colors.saffronTint;
  const tileFg = variant === 'teal' ? colors.primary : colors.saffron;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius[18],
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: space[14],
        minHeight: 124,
        gap: space[12],
        justifyContent: 'space-between',
      }}
    >
      <View style={{ width: 38, height: 38, borderRadius: radius[12], backgroundColor: tileBg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 19, color: tileFg }}>{letter}</Text>
      </View>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 15, color: colors.ink }} numberOfLines={1}>
          {en}
        </Text>
        <Text style={{ fontFamily: fontForText(si, fontFamily.jakarta400, fontFamily.notoSinhala400), fontSize: 13, color: colors.muted }}>
          {si}
        </Text>
      </View>
    </Pressable>
  );
}
