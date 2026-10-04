import { View } from 'react-native';
import { Tabs } from 'expo-router';

import { AdBanner } from '../../src/ads/AdBanner';
import { TabBar, type TabBarItem } from '../../src/components/TabBar';
import type { IconName } from '../../src/icons/Icon';
import { useT } from '../../src/i18n/useT';

const TAB_ICONS: Record<string, IconName> = {
  'home/index': 'home',
  sentences: 'compass',
  'practice/index': 'cards',
  'saved/index': 'bookmark',
};

const TAB_LABEL_KEYS = {
  'home/index': 'tabHome',
  sentences: 'tabExplore',
  'practice/index': 'tabPractice',
  'saved/index': 'tabSaved',
} as const;

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => {
        // Filter out hidden routes (e.g. href: null)
        const visibleRoutes = state.routes.filter(
          (route) => route.name in TAB_ICONS,
        );

        const items: TabBarItem[] = visibleRoutes.map((route) => {
          const index = state.routes.findIndex((r) => r.key === route.key);
          return {
            key: route.key,
            icon: TAB_ICONS[route.name] ?? 'home',
            label: t(TAB_LABEL_KEYS[route.name as keyof typeof TAB_LABEL_KEYS] ?? 'tabHome'),
            active: state.index === index,
            onPress: () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (state.index !== index && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            },
          };
        });

        return (
          <View>
            <AdBanner placement="tabs" />
            <TabBar items={items} />
          </View>
        );
      }}
    >
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="sentences" options={{ title: 'Explore' }} />
      <Tabs.Screen name="practice/index" options={{ title: 'Practice' }} />
      <Tabs.Screen name="saved/index" options={{ title: 'Saved' }} />
      <Tabs.Screen name="words" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
