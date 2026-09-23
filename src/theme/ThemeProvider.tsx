import React, { createContext, useContext, useMemo } from 'react';

import { features } from '../config/features';
import { useSettingsStore } from '../state/settingsStore';
import { colors, level, radius, space, trio, type ColorTokens } from './tokens';
import { shadows } from './shadows';
import { resolveTextStyle, type TextSize, type TextStyleName } from './typography';

export interface ThemeContextValue {
  colors: ColorTokens;
  trio: typeof trio;
  level: typeof level;
  space: typeof space;
  radius: typeof radius;
  shadows: typeof shadows;
  textSize: TextSize;
  text: (name: TextStyleName, isSinhala?: boolean) => ReturnType<typeof resolveTextStyle>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const textSize = useSettingsStore((s) => s.textSize);

  const activeTheme = features.darkMode && theme === 'dark' ? 'dark' : 'light';

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: colors[activeTheme],
      trio,
      level,
      space,
      radius,
      shadows,
      textSize,
      text: (name, isSinhala) => resolveTextStyle(name, textSize, isSinhala),
    }),
    [activeTheme, textSize],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within a ThemeProvider');
  return ctx;
}
