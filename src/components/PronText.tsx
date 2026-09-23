import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useSettingsStore } from '../state/settingsStore';
import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

interface PronTextProps {
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

// Colour rule: Sinhala pronunciation renders in `saffron`. Hidden entirely
// when the "Show pronunciation" setting is off.
export function PronText({ children, size = 15, weight = 600, align = 'left', style }: PronTextProps) {
  const { colors, textSize } = useTheme();
  const showPronunciation = useSettingsStore((s) => s.showPronunciation);
  if (!showPronunciation) return null;

  const scale = textSize === 's' ? 0.875 : textSize === 'l' ? 1.15 : 1;
  const fontSize = Math.max(size * scale, 12.5);

  return (
    <Text
      style={[{ fontFamily: WEIGHT_FAMILY[weight], fontSize, color: colors.saffron, textAlign: align }, style]}
    >
      {children}
    </Text>
  );
}
