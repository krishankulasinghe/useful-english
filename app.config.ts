import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Sin-Eng',
  slug: 'sin-eng',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'sineng',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.sineng.app',
  },
  android: {
    package: 'com.sineng.app',
    adaptiveIcon: {
      backgroundColor: '#0E5A52',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-sqlite',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0E5A52',
        image: './assets/icon.png',
        imageWidth: 108,
      },
    ],
  ],
  extra: {
    // Empty string = no remote content updates; UpdateService no-ops.
    CONTENT_BASE_URL: process.env.CONTENT_BASE_URL ?? '',
    ADMOB_ANDROID_APP_ID: process.env.ADMOB_ANDROID_APP_ID ?? '',
    ADMOB_IOS_APP_ID: process.env.ADMOB_IOS_APP_ID ?? '',
    ADMOB_BANNER_ANDROID: process.env.ADMOB_BANNER_ANDROID ?? '',
    ADMOB_BANNER_IOS: process.env.ADMOB_BANNER_IOS ?? '',
    ADMOB_INTERSTITIAL_ANDROID: process.env.ADMOB_INTERSTITIAL_ANDROID ?? '',
    ADMOB_INTERSTITIAL_IOS: process.env.ADMOB_INTERSTITIAL_IOS ?? '',
  },
};

export default config;
