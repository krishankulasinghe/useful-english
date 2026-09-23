// Mock react-native-google-mobile-ads
jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const { View } = require('react-native');

  const TestIds = {
    ADAPTIVE_BANNER: 'ca-app-pub-3940256099942544/2934735716',
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    INTERSTITIAL_VIDEO: 'ca-app-pub-3940256099942544/8691691433',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
    REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/6978759866',
    APP_OPEN: 'ca-app-pub-3940256099942544/5662855259',
  };

  const BannerAdSize = {
    BANNER: 'BANNER',
    FULL_BANNER: 'FULL_BANNER',
    LARGE_BANNER: 'LARGE_BANNER',
    LEADERBOARD: 'LEADERBOARD',
    MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
    ADAPTIVE_BANNER: 'ADAPTIVE_BANNER',
    ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    INLINE_ADAPTIVE_BANNER: 'INLINE_ADAPTIVE_BANNER',
    WIDE_SKYSCRAPER: 'WIDE_SKYSCRAPER',
  };

  const AdEventType = {
    LOADED: 'loaded',
    ERROR: 'error',
    OPENED: 'opened',
    PAID: 'paid',
    CLICKED: 'clicked',
    CLOSED: 'closed',
    IMPRESSION: 'impression',
  };

  const AdsConsentStatus = {
    UNKNOWN: 'UNKNOWN',
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED',
    OBTAINED: 'OBTAINED',
  };

  const AdsConsentPrivacyOptionsRequirementStatus = {
    UNKNOWN: 'UNKNOWN',
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED',
  };

  const AdsConsent = {
    requestInfoUpdate: jest.fn().mockResolvedValue({
      status: AdsConsentStatus.NOT_REQUIRED,
      canRequestAds: true,
      isConsentFormAvailable: false,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
    }),
    showForm: jest.fn().mockResolvedValue({ status: AdsConsentStatus.OBTAINED }),
    showPrivacyOptionsForm: jest.fn().mockResolvedValue({
      status: AdsConsentStatus.OBTAINED,
      canRequestAds: true,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
    }),
    loadAndShowConsentFormIfRequired: jest.fn().mockResolvedValue({ status: AdsConsentStatus.NOT_REQUIRED }),
    getConsentInfo: jest.fn().mockResolvedValue({
      status: AdsConsentStatus.NOT_REQUIRED,
      canRequestAds: true,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
      isConsentFormAvailable: false,
    }),
    gatherConsent: jest.fn().mockResolvedValue({
      status: AdsConsentStatus.NOT_REQUIRED,
      canRequestAds: true,
      privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
      isConsentFormAvailable: false,
    }),
    reset: jest.fn(),
  };

  const BannerAd = jest.fn((props) => React.createElement(View, { testID: 'admob-banner', ...props }));

  class MockInterstitialAd {
    static createForAdRequest = jest.fn(() => new MockInterstitialAd());
    load = jest.fn();
    show = jest.fn();
    addAdEventListener = jest.fn((_event, _callback) => jest.fn());
  }

  const mobileAds = jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue([]),
    setRequestConfiguration: jest.fn().mockResolvedValue(),
  }));

  return {
    __esModule: true,
    default: mobileAds,
    mobileAds,
    TestIds,
    BannerAdSize,
    AdEventType,
    AdsConsentStatus,
    AdsConsentPrivacyOptionsRequirementStatus,
    AdsConsent,
    BannerAd,
    InterstitialAd: MockInterstitialAd,
  };
});

// Mock expo-tracking-transparency
jest.mock('expo-tracking-transparency', () => ({
  requestTrackingPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  getTrackingPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted', granted: true }),
  isAvailable: jest.fn().mockReturnValue(true),
  useTrackingPermissions: jest.fn().mockReturnValue([{ status: 'granted', granted: true }, jest.fn(), jest.fn()]),
}));
