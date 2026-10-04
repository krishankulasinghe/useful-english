import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import {
  IconButton,
  PrimaryButton,
  Screen,
  ScreenTitle,
  SectionLabel,
  SentenceCard,
  Toast,
  WordRow,
  useToast,
} from '../../../src/components';
import { useContentContext } from '../../../src/content/ContentProvider';
import type { SentenceItem, VocabItem } from '../../../src/content/types';
import { Icon } from '../../../src/icons/Icon';
import { useProgressRepo } from '../../../src/state/hooks';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

type FilterType = 'all' | 'sentences' | 'words';

export default function SavedTab() {
  const router = useRouter();
  const { colors, space, radius, shadows } = useTheme();
  const { repository } = useContentContext();
  const progressRepo = useProgressRepo();

  const [words, setWords] = useState<VocabItem[]>([]);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const toast = useToast();

  const load = useCallback(async () => {
    if (!repository || !progressRepo) return;
    const saved = await progressRepo.listSaved();
    const wordIds = saved.filter((s) => s.itemType === 'word').map((s) => s.itemId);
    const sentenceIds = new Set(saved.filter((s) => s.itemType === 'sentence').map((s) => s.itemId));

    const [loadedWords, allSentences] = await Promise.all([
      Promise.all(wordIds.map((id) => repository.getWord(id))),
      repository.getAllSentences(),
    ]);

    setWords(loadedWords.filter((w): w is VocabItem => !!w));
    setSentences(allSentences.filter((s) => sentenceIds.has(s.id)));
    setLoaded(true);
  }, [repository, progressRepo]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const totalCount = words.length + sentences.length;
  const isEmpty = loaded && totalCount === 0;

  const showWords = (filterType === 'all' || filterType === 'words') && words.length > 0;
  const showSentences = (filterType === 'all' || filterType === 'sentences') && sentences.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[16] }}>
        {/* Top Header */}
        <View style={{ marginTop: space[12], flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <ScreenTitle title="My Saved" subtitle="සුරැකි සටහන්" />
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted, marginTop: 2 }}>
              {totalCount} {totalCount === 1 ? 'item' : 'items'} saved for quick practice
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="settings" size={20} color={colors.ink} strokeWidth={1.8} />
          </Pressable>
        </View>

        {isEmpty ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius[24],
              padding: space[28],
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.cardBorder,
              gap: space[14],
              marginTop: space[20],
              ...shadows.hero,
            }}
          >
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                backgroundColor: colors.saffronTint,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="bookmark" size={32} color={colors.saffron} />
            </View>

            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 22, color: colors.ink, textAlign: 'center' }}>
                Your Notebook is Empty
              </Text>
              <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 16, color: colors.primary, textAlign: 'center' }}>
                තාම කිසිවක් සුරැකී නැත
              </Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center', maxWidth: 280, marginTop: 4 }}>
                Tap the bookmark icon on any sentence or word in Explore or Home to save it here for quick practice.
              </Text>
            </View>

            <PrimaryButton
              label="Explore Sentences · වාක්‍ය බලන්න"
              height={48}
              onPress={() => router.push('/(tabs)/sentences')}
            />
          </View>
        ) : (
          <>
            {/* Filter Chips */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(
                [
                  { id: 'all', label: `All (${totalCount})` },
                  { id: 'sentences', label: `Sentences (${sentences.length})` },
                  { id: 'words', label: `Words (${words.length})` },
                ] as const
              ).map((chip) => {
                const isSelected = filterType === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => setFilterType(chip.id)}
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 14,
                      borderRadius: 16,
                      backgroundColor: isSelected ? colors.primaryDark : colors.surface,
                      borderWidth: 1,
                      borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.jakarta700,
                        fontSize: 12.5,
                        color: isSelected ? colors.white : colors.ink,
                      }}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Practice Saved Sentences Action Banner */}
            {sentences.length > 0 ? (
              <Pressable
                onPress={() => router.push('/practice/workout?mode=saved')}
                accessibilityRole="button"
                accessibilityLabel="Practice saved sentences with workout gym"
                style={{
                  backgroundColor: colors.primaryTint,
                  borderRadius: radius[20],
                  padding: space[16],
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...shadows.hero,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="cards" size={22} color={colors.white} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 16, color: colors.primaryDark }}>
                      Practice Saved Sentences
                    </Text>
                    <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.ink2 }}>
                      සුරැකි වාක්‍ය කතා පුහුණු වන්න
                    </Text>
                  </View>
                </View>
                <Icon name="arrow-right" size={20} color={colors.primaryDark} />
              </Pressable>
            ) : null}

            {/* Saved Sentences List */}
            {showSentences ? (
              <View style={{ gap: space[10] }}>
                <SectionLabel>SAVED SENTENCES ({sentences.length})</SectionLabel>
                <View style={{ gap: space[10] }}>
                  {sentences.map((s) => (
                    <SentenceCard
                      key={s.id}
                      en={s.en}
                      pron={s.pronunciationSi}
                      meaning={s.meaningSi}
                      level={s.level}
                      saved={true}
                      onSave={async () => {
                        await progressRepo?.toggleSaved('sentence', s.id);
                        load();
                      }}
                      onCopy={async () => {
                        await Clipboard.setStringAsync(`${s.en} - ${s.meaningSi}`);
                        toast.show('Copied');
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Saved Words List */}
            {showWords ? (
              <View style={{ gap: space[10] }}>
                <SectionLabel>SAVED WORDS ({words.length})</SectionLabel>
                <View style={{ gap: space[8] }}>
                  {words.map((w) => (
                    <WordRow
                      key={w.id}
                      en={w.en}
                      pron={w.pronunciationSi}
                      meaning={w.meaningSi}
                      learned={false}
                      onPress={() => router.push({ pathname: '/word/[wordId]', params: { wordId: w.id } })}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </Screen>
      <Toast message={toast.message} />
    </View>
  );
}
