import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface HeroCardProps {
  children: ReactNode;
  padding?: number;
  radius?: number; // 24 (Home word-of-the-day) or 20 (Detail/example cards)
  style?: StyleProp<ViewStyle>;
}

// Surface bg, hero shadow, radius 24 by default (no border — the shadow carries it).
export function HeroCard({ children, padding, radius, style }: HeroCardProps) {
  const { colors, radius: r, space, shadows } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius ?? r[24],
          padding: padding ?? space[20],
        },
        shadows.hero,
        style,
      ]}
    >
      {children}
    </View>
  );
}
