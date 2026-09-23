import { Platform, type ViewStyle } from 'react-native';

interface ShadowSpec {
  offsetY: number;
  blur: number;
  opacity: number;
  color?: string;
}

// React Native only supports one iOS shadow per view, so each token uses the
// larger (more visually dominant) of the layered box-shadows in the CSS spec.
// Android falls back to `elevation`, approximated from the same blur radius.
function makeShadow({ offsetY, blur, opacity, color = '#16181D' }: ShadowSpec): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
    },
    android: {
      elevation: Math.round(blur / 4),
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
    },
  }) as ViewStyle;
}

export const shadows = {
  // 0 1px 2px rgba(22,24,29,.04), 0 10px 30px rgba(22,24,29,.06)
  hero: makeShadow({ offsetY: 10, blur: 30, opacity: 0.06 }),
  // 0 14px 40px rgba(22,24,29,.08)
  flashcard: makeShadow({ offsetY: 14, blur: 40, opacity: 0.08 }),
  // 0 1px 3px rgba(22,24,29,.10)
  segment: makeShadow({ offsetY: 1, blur: 3, opacity: 0.1 }),
  // 0 1px 2px rgba(0,0,0,.2)
  knob: makeShadow({ offsetY: 1, blur: 2, opacity: 0.2, color: '#000000' }),
  // 0 18px 40px rgba(22,24,29,.10)
  lift: makeShadow({ offsetY: 18, blur: 40, opacity: 0.1 }),
  // 0 18px 40px rgba(0,0,0,.18)
  splashMark: makeShadow({ offsetY: 18, blur: 40, opacity: 0.18, color: '#000000' }),
};
