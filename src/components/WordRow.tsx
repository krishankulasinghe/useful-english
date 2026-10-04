import { Pressable, View } from 'react-native';

import { useSpeech } from '../audio/useSpeech';
import { Icon } from '../icons/Icon';
import { useTheme } from '../theme/useTheme';
import { EnglishText } from './EnglishText';
import { MeaningText } from './MeaningText';
import { PronText } from './PronText';

interface WordRowProps {
  en: string;
  pron: string;
  meaning: string;
  learned: boolean;
  onPress?: () => void;
}

export function WordRow({ en, pron, meaning, learned, onPress }: WordRowProps) {
  const { colors, space, radius } = useTheme();
  const { isSpeaking, speak } = useSpeech(en);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${en}, ${pron}, ${meaning}`}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius[18],
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingVertical: space[12],
        paddingHorizontal: space[16],
        minHeight: 78,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space[12],
      }}
    >
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          speak();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Listen to ${en}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isSpeaking ? colors.saffron : colors.primaryTint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="volume-2" size={17} color={isSpeaking ? colors.white : colors.primary} />
      </Pressable>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[10] }}>
          <EnglishText variant="listWord">{en}</EnglishText>
          <PronText size={15} weight={600}>
            {pron}
          </PronText>
        </View>
        <MeaningText size={16} weight={400}>
          {meaning}
        </MeaningText>
      </View>

      {learned ? (
        <View
          accessibilityLabel="Learned"
          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="check" size={16} color={colors.primary} strokeWidth={2.4} />
        </View>
      ) : (
        <Icon name="chevron-right" size={22} color={colors.muted} />
      )}
    </Pressable>
  );
}
