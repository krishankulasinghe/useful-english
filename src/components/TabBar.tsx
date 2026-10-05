import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

export interface TabBarItem {
  key: string;
  icon: IconName;
  label: string;
  active: boolean;
  onPress: () => void;
}

interface TabBarProps {
  items: TabBarItem[];
}

// Floating dock: 64px white pill, e3 shadow, 20px side margins. Active tab expands into an ink pill
// with icon + label; inactive tabs keep a small label for older users.
export function TabBar({ items }: TabBarProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) }}>
      <View
        accessibilityRole="tablist"
        style={[
          {
            height: 64,
            borderRadius: 999,
            backgroundColor: colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 6,
            gap: 4,
          },
          shadows.e3,
        ]}
      >
        {items.map((item) =>
          item.active ? (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: true }}
              accessibilityLabel={item.label}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 999,
                backgroundColor: colors.ink,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon name={item.icon} size={20} color={colors.white} strokeWidth={1.75} />
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.white }}>{item.label}</Text>
            </Pressable>
          ) : (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: false }}
              accessibilityLabel={item.label}
              style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', gap: 2 }}
            >
              <Icon name={item.icon} size={20} color={colors.muted} strokeWidth={1.75} />
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11, color: colors.muted }}>{item.label}</Text>
            </Pressable>
          ),
        )}
      </View>
    </View>
  );
}
