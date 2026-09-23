import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

const VISIBLE_MS = 1500;

// A small "Copied" toast pinned near the bottom of the screen. `useToast`
// owns the timed show/hide; render `<Toast message={message} />` wherever
// the overlay should appear (e.g. absolutely positioned over the screen).
export function useToast(): { message: string | undefined; show: (message: string) => void } {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(undefined), VISIBLE_MS);
  }, []);

  return { message, show };
}

interface ToastProps {
  message: string | undefined;
}

export function Toast({ message }: ToastProps) {
  const { colors, space, radius } = useTheme();
  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: space[24],
        alignItems: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.pill,
          paddingVertical: space[10],
          paddingHorizontal: space[20],
        }}
      >
        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.white }}>{message}</Text>
      </View>
    </View>
  );
}
