import { Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface PosChipProps {
  label: string; // e.g. "verb · ක්‍රියා පදය"
}

// neutralFill bg, 28px height (Word Detail part-of-speech chip).
export function PosChip({ label }: PosChipProps) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        height: 28,
        paddingHorizontal: 12,
        borderRadius: radius[14],
        backgroundColor: colors.neutralFill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fontForText(label, fontFamily.jakarta600, fontFamily.notoSinhala600), fontSize: 13, color: colors.ink2 }}>
        {label}
      </Text>
    </View>
  );
}
