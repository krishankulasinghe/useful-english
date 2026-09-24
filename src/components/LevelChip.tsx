import { Text, View } from 'react-native';

import type { Level } from '../content/types';
import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

interface LevelChipProps {
  level: Level;
}

// Bilingual label from the theme's `level` map (Beginner · ආරම්භක, etc). Height 26, radius 13.
export function LevelChip({ level }: LevelChipProps) {
  const { colors, level: levelMap } = useTheme();
  const style = levelMap[level];
  return (
    <View
      style={{
        height: 26,
        paddingHorizontal: 10,
        borderRadius: 13,
        backgroundColor: colors[style.bg],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors[style.fg] }}>
        {style.labelEn}
      </Text>
    </View>
  );
}
