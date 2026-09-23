// Font family keys as registered by useFonts() in app/_layout.tsx.
export const fontFamily = {
  frauncesMedium: 'Fraunces_500Medium',
  frauncesSemiBold: 'Fraunces_600SemiBold',
  frauncesBold: 'Fraunces_700Bold',
  jakarta400: 'PlusJakartaSans_400Regular',
  jakarta500: 'PlusJakartaSans_500Medium',
  jakarta600: 'PlusJakartaSans_600SemiBold',
  jakarta700: 'PlusJakartaSans_700Bold',
  notoSinhala400: 'NotoSansSinhala_400Regular',
  notoSinhala500: 'NotoSansSinhala_500Medium',
  notoSinhala600: 'NotoSansSinhala_600SemiBold',
  notoSinhala700: 'NotoSansSinhala_700Bold',
};

export const fontsToLoad = {
  Fraunces_500Medium: require('@expo-google-fonts/fraunces').Fraunces_500Medium,
  Fraunces_600SemiBold: require('@expo-google-fonts/fraunces').Fraunces_600SemiBold,
  Fraunces_700Bold: require('@expo-google-fonts/fraunces').Fraunces_700Bold,
  PlusJakartaSans_400Regular: require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium: require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold: require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold: require('@expo-google-fonts/plus-jakarta-sans').PlusJakartaSans_700Bold,
  NotoSansSinhala_400Regular: require('@expo-google-fonts/noto-sans-sinhala').NotoSansSinhala_400Regular,
  NotoSansSinhala_500Medium: require('@expo-google-fonts/noto-sans-sinhala').NotoSansSinhala_500Medium,
  NotoSansSinhala_600SemiBold: require('@expo-google-fonts/noto-sans-sinhala').NotoSansSinhala_600SemiBold,
  NotoSansSinhala_700Bold: require('@expo-google-fonts/noto-sans-sinhala').NotoSansSinhala_700Bold,
};

export interface TextStyleToken {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing?: number; // em, converted to px by resolveTextStyle
}

// Base (unscaled, textSize = 'm') styles. Sizes are px at 1x scale.
const u = undefined;

export const textStyles = {
  wordDetail: { family: fontFamily.frauncesSemiBold, size: 58, weight: 600, lineHeight: 62, letterSpacing: u },
  wordOfDay: { family: fontFamily.frauncesSemiBold, size: 46, weight: 600, lineHeight: 50, letterSpacing: u },
  flashcard: { family: fontFamily.frauncesSemiBold, size: 52, weight: 600, lineHeight: 56, letterSpacing: u },
  title32: { family: fontFamily.frauncesSemiBold, size: 32, weight: 600, lineHeight: 38, letterSpacing: u },
  title28: { family: fontFamily.frauncesSemiBold, size: 28, weight: 600, lineHeight: 34, letterSpacing: u },
  navTitle24: { family: fontFamily.frauncesSemiBold, size: 24, weight: 600, lineHeight: 29, letterSpacing: u },
  listWord: { family: fontFamily.frauncesSemiBold, size: 23, weight: 600, lineHeight: 28, letterSpacing: u },
  body17: { family: fontFamily.jakarta400, size: 17, weight: 400, lineHeight: 25, letterSpacing: u },
  body16: { family: fontFamily.jakarta400, size: 16, weight: 400, lineHeight: 23, letterSpacing: u },
  caption14: { family: fontFamily.jakarta500, size: 14, weight: 500, lineHeight: 19, letterSpacing: u },
  caption13: { family: fontFamily.jakarta500, size: 13, weight: 500, lineHeight: 18, letterSpacing: u },
  caption12: { family: fontFamily.jakarta500, size: 12, weight: 500, lineHeight: 16, letterSpacing: u },
  sectionLabel: { family: fontFamily.jakarta700, size: 12, weight: 700, lineHeight: 16, letterSpacing: 0.06 },
  tab: { family: fontFamily.jakarta600, size: 12, weight: 600, lineHeight: 16, letterSpacing: u },
} satisfies Record<string, TextStyleToken>;

export type TextStyleName = keyof typeof textStyles;

export type TextSize = 's' | 'm' | 'l';

const TEXT_SIZE_SCALE: Record<TextSize, number> = { s: 0.875, m: 1, l: 1.15 };

const MIN_SINHALA_PX = 12.5;

// Multiplies a base px size by the user's text-size setting; Sinhala text
// never shrinks below 12.5px regardless of scale.
export function scale(size: number, textSize: TextSize, isSinhala = false): number {
  const scaled = size * TEXT_SIZE_SCALE[textSize];
  return isSinhala ? Math.max(scaled, MIN_SINHALA_PX) : scaled;
}

export function resolveTextStyle(
  name: TextStyleName,
  textSize: TextSize = 'm',
  isSinhala = false,
) {
  const base = textStyles[name];
  const scaleFactor = TEXT_SIZE_SCALE[textSize];
  const size = scale(base.size, textSize, isSinhala);
  return {
    fontFamily: base.family,
    fontSize: size,
    lineHeight: base.lineHeight * scaleFactor,
    letterSpacing: base.letterSpacing ? base.letterSpacing * base.size : undefined,
  };
}
