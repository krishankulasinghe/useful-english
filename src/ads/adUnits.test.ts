import { TestIds } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId, getInterstitialAdUnitId } from './adUnits';

describe('adUnits', () => {
  it('returns TestIds.ADAPTIVE_BANNER in development', () => {
    // In Jest / dev, __DEV__ is true
    expect(getBannerAdUnitId()).toBe(TestIds.ADAPTIVE_BANNER);
    expect(getBannerAdUnitId('tabs')).toBe(TestIds.ADAPTIVE_BANNER);
    expect(getBannerAdUnitId('word_detail')).toBe(TestIds.ADAPTIVE_BANNER);
  });

  it('returns TestIds.INTERSTITIAL in development', () => {
    expect(getInterstitialAdUnitId()).toBe(TestIds.INTERSTITIAL);
  });
});
