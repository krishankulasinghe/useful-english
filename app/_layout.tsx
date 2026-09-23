import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdsProvider } from '../src/ads/AdsProvider';
import { ContentProvider } from '../src/content/ContentProvider';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { fontsToLoad } from '../src/theme/typography';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontsToLoad);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ContentProvider>
        <ThemeProvider>
          <AdsProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AdsProvider>
        </ThemeProvider>
      </ContentProvider>
    </SafeAreaProvider>
  );
}
