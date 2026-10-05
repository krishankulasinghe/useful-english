import { View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number; // 6 (default) or 8 (workout / hero)
  trackColor?: string;
  fillColor?: string;
}

// Track (`progressTrack`) with a `primary` fill; colours overridable for use on the indigo hero.
export function ProgressBar({ progress, height = 6, trackColor, fillColor }: ProgressBarProps) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, progress));
  const r = height / 2;
  return (
    <View
      accessibilityRole="progressbar"
      style={{ height, borderRadius: r, backgroundColor: trackColor ?? colors.progressTrack, overflow: 'hidden' }}
    >
      <View style={{ height, borderRadius: r, backgroundColor: fillColor ?? colors.primary, width: `${pct * 100}%` }} />
    </View>
  );
}
