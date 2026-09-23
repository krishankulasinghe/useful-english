import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '../icons/Icon';
import { useTheme } from '../theme/useTheme';

interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number; // touch target, min 44
  iconSize?: number;
  variant?: 'outline' | 'ghost'; // outline = white bg + line border (back/search/filter), ghost = transparent (SentenceCard save/copy)
  color?: string;
  filled?: boolean;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

// 44px round icon-only button. Every use needs an accessibilityLabel (enforced by the prop being required).
export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  size = 44,
  iconSize,
  variant = 'outline',
  color,
  filled = false,
  strokeWidth = 1.8,
  style,
  disabled = false,
}: IconButtonProps) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={size < 44 ? (44 - size) / 2 : undefined}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isOutline ? colors.surface : 'transparent',
          borderWidth: isOutline ? 1 : 0,
          borderColor: colors.line,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Icon name={name} size={iconSize ?? Math.round(size * 0.45)} color={color ?? colors.ink} strokeWidth={strokeWidth} filled={filled} />
    </Pressable>
  );
}
