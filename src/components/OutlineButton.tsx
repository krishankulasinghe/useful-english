import { Pressable, Text } from 'react-native';

import { Icon, type IconName } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface OutlineButtonProps {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  height?: number; // 54 (Word Detail "I know it") is the common case
  tone?: 'primary' | 'muted'; // muted = dashed-colour border, ink text ("Still learning")
  disabled?: boolean;
  fullWidth?: boolean;
}

// Bordered pill button, white bg. `tone="primary"` = teal border/text; `tone="muted"` = dashed-token border, ink text.
export function OutlineButton({
  label,
  onPress,
  icon,
  iconPosition = 'left',
  height = 54,
  tone = 'primary',
  disabled = false,
  fullWidth = true,
}: OutlineButtonProps) {
  const { colors, space } = useTheme();
  const borderColor = tone === 'primary' ? colors.primary : colors.dashed;
  const textColor = tone === 'primary' ? colors.primary : colors.ink;

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
        borderWidth: 1.5,
        borderColor,
        backgroundColor: colors.surface,
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space[8],
        paddingHorizontal: space[24],
      }}
    >
      {icon && iconPosition === 'left' ? <Icon name={icon} size={18} color={textColor} strokeWidth={2.4} /> : null}
      <Text style={{ fontFamily: fontForText(label, fontFamily.jakarta700, fontFamily.notoSinhala700), fontSize: 16, color: textColor }}>
        {label}
      </Text>
      {icon && iconPosition === 'right' ? <Icon name={icon} size={18} color={textColor} strokeWidth={2.4} /> : null}
    </Pressable>
  );
}
