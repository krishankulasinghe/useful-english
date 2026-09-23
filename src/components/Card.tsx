import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface CardProps {
  children: ReactNode;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

// Surface bg, 1px cardBorder, radius 20 — the base for most rows/cards.
export function Card({ children, padding, style }: CardProps) {
  const { colors, radius, space } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius[20],
          borderWidth: 1,
          borderColor: colors.cardBorder,
          padding: padding ?? space[16],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
