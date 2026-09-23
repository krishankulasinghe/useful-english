import { Pressable, Text, View } from 'react-native';

import { Icon } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface RadioCardProps {
  variant?: 'dot' | 'tile';
  selected: boolean;
  onPress: () => void;
  label: string; // e.g. "Beginner · ආරම්භක" or "Casual · 5 words a day"
  description?: string; // Sinhala description line
  tileValue?: string | number; // 'tile' variant only, e.g. 5 / 10 / 20
}

// 2px border (cardBorder -> primary when selected), bg primaryTint2 when selected, radius 20.
export function RadioCard({ variant = 'dot', selected, onPress, label, description, tileValue }: RadioCardProps) {
  const { colors, space, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={{
        borderWidth: 2,
        borderColor: selected ? colors.primary : colors.cardBorder,
        backgroundColor: selected ? colors.primaryTint2 : colors.surface,
        borderRadius: radius[20],
        paddingVertical: variant === 'tile' ? space[14] : space[16],
        paddingHorizontal: space[18],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[14],
      }}
    >
      {variant === 'dot' ? (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: selected ? colors.primary : colors.dashed,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} /> : null}
        </View>
      ) : (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: radius[16],
            backgroundColor: selected ? colors.primary : colors.neutralFill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 24, color: selected ? colors.white : colors.ink }}>
            {tileValue}
          </Text>
        </View>
      )}
      <View style={{ flex: 1, gap: variant === 'dot' ? 0 : 0 }}>
        <Text style={{ fontFamily: fontForText(label, fontFamily.jakarta700, fontFamily.notoSinhala700), fontSize: 17, color: colors.ink }}>
          {label}
        </Text>
        {description ? (
          <Text style={{ fontFamily: fontForText(description, fontFamily.jakarta400, fontFamily.notoSinhala400), fontSize: 14, color: colors.ink2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      {variant === 'tile' && selected ? <Icon name="check" size={22} color={colors.primary} strokeWidth={2.4} /> : null}
    </Pressable>
  );
}
