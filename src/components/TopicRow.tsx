import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { fontForText } from '../theme/scriptFont';
import { useTheme } from '../theme/useTheme';

interface TopicRowProps {
  en: string;
  si: string;
  preview: string;
  icon: IconName;
  variant: 'teal' | 'saffron';
  onPress?: () => void;
}

// 48px tile (radius 15), EN 17/700, SI 14 muted, preview 12.5 muted2 (single-line ellipsis), chevron.
export function TopicRow({ en, si, preview, icon, variant, onPress }: TopicRowProps) {
  const { colors, space, radius } = useTheme();
  const tileBg = variant === 'teal' ? colors.primaryTint : colors.saffronTint;
  const tileFg = variant === 'teal' ? colors.primary : colors.saffron;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius[20],
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingVertical: space[14],
        paddingHorizontal: space[16],
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[14],
      }}
    >
      <View style={{ width: 48, height: 48, borderRadius: radius[15], backgroundColor: tileBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color={tileFg} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }} numberOfLines={1}>
          {en}
        </Text>
        <Text
          style={{ fontFamily: fontForText(si, fontFamily.jakarta400, fontFamily.notoSinhala400), fontSize: 14, color: colors.muted }}
          numberOfLines={1}
        >
          {si}
        </Text>
        <Text
          style={{
            fontFamily: fontForText(preview, fontFamily.jakarta400, fontFamily.notoSinhala400),
            fontSize: 12.5,
            color: colors.muted2,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {preview}
        </Text>
      </View>
      <Icon name="chevron-right" size={22} color={colors.muted} />
    </Pressable>
  );
}
