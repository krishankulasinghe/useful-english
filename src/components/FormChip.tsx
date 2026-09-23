import { Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

interface FormChipProps {
  label: string; // e.g. "reached"
}

const HEIGHT = 34;

// 34px height, white bg, line border, fully rounded (Word Detail verb forms).
export function FormChip({ label }: FormChipProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: HEIGHT,
        paddingHorizontal: 12,
        borderRadius: HEIGHT / 2,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.ink }}>{label}</Text>
    </View>
  );
}
