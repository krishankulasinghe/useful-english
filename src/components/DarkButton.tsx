import { Pressable, Text } from 'react-native';

import { Icon, type IconName } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface DarkButtonProps {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  height?: number; // 52 ("Practice these words" CTA) is the common case
  disabled?: boolean;
  fullWidth?: boolean;
}

// Fully rounded, bg `ink`, white 700 text (e.g. "Practice these words").
export function DarkButton({ label, onPress, icon, height = 52, disabled = false, fullWidth = true }: DarkButtonProps) {
  const { colors, space } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        height,
        borderRadius: height / 2,
        backgroundColor: colors.ink,
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[10],
        paddingHorizontal: space[24],
      }}
    >
      {icon ? <Icon name={icon} size={20} color={colors.white} strokeWidth={1.8} /> : null}
      <Text style={{ fontFamily: fontForText(label, fontFamily.jakarta700, fontFamily.notoSinhala700), fontSize: 16, color: colors.white }}>
        {label}
      </Text>
    </Pressable>
  );
}
