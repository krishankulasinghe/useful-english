import { Pressable, View } from 'react-native';

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

// Fraunces 23 word + pron 15/600 saffron inline, meaning 16 teal below, learned check (28) or chevron. Min height 78.
export function WordRow({ en, pron, meaning, learned, onPress }: WordRowProps) {
  const { colors, space, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
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
