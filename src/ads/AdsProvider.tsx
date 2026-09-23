import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

import { features } from '../config/features';

export interface AdsContextValue {
  adsReady: boolean;
  canRequestAds: boolean;
  isPrivacyOptionsRequired: boolean;
  showPrivacyOptions: () => Promise<void>;
}

const AdsContext = createContext<AdsContextValue>({
  adsReady: false,
  canRequestAds: false,
  isPrivacyOptionsRequired: false,
  showPrivacyOptions: async () => {},
});

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [adsReady, setAdsReady] = useState(false);
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [isPrivacyOptionsRequired, setIsPrivacyOptionsRequired] = useState(false);

  useEffect(() => {
    if (!features.ads) {
      return;
    }

    let isMounted = true;

    async function initAds() {
      let canRequest = true;

      // 1. Gather consent with UMP (required for EEA/UK users)
      try {
        const consentInfo = await AdsConsent.gatherConsent();
        canRequest = consentInfo.canRequestAds;
        if (isMounted) {
          setIsPrivacyOptionsRequired(
            consentInfo.privacyOptionsRequirementStatus ===
              AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
          );
        }
      } catch (err) {
        // Fallback gracefully if UMP fails or is unavailable
      }

      // 2. On iOS, request App Tracking Transparency (ATT)
      if (Platform.OS === 'ios') {
        try {
          await requestTrackingPermissionsAsync();
        } catch (err) {
          // Tracking permission request failed or unavailable
        }
      }

      // 3. Initialize Google Mobile Ads SDK
      try {
        await mobileAds().initialize();
        if (isMounted) {
          setAdsReady(true);
          setCanRequestAds(canRequest);
        }
      } catch (err) {
        // Initialization failed (e.g. running in test or unsupported env)
      }
    }

    initAds();

    return () => {
      isMounted = false;
    };
  }, []);

  const showPrivacyOptions = useCallback(async () => {
    if (!features.ads) return;
    try {
      const consentInfo = await AdsConsent.showPrivacyOptionsForm();
      setCanRequestAds(consentInfo.canRequestAds);
      setIsPrivacyOptionsRequired(
        consentInfo.privacyOptionsRequirementStatus ===
          AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      );
    } catch (err) {
      console.warn('Failed to show privacy options form:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      adsReady,
      canRequestAds,
      isPrivacyOptionsRequired,
      showPrivacyOptions,
    }),
    [adsReady, canRequestAds, isPrivacyOptionsRequired, showPrivacyOptions],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds(): AdsContextValue {
  return useContext(AdsContext);
}
