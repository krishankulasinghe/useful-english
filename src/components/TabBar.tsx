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

// 84px white bar, top `line` border. Active tab = teal 700 label + 56x30 primaryTint pill (stroke 1.9); inactive = muted 500.
export function TabBar({ items }: TabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.line,
        paddingTop: 8,
        paddingHorizontal: 8,
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          accessibilityRole="tab"
          accessibilityState={{ selected: item.active }}
          accessibilityLabel={item.label}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}
        >
          <View
            style={{
              width: 56,
              height: 30,
              borderRadius: 15,
              backgroundColor: item.active ? colors.primaryTint : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={item.icon} size={22} color={item.active ? colors.primary : colors.muted} strokeWidth={item.active ? 1.9 : 1.8} />
          </View>
          <Text
            style={{
              fontFamily: item.active ? fontFamily.jakarta700 : fontFamily.jakarta500,
              fontSize: 12,
              color: item.active ? colors.primary : colors.muted,
            }}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
