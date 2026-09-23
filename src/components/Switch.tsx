import { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const KNOB_SIZE = 26;
const PADDING = 3;

// 52x32 track, 26px knob. On = primary track, off = dashed track.
export function Switch({ value, onValueChange, accessibilityLabel, disabled = false }: SwitchProps) {
  const { colors, shadows } = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 150, useNativeDriver: false }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.dashed, colors.primary] });
  const knobTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [0, TRACK_WIDTH - KNOB_SIZE - PADDING * 2] });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: trackColor,
          padding: PADDING,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: KNOB_SIZE / 2,
              backgroundColor: colors.white,
              transform: [{ translateX: knobTranslate }],
            },
            shadows.knob,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
