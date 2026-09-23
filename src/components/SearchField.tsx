import { TextInput, View } from 'react-native';

import { Icon } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel?: string;
}

// 52px height, radius 16, line border, muted2 placeholder.
export function SearchField({ value, onChangeText, placeholder, accessibilityLabel }: SearchFieldProps) {
  const { colors, radius, space } = useTheme();
  return (
    <View
      style={{
        height: 52,
        borderRadius: radius[16],
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[10],
        paddingHorizontal: space[16],
      }}
    >
      <Icon name="search" size={20} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted2}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={{ flex: 1, fontFamily: fontFamily.jakarta400, fontSize: 16, color: colors.ink, padding: 0 }}
      />
    </View>
  );
}
