import { Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';

export interface ScreenTitleProps {
  title: string;
  subtitle?: string;
  size?: 'large' | 'medium';
}

// Fraunces 32/28 title + 16px muted Sinhala subtitle (screen headers on
// Home/Vocabulary/Sentences/Practice/Settings).
export function ScreenTitle({ title, subtitle, size = 'large' }: ScreenTitleProps) {
  const { colors, text } = useTheme();
  const titleStyle = text(size === 'large' ? 'title32' : 'title28');

  return (
    <View>
      <Text style={[titleStyle, { color: colors.ink }]}>{title}</Text>
      {subtitle ? (
        <Text style={[text('body16', true), { color: colors.muted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
