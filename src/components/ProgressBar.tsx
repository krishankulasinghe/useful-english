import { View } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface ProgressBarProps {
  progress: number; // 0-1
}

// 6px height track (`progressTrack`) with a `primary` fill.
export function ProgressBar({ progress }: ProgressBarProps) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View accessibilityRole="progressbar" style={{ height: 6, borderRadius: 3, backgroundColor: colors.progressTrack, overflow: 'hidden' }}>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primary, width: `${pct * 100}%` }} />
    </View>
  );
}
