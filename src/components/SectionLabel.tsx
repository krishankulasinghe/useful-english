import { Text } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface SectionLabelProps {
  children: string;
  color?: string;
}

// The `sectionLabel` text-style token: 12/700, 0.06em letter-spacing (e.g. "LEARNING · ඉගෙනීම").
export function SectionLabel({ children, color }: SectionLabelProps) {
  const { colors, text } = useTheme();
  return <Text style={[text('sectionLabel'), { color: color ?? colors.muted }]}>{children}</Text>;
}
