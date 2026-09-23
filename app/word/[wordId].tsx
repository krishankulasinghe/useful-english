import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormChip, HeroCard, IconButton, ListenSlot, OutlineButton, PosChip, PrimaryButton, PronText, MeaningText, TrioBlock } from '../../src/components';
import { useCategory, useWord, useWords } from '../../src/content/hooks';
import { partOfSpeechLabel } from '../../src/i18n/partsOfSpeech';
import { useProgressRepo, useSaved } from '../../src/state/hooks';
import { useSettingsStore } from '../../src/state/settingsStore';
import { fontFamily } from '../../src/theme/typography';
import { useTheme } from '../../src/theme/useTheme';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function WordDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, space, radius } = useTheme();
  const { wordId, categoryId: categoryIdParam } = useLocalSearchParams<{ wordId: string; categoryId?: string }>();
  const progressRepo = useProgressRepo();

  const word = useWord(wordId);
  const categoryId = categoryIdParam ?? word?.categoryIds[0];
  const category = useCategory(categoryId);
  const words = useWords(categoryId);

  const showPronunciation = useSettingsStore((s) => s.showPronunciation);
  const showMeaning = useSettingsStore((s) => s.showMeaning);

  const savedFromRepo = useSaved('word', wordId);
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);
  useEffect(() => setSavedOverride(undefined), [wordId]);
  const saved = savedOverride ?? savedFromRepo;

  const nextWord = useMemo(() => {
    if (!word) return undefined;
    const index = words.findIndex((w) => w.id === word.id);
    return index >= 0 && index < words.length - 1 ? words[index + 1] : undefined;
  }, [words, word]);

  const handleMarkLearned = useCallback(() => {
    if (!wordId) return;
    progressRepo?.markLearned(wordId);
  }, [progressRepo, wordId]);

  const handleToggleSave = useCallback(async () => {
    if (!wordId || !progressRepo) return;
    const next = await progressRepo.toggleSaved('word', wordId);
    setSavedOverride(next);
  }, [progressRepo, wordId]);

  const handleNextWord = useCallback(() => {
    if (!nextWord) return;
    progressRepo?.recordActivity(todayKey());
    router.replace({ pathname: '/word/[wordId]', params: { wordId: nextWord.id, categoryId } });
  }, [nextWord, categoryId, progressRepo, router]);

  if (!word) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          paddingTop: insets.top + space[12],
          paddingHorizontal: space[16],
          paddingBottom: space[4],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <IconButton name="chevron-left" accessibilityLabel={`Back to ${category?.en ?? 'category'}`} onPress={() => router.back()} iconSize={22} strokeWidth={1.9} />
        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 14, color: colors.muted }}>
          {category ? `${category.en} · ${category.si}` : ''}
        </Text>
        <IconButton
          name="bookmark"
          accessibilityLabel={saved ? 'Unsave word' : 'Save word'}
          color={saved ? colors.primary : colors.ink}
          filled={saved}
          onPress={handleToggleSave}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: space[20], gap: space[14] }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[12] }}>
          <View style={{ gap: space[8] }}>
            <TrioBlock variant="detail" en={word.en} />
            {word.partOfSpeech ? <PosChip label={partOfSpeechLabel(word.partOfSpeech)} /> : null}
          </View>
          <ListenSlot variant="word" audioUrl={word.audioUrl} />
        </View>

        <View style={{ gap: space[10] }}>
          {showPronunciation ? (
            <View style={{ backgroundColor: colors.saffronTint, borderRadius: radius[20], paddingVertical: 14, paddingHorizontal: 18, gap: 2 }}>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.saffronDark }}>
                උච්චාරණය · PRONUNCIATION
              </Text>
              <PronText size={30} weight={600}>
                {word.pronunciationSi}
              </PronText>
            </View>
          ) : null}
          {showMeaning ? (
            <View style={{ backgroundColor: colors.primaryTint, borderRadius: radius[20], paddingVertical: 14, paddingHorizontal: 18, gap: 2 }}>
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.primaryDark }}>
                තේරුම · MEANING
              </Text>
              <MeaningText size={28} weight={600}>
                {word.meaningSi}
              </MeaningText>
            </View>
          ) : null}
        </View>

        <HeroCard radius={20} padding={space[16]} style={{ gap: space[8] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.muted }}>
              උදාහරණය · EXAMPLE
            </Text>
            <ListenSlot variant="example" audioUrl={word.audioUrl} />
          </View>
          <TrioBlock
            variant="example"
            en={word.example.en}
            pron={word.example.pronunciationSi}
            meaning={word.example.meaningSi}
            highlight={word.example.highlight}
          />
        </HeroCard>

        {word.forms && word.forms.length > 0 ? (
          <View style={{ gap: space[8] }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.muted }}>
              FORMS · ක්‍රියා රූප
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
              {word.forms.map((form, i) => (
                <FormChip key={`${form}-${i}`} label={form} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: space[10],
          paddingHorizontal: space[20],
          paddingTop: space[12],
          paddingBottom: insets.bottom + space[16],
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        <OutlineButton label="I know it" icon="check" height={54} onPress={handleMarkLearned} />
        <PrimaryButton label="Next word" icon="arrow-right" height={54} onPress={handleNextWord} disabled={!nextWord} />
      </View>
    </View>
  );
}
