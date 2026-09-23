import { Text, type StyleProp, type TextStyle } from 'react-native';

import type { TextStyleName } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

export type EnglishTextVariant = Extract<
  TextStyleName,
  'wordOfDay' | 'wordDetail' | 'flashcard' | 'flashcardReveal' | 'listWord' | 'example20'
>;

interface EnglishTextProps {
  children: string;
  variant?: EnglishTextVariant;
  align?: 'left' | 'center';
  color?: string;
  /**
   * A substring of `children` to underline in `primary`. React Native's Text
   * style only exposes `textDecorationLine`/`textDecorationColor` (no
   * thickness/offset control), so the 2px/4px-offset underline from the
   * design is approximated with the closest RN can do.
   */
  highlight?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

// Colour rule: English words/sentences render in `ink`, Fraunces display font.
export function EnglishText({ children, variant = 'listWord', align = 'left', color, highlight, style, numberOfLines }: EnglishTextProps) {
  const { colors, text } = useTheme();
  const baseStyle = [text(variant), { color: color ?? colors.ink, textAlign: align }, style];

  if (!highlight) {
    return (
      <Text style={baseStyle} numberOfLines={numberOfLines}>
        {children}
      </Text>
    );
  }

  const index = children.indexOf(highlight);
  if (index === -1) {
    return (
      <Text style={baseStyle} numberOfLines={numberOfLines}>
        {children}
      </Text>
    );
  }

  const before = children.slice(0, index);
  const match = children.slice(index, index + highlight.length);
  const after = children.slice(index + highlight.length);

  return (
    <Text style={baseStyle} numberOfLines={numberOfLines}>
      {before}
      <Text style={{ textDecorationLine: 'underline', textDecorationColor: colors.primary, textDecorationStyle: 'solid' }}>{match}</Text>
      {after}
    </Text>
  );
}
