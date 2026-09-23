import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  height?: number; // 56 (onboarding/practice) is the common case
  disabled?: boolean;
  fullWidth?: boolean;
}

// Fully rounded, bg `primary`, white 700 text. Used for Next/Continue/Learn this word/I know this, etc.
export function PrimaryButton({ label, onPress, icon, iconPosition = 'right', height = 56, disabled = false, fullWidth = true }: PrimaryButtonProps) {
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
        backgroundColor: colors.primary,
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[10],
        paddingHorizontal: space[24],
      }}
    >
      {icon && iconPosition === 'left' ? <Icon name={icon} size={18} color={colors.white} strokeWidth={2.2} /> : null}
      <View>
        <Text style={{ fontFamily: fontForText(label, fontFamily.jakarta700, fontFamily.notoSinhala700), fontSize: 16, color: colors.white }}>
          {label}
        </Text>
      </View>
      {icon && iconPosition === 'right' ? <Icon name={icon} size={18} color={colors.white} strokeWidth={2.2} /> : null}
    </Pressable>
  );
}
