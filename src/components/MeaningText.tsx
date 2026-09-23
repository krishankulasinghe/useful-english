import { useState } from 'react';
import { Pressable, Text, type StyleProp, type TextStyle } from 'react-native';

import { useSettingsStore } from '../state/settingsStore';
import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

interface MeaningTextProps {
  children: string;
  size?: number; // px at textSize 'm'
  weight?: 400 | 500 | 600 | 700;
  align?: 'left' | 'center';
  style?: StyleProp<TextStyle>;
}

const WEIGHT_FAMILY: Record<number, string> = {
  400: fontFamily.notoSinhala400,
  500: fontFamily.notoSinhala500,
  600: fontFamily.notoSinhala600,
  700: fontFamily.notoSinhala700,
};

// Colour rule: Sinhala meaning renders in `primary` teal. When "Show Sinhala
// meaning" is off, shows a tappable placeholder (self-test mode) that
// reveals the real text locally, for this instance only.
export function MeaningText({ children, size = 16, weight = 400, align = 'left', style }: MeaningTextProps) {
  const { colors, space, radius, textSize } = useTheme();
  const showMeaning = useSettingsStore((s) => s.showMeaning);
  const [revealed, setRevealed] = useState(false);

  if (!showMeaning && !revealed) {
    return (
      <Pressable
        onPress={() => setRevealed(true)}
        accessibilityRole="button"
        accessibilityLabel="Tap to show meaning"
        style={{
          alignSelf: align === 'center' ? 'center' : 'flex-start',
          paddingVertical: space[6],
          paddingHorizontal: space[12],
          borderRadius: radius.pill,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.dashed,
        }}
      >
        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.muted2 }}>Tap to show meaning</Text>
      </Pressable>
    );
  }

  const scale = textSize === 's' ? 0.875 : textSize === 'l' ? 1.15 : 1;
  const fontSize = Math.max(size * scale, 12.5);

  return (
    <Text style={[{ fontFamily: WEIGHT_FAMILY[weight], fontSize, color: colors.primary, textAlign: align }, style]}>
      {children}
    </Text>
  );
}
