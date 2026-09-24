import React, { useEffect, useState } from 'react';
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
  showPronunciation?: boolean;
}

// Level chip + eye/bookmark/copy (44px ghost icon buttons), EN 20/700, optional pron 16, meaning 17.
export function SentenceCard({
  en,
  pron,
  meaning,
  level,
  saved,
  onSave,
  onCopy,
  showPronunciation = false,
}: SentenceCardProps) {
  const { colors, space } = useTheme();
  const [localShowPron, setLocalShowPron] = useState<boolean | null>(null);

  useEffect(() => {
    setLocalShowPron(null);
  }, [showPronunciation]);

  const isPronVisible = localShowPron !== null ? localShowPron : showPronunciation;

  return (
    <Card padding={space[16]} style={{ borderRadius: 20, gap: space[8] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <LevelChip level={level} />
        <View style={{ flexDirection: 'row', gap: 2 }}>
          <IconButton
            name={isPronVisible ? 'eye' : 'eye-off'}
            variant="ghost"
            accessibilityLabel={isPronVisible ? 'Hide pronunciation' : 'Show pronunciation'}
            color={isPronVisible ? colors.primary : colors.muted}
            onPress={() => setLocalShowPron(!isPronVisible)}
          />
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
        {isPronVisible ? (
          <PronText size={16} weight={400}>
            {pron}
          </PronText>
        ) : null}
        <MeaningText size={17} weight={400}>
          {meaning}
        </MeaningText>
      </View>
    </Card>
  );
}
