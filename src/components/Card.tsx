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
  const { colors, radius, space, shadows } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius[20],
          padding: padding ?? space[16],
        },
        shadows.e1,
        style,
      ]}
    >
      {children}
    </View>
  );
}
