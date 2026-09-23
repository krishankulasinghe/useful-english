import { View } from 'react-native';

import type { Level } from '../content/types';
import { useTheme } from '../theme/useTheme';
import { Card } from './Card';
import { EnglishText } from './EnglishText';
import { IconButton } from './IconButton';
import { LevelChip } from './LevelChip';
import { MeaningText } from './MeaningText';
import { PronText } from './PronText';

interface SentenceCardProps {
  en: string;
  pron: string;
  meaning: string;
  level: Level;
  saved: boolean;
  onSave?: () => void;
  onCopy?: () => void;
}

// Level chip + save/copy (44px ghost icon buttons), EN 20/700, pron 16, meaning 17.
export function SentenceCard({ en, pron, meaning, level, saved, onSave, onCopy }: SentenceCardProps) {
  const { colors, space } = useTheme();
  return (
    <Card padding={space[16]} style={{ borderRadius: 20, gap: space[8] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <LevelChip level={level} />
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <IconButton
            name="bookmark"
            variant="ghost"
            accessibilityLabel={saved ? 'Remove saved sentence' : 'Save sentence'}
            color={saved ? colors.primary : colors.muted}
            filled={saved}
            onPress={onSave}
          />
          <IconButton name="copy" variant="ghost" accessibilityLabel="Copy sentence" color={colors.muted} onPress={onCopy} />
        </View>
      </View>
      <EnglishText variant="example20">{en}</EnglishText>
      <View style={{ gap: 2 }}>
        <PronText size={16} weight={400}>
          {pron}
        </PronText>
        <MeaningText size={17} weight={400}>
          {meaning}
        </MeaningText>
      </View>
    </Card>
  );
}
