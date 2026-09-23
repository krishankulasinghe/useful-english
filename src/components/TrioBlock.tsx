import { Text, View } from 'react-native';

import { fontFamily } from '../theme/typography';
import { useTheme } from '../theme/useTheme';
import { EnglishText } from './EnglishText';
import { MeaningText } from './MeaningText';
import { PronText } from './PronText';

interface TrioBlockProps {
  en?: string;
  pron?: string;
  meaning?: string;
  /**
   * - `hero`: Home word-of-the-day card (en 46, labeled pron/meaning rows).
   * - `detail`: Word Detail's big word (en 58) — the pronunciation/meaning
   *   panels there use their own tinted backgrounds, built from PronText/
   *   MeaningText directly by the screen, not this block.
   * - `flashcard`: Practice flashcard front (en 52 + pron 22, centered).
   * - `example`: the example sentence card (Home hero, Word Detail, Practice
   *   reveal): bold English with an optional highlight, pron 16, meaning 17.
   */
  variant: 'hero' | 'detail' | 'flashcard' | 'example';
  highlight?: string; // 'example' variant only
}

export function TrioBlock({ en, pron, meaning, variant, highlight }: TrioBlockProps) {
  const { colors, space } = useTheme();

  if (variant === 'detail') {
    return en ? <EnglishText variant="wordDetail" highlight={highlight}>{en}</EnglishText> : null;
  }

  if (variant === 'flashcard') {
    return (
      <View style={{ alignItems: 'center', gap: space[6] }}>
        {en ? (
          <EnglishText variant="flashcard" align="center">
            {en}
          </EnglishText>
        ) : null}
        {pron ? <PronText size={22} weight={600} align="center">{pron}</PronText> : null}
      </View>
    );
  }

  if (variant === 'example') {
    return (
      <View style={{ gap: 2 }}>
        {en ? (
          <EnglishText variant="example20" highlight={highlight}>
            {en}
          </EnglishText>
        ) : null}
        {pron ? <PronText size={16} weight={400}>{pron}</PronText> : null}
        {meaning ? <MeaningText size={17} weight={400}>{meaning}</MeaningText> : null}
      </View>
    );
  }

  // hero
  return (
    <View style={{ gap: 4 }}>
      {en ? <EnglishText variant="wordOfDay">{en}</EnglishText> : null}
      {pron ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[12], marginTop: space[6] }}>
          <Text style={{ width: 76, flexShrink: 0, fontFamily: fontFamily.jakarta400, fontSize: 12, color: colors.muted }}>
            උච්චාරණය
          </Text>
          <PronText size={22} weight={600}>
            {pron}
          </PronText>
        </View>
      ) : null}
      {meaning ? (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[12] }}>
          <Text style={{ width: 76, flexShrink: 0, fontFamily: fontFamily.jakarta400, fontSize: 12, color: colors.muted }}>
            තේරුම
          </Text>
          <MeaningText size={22} weight={600}>
            {meaning}
          </MeaningText>
        </View>
      ) : null}
    </View>
  );
}
