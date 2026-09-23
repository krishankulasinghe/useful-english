import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { features } from '../config/features';
import { useTheme } from '../theme/useTheme';
import { useAds } from './AdsProvider';
import { getBannerAdUnitId, type BannerPlacement } from './adUnits';

export interface AdBannerProps {
  placement: BannerPlacement;
}

export function AdBanner({ placement }: AdBannerProps) {
  const { colors } = useTheme();
  const { adsReady, canRequestAds } = useAds();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (!features.ads || !adsReady || !canRequestAds || isKeyboardVisible || hasError) {
    return null;
  }

  const unitId = getBannerAdUnitId(placement);

  return (
    <View
      style={[
        {
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        isLoaded
          ? {
              borderTopWidth: 1,
              borderTopColor: colors.line,
            }
          : {
              height: 0,
              overflow: 'hidden',
            },
      ]}
    >
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onAdFailedToLoad={(_err) => {
          setIsLoaded(false);
          setHasError(true);
        }}
      />
    </View>
  );
}
