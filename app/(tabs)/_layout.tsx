import { Tabs } from 'expo-router';

import { TabBar, type TabBarItem } from '../../src/components/TabBar';
import type { IconName } from '../../src/icons/Icon';
import { useT } from '../../src/i18n/useT';

const TAB_ICONS: Record<string, IconName> = {
  'home/index': 'home',
  words: 'book',
  sentences: 'message',
  'practice/index': 'cards',
  settings: 'settings',
};

const TAB_LABEL_KEYS = {
  'home/index': 'tabHome',
  words: 'tabWords',
  sentences: 'tabSentences',
  'practice/index': 'tabPractice',
  settings: 'tabSettings',
} as const;

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => {
        const items: TabBarItem[] = state.routes.map((route, index) => ({
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
        }));
        return <TabBar items={items} />;
      }}
    >
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="words" options={{ title: 'Words' }} />
      <Tabs.Screen name="sentences" options={{ title: 'Sentences' }} />
      <Tabs.Screen name="practice/index" options={{ title: 'Practice' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
