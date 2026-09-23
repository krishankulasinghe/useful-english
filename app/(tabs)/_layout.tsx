import { Tabs } from 'expo-router';

// Step 1 replaces the default tab bar with the custom <TabBar/> component.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="words" options={{ title: 'Words' }} />
      <Tabs.Screen name="sentences" options={{ title: 'Sentences' }} />
      <Tabs.Screen name="practice/index" options={{ title: 'Practice' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
