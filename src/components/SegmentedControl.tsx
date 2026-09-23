import { Pressable, Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

export interface SegmentOption {
  value: string;
  label: string;
  fontSize?: number; // e.g. the "A" text-size options render at 14/18/23px
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  height?: 40 | 44 | 48;
  radius?: number;
  accessibilityLabel?: string;
}

// neutralFill track (radius 14, padding 4); selected segment = white bg + segment shadow + primary 700 text.
export function SegmentedControl({ options, value, onChange, height = 40, radius = 14, accessibilityLabel }: SegmentedControlProps) {
  const { colors, shadows } = useTheme();
  return (
    <View
      accessibilityRole={accessibilityLabel ? 'radiogroup' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        gap: 4,
        padding: 4,
        borderRadius: radius,
        backgroundColor: colors.neutralFill,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={[
              {
                flex: 1,
                height,
                borderRadius: radius - 4,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? colors.surface : 'transparent',
              },
              selected ? shadows.segment : null,
            ]}
          >
            <Text
              style={{
                fontFamily: fontForText(option.label, selected ? fontFamily.jakarta700 : fontFamily.jakarta600, selected ? fontFamily.notoSinhala700 : fontFamily.notoSinhala600),
                fontSize: option.fontSize ?? 14,
                color: selected ? colors.primary : colors.ink2,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
