import { Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

interface StatusChipProps {
  label?: string; // default "Coming soon"
}

// Saffron-tint pill used for not-yet-available rows (Settings › Audio).
export function StatusChip({ label = 'Coming soon' }: StatusChipProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: 26,
        paddingHorizontal: 10,
        borderRadius: 13,
        backgroundColor: colors.saffronTint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, color: colors.saffronDark }}>{label}</Text>
    </View>
  );
}
