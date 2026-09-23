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
}

const light: ColorTokens = {
  bg: '#F7F4EE',
  surface: '#FFFFFF',
  ink: '#16181D',
  ink2: '#3B3F48',
  muted: '#5B606B',
  muted2: '#6B707A',
  line: '#E7E1D6',
  cardBorder: '#EEE8DD',
  divider: '#F0EBE2',
  neutralFill: '#EEEAE2',
  dashed: '#CFC7B8',
  primary: '#0E5A52',
  primaryDark: '#0A443E',
  primaryTint: '#E3F0EC',
  primaryTint2: '#F1F8F6',
  saffron: '#9A5409',
  saffronDark: '#7A4307',
  saffronTint: '#FBEEDC',
  white: '#FFFFFF',
  splashMarkSi: '#B8660B',
  splashText: '#CFE8E1',
  listenBorder: '#CFE3DD',
  progressTrack: '#E7E1D6', // = line
};

// Placeholder dark palette (behind features.darkMode; not designed yet).
const dark: ColorTokens = { ...light };

export const colors = { light, dark };

// Colour rule: English = ink, Sinhala pronunciation = saffron, Sinhala meaning = primary teal.
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
