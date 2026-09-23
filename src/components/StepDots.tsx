import { View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface StepDotsProps {
  total: number;
  activeIndex: number; // 0-based
}

// 8px dots; the active dot widens to 24px in `primary`, others stay 8px `dashed`.
export function StepDots({ total, activeIndex }: StepDotsProps) {
  const { colors } = useTheme();
  return (
    <View accessibilityLabel={`Step ${activeIndex + 1} of ${total}`} style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === activeIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === activeIndex ? colors.primary : colors.dashed,
          }}
        />
      ))}
    </View>
  );
}
