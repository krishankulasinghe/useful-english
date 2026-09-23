import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { TestIds } from 'react-native-google-mobile-ads';

export type BannerPlacement = 'tabs' | 'word_detail';

/**
 * Returns the banner ad unit ID for the given placement and platform.
 * In __DEV__, always returns TestIds.ADAPTIVE_BANNER to prevent policy violations.
 */
export function getBannerAdUnitId(_placement?: BannerPlacement): string {
  if (__DEV__) {
    return TestIds.ADAPTIVE_BANNER;
  }

  const extra = Constants.expoConfig?.extra;
  if (Platform.OS === 'ios') {
    return extra?.ADMOB_BANNER_IOS || TestIds.ADAPTIVE_BANNER;
  }
  return extra?.ADMOB_BANNER_ANDROID || TestIds.ADAPTIVE_BANNER;
}

/**
 * Returns the interstitial ad unit ID.
 * In __DEV__, always returns TestIds.INTERSTITIAL.
 */
export function getInterstitialAdUnitId(): string {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }

  const extra = Constants.expoConfig?.extra;
  if (Platform.OS === 'ios') {
    return extra?.ADMOB_INTERSTITIAL_IOS || TestIds.INTERSTITIAL;
  }
  return extra?.ADMOB_INTERSTITIAL_ANDROID || TestIds.INTERSTITIAL;
}
