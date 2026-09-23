import { features } from '../config/features';
import {
  isInterstitialEligible,
  showPracticeInterstitial,
  _resetSessionForTesting,
  INTERSTITIAL_COOLDOWN_MS,
} from './interstitial';

describe('interstitial logic', () => {
  beforeEach(() => {
    _resetSessionForTesting();
    features.ads = true;
  });

  afterAll(() => {
    features.ads = true;
  });

  describe('isInterstitialEligible', () => {
    it('returns false for the first deck of the session', () => {
      // session deck 1
      expect(isInterstitialEligible(undefined, 1)).toBe(false);
      expect(isInterstitialEligible(0, 1)).toBe(false);
    });

    it('returns true on subsequent decks if no previous interstitial was shown', () => {
      expect(isInterstitialEligible(undefined, 2)).toBe(true);
    });

    it('returns false if less than 3 minutes have passed since last interstitial', () => {
      const now = 1000000;
      const lastInterstitialAt = now - (INTERSTITIAL_COOLDOWN_MS - 1000); // 2m 59s ago
      expect(isInterstitialEligible(lastInterstitialAt, 2, now)).toBe(false);
    });

    it('returns true if 3 minutes or more have passed since last interstitial', () => {
      const now = 1000000;
      const lastInterstitialAt = now - INTERSTITIAL_COOLDOWN_MS; // exactly 3m ago
      expect(isInterstitialEligible(lastInterstitialAt, 2, now)).toBe(true);
      expect(isInterstitialEligible(now - INTERSTITIAL_COOLDOWN_MS - 5000, 3, now)).toBe(true);
    });

    it('returns false when features.ads is disabled', () => {
      features.ads = false;
      expect(isInterstitialEligible(undefined, 2)).toBe(false);
    });
  });

  describe('showPracticeInterstitial', () => {
    it('immediately calls onDismiss and increments deck count on first deck', () => {
      const onDismiss = jest.fn();
      const record = jest.fn();

      showPracticeInterstitial({
        lastInterstitialAt: undefined,
        recordInterstitialShown: record,
        onDismiss,
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(record).not.toHaveBeenCalled();
    });
  });
});
