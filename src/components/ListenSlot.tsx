import { Pressable, Text, View } from 'react-native';

import { useSpeech } from '../audio/useSpeech';
import { Icon } from '../icons/Icon';
import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';

interface ListenSlotProps {
  audioUrl?: string;
  text?: string;
  variant?: 'word' | 'example';
}

export function ListenSlot({ text, variant = 'word' }: ListenSlotProps) {
  const { colors, radius } = useTheme();
  const { isSpeaking, speak } = useSpeech(text);

  if (!text) return null;

  return (
    <Pressable
      onPress={() => speak()}
      accessibilityRole="button"
      accessibilityLabel={`Listen to pronunciation for ${text}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: variant === 'word' ? 8 : 6,
        paddingHorizontal: variant === 'word' ? 14 : 10,
        borderRadius: radius[16],
        backgroundColor: isSpeaking ? colors.saffron : colors.primaryTint,
        borderWidth: 1,
        borderColor: isSpeaking ? colors.saffronDark : colors.primary,
      }}
    >
      <Icon name="volume-2" size={variant === 'word' ? 18 : 16} color={isSpeaking ? colors.white : colors.primary} />
      <Text
        style={{
          fontFamily: fontFamily.jakarta700,
          fontSize: variant === 'word' ? 13 : 12,
          color: isSpeaking ? colors.white : colors.primaryDark,
        }}
      >
        {isSpeaking ? 'Playing' : 'Listen'}
      </Text>
    </Pressable>
  );
}
