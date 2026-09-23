import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface ListRowProps {
  label: string;
  sublabel?: string;
  value?: string; // trailing text, e.g. "Beginner"
  left?: ReactNode; // e.g. an icon tile
  right?: ReactNode; // e.g. a <Switch/>; defaults to a chevron when `onPress` is set
  minHeight?: 58 | 64 | 54;
  onPress?: () => void;
  /** Set automatically by `GroupedList` — the last row skips the divider. */
  isLast?: boolean;
}

// A single row inside a `GroupedList`. Divider-separated except for the last row.
export function ListRow({ label, sublabel, value, left, right, minHeight = 58, onPress, isLast }: ListRowProps) {
  const { colors, space } = useTheme();
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={{
        minHeight,
        paddingHorizontal: space[16],
        paddingVertical: sublabel ? space[10] : 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      {left}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>{label}</Text>
        {sublabel ? (
          <Text style={{ fontFamily: fontForText(sublabel, fontFamily.jakarta400, fontFamily.notoSinhala400), fontSize: 13, color: colors.muted }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {value ? <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.muted }}>{value}</Text> : null}
      {right ?? (onPress ? <Icon name="chevron-right" size={20} color={colors.muted} /> : null)}
    </Wrapper>
  );
}
