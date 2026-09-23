import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';
import { BackButton } from './BackButton';

interface NavHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode; // an IconButton, or omit for a 44px spacer to keep the title centered
}

// BackButton · centered Fraunces 24 title + 13px muted subtitle · optional right icon button.
export function NavHeader({ title, subtitle, onBack, backLabel, right }: NavHeaderProps) {
  const { colors, text } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
      <BackButton onPress={onBack} label={backLabel} />
      <View style={{ alignItems: 'center', flexShrink: 1 }}>
        <Text style={[text('navTitle24'), { color: colors.ink }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              text('caption13'),
              { color: colors.muted, fontFamily: fontForText(subtitle, fontFamily.jakarta500, fontFamily.notoSinhala500) },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View style={{ width: 44, height: 44 }} />}
    </View>
  );
}
