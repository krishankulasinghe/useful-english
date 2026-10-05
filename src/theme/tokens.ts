export interface ColorTokens {
  bg: string;
  surface: string;
  ink: string;
  ink2: string;
  muted: string;
  muted2: string;
  line: string;
  cardBorder: string;
  divider: string;
  neutralFill: string;
  dashed: string;
  primary: string;
  primaryDark: string;
  primaryTint: string;
  primaryTint2: string;
  saffron: string;
  saffronDark: string;
  saffronTint: string;
  white: string;
  splashMarkSi: string;
  splashText: string;
  listenBorder: string;
  progressTrack: string;
  success: string;
  successDark: string;
  successTint: string;
  error: string;
  errorTint: string;
  onPrimarySoft: string;
  primaryOnHero: string;
}

const light: ColorTokens = {
  bg: '#F5F4F0',
  surface: '#FFFFFF',
  ink: '#14151A',
  ink2: '#3D404A',
  muted: '#636773',
  muted2: '#636773',
  line: '#E4E2DC',
  cardBorder: '#EFEEE9',
  divider: '#EFEEE9',
  neutralFill: '#EFEEE9',
  dashed: '#D9D7D0',
  primary: '#3A35C8',
  primaryDark: '#2C28A0',
  primaryTint: '#ECEBFB',
  primaryTint2: '#F5F4FD',
  saffron: '#A14D00',
  saffronDark: '#7A3B00',
  saffronTint: '#FCEFE0',
  white: '#FFFFFF',
  splashMarkSi: '#A14D00',
  splashText: '#DCDAFA',
  listenBorder: '#DCDAFA',
  progressTrack: '#E4E2DC', // = line
  success: '#1C7A4A',
  successDark: '#14593A',
  successTint: '#E3F3EA',
  error: '#C0332B',
  errorTint: '#FBE9E7',
  onPrimarySoft: '#DCDAFA',
  primaryOnHero: '#5550D6',
};

// Placeholder dark palette (behind features.darkMode; not designed yet).
const dark: ColorTokens = { ...light };

export const colors = { light, dark };

// Colour rule: English = ink, Sinhala pronunciation = saffron, Sinhala meaning = primary indigo.
export const trio = {
  en: 'ink' as const,
  pron: 'saffron' as const,
  meaning: 'primary' as const,
};

export interface LevelChipStyle {
  bg: keyof ColorTokens;
  fg: keyof ColorTokens;
  labelEn: string;
  labelSi: string;
}

export const level: Record<'beginner' | 'intermediate' | 'advanced', LevelChipStyle> = {
  beginner: { bg: 'primaryTint', fg: 'primaryDark', labelEn: 'Beginner', labelSi: 'ආරම්භක' },
  intermediate: { bg: 'saffronTint', fg: 'saffronDark', labelEn: 'Intermediate', labelSi: 'මධ්‍යම' },
  advanced: { bg: 'ink', fg: 'white', labelEn: 'Advanced', labelSi: 'උසස්' },
};

export const space = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  22: 22,
  24: 24,
  28: 28,
  32: 32,
  screenPadding: 20,
};

export const radius = {
  10: 10,
  11: 11,
  12: 12,
  14: 14,
  15: 15,
  16: 16,
  18: 18,
  20: 20,
  22: 22,
  24: 24,
  28: 28,
  32: 32,
  pill: 999,
};

export type ThemeName = 'light' | 'dark';
