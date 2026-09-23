import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';

import { features } from '../config/features';
import { getInterstitialAdUnitId } from './adUnits';

export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

let sessionDecksCompleted = 0;
let currentInterstitial: InterstitialAd | null = null;
let isLoaded = false;
let isLoading = false;

/**
 * Returns true if an interstitial ad should be displayed given:
 * - features.ads is enabled
 * - not the first deck of the session (sessionDecksCompleted > 1)
 * - at least 3 minutes have passed since lastInterstitialAt
 */
export function isInterstitialEligible(
  lastInterstitialAt: number | undefined,
  decksCompleted: number = sessionDecksCompleted,
  now: number = Date.now(),
): boolean {
  if (!features.ads) {
    return false;
  }
  // Never within the first session's first deck
  if (decksCompleted <= 1) {
    return false;
  }
  // Frequency cap: at most once every 3 minutes
  if (lastInterstitialAt && now - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) {
    return false;
  }
  return true;
}

/**
 * Preloads the interstitial ad instance so it's ready when a deck finishes.
 */
export function preloadPracticeInterstitial(): void {
  if (!features.ads || isLoaded || isLoading) {
    return;
  }

  try {
    isLoading = true;
    const ad = InterstitialAd.createForAdRequest(getInterstitialAdUnitId());

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
      isLoading = false;
      unsubscribeLoaded();
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
      isLoaded = false;
      isLoading = false;
      currentInterstitial = null;
      unsubscribeError();
    });

    currentInterstitial = ad;
    ad.load();
  } catch (err) {
    isLoading = false;
    isLoaded = false;
    currentInterstitial = null;
  }
}

export interface ShowPracticeInterstitialParams {
  lastInterstitialAt: number | undefined;
  recordInterstitialShown: (timestamp: number) => void;
  onDismiss: () => void;
}

/**
 * Checks eligibility and shows the interstitial ad after finishing a deck.
 * Always calls onDismiss when done (or immediately if ineligible / ad not ready)
 * so the flow can continue to the summary screen.
 */
export function showPracticeInterstitial({
  lastInterstitialAt,
  recordInterstitialShown,
  onDismiss,
}: ShowPracticeInterstitialParams): void {
  sessionDecksCompleted += 1;

  const eligible = isInterstitialEligible(lastInterstitialAt, sessionDecksCompleted);

  if (!eligible || !currentInterstitial || !isLoaded) {
    onDismiss();
    // Preload next one if needed
    if (!isLoaded && !isLoading) {
      preloadPracticeInterstitial();
    }
    return;
  }

  const ad = currentInterstitial;
  isLoaded = false;
  currentInterstitial = null;

  let dismissed = false;
  const finish = () => {
    if (!dismissed) {
      dismissed = true;
      onDismiss();
      preloadPracticeInterstitial();
    }
  };

  const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    unsubscribeClosed();
    finish();
  });

  const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
    unsubscribeError();
    finish();
  });

  try {
    recordInterstitialShown(Date.now());
    ad.show();
  } catch (err) {
    finish();
  }
}

/**
 * Helper to reset in-memory session state for testing.
 */
export function _resetSessionForTesting(): void {
  sessionDecksCompleted = 0;
  isLoaded = false;
  isLoading = false;
  currentInterstitial = null;
}
