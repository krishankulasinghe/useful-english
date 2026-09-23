import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DarkButton, OutlineButton, PrimaryButton, ProgressBar, Screen, SegmentedControl } from '../../../src/components';
import { preloadPracticeInterstitial, showPracticeInterstitial } from '../../../src/ads/interstitial';
import { useContentContext } from '../../../src/content/ContentProvider';
import type { VocabItem } from '../../../src/content/types';
import { useProgressRepo } from '../../../src/state/hooks';
import { useSettingsStore } from '../../../src/state/settingsStore';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

const FALLBACK_CATEGORY_ID = 'v-verbs';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ResolvedDeck {
  categoryId: string | undefined;
  label: string;
  words: VocabItem[];
}

export default function Practice() {
  const router = useRouter();
  const { colors, space, radius, shadows } = useTheme();
  const { deck: deckParam } = useLocalSearchParams<{ deck?: string }>();
  const { repository, contentRevision } = useContentContext();
  const progressRepo = useProgressRepo();
  const lastCategoryId = useSettingsStore((s) => s.lastCategoryId);
  const direction = useSettingsStore((s) => s.practiceDirection);
  const setDirection = useSettingsStore((s) => s.setPracticeDirection);
  const lastInterstitialAt = useSettingsStore((s) => s.lastInterstitialAt);
  const setLastInterstitialAt = useSettingsStore((s) => s.setLastInterstitialAt);

  const [deck, setDeck] = useState<ResolvedDeck | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    preloadPracticeInterstitial();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!repository) return;
    const repo = repository;

    (async () => {
      async function savedWords(): Promise<VocabItem[]> {
        const saved = (await progressRepo?.listSaved()) ?? [];
        const ids = saved.filter((s) => s.itemType === 'word').map((s) => s.itemId);
        const items = await Promise.all(ids.map((id) => repo.getWord(id)));
        return items.filter((w): w is VocabItem => !!w);
      }

      const paramCategoryId = deckParam?.startsWith('category:') ? deckParam.slice('category:'.length) : undefined;
      const wantsSaved = deckParam === 'saved';

      let categoryId: string | undefined;
      let words: VocabItem[];

      if (paramCategoryId) {
        categoryId = paramCategoryId;
        words = await repo.getWords(categoryId);
      } else if (wantsSaved) {
        words = await savedWords();
      } else if (lastCategoryId) {
        categoryId = lastCategoryId;
        words = await repo.getWords(categoryId);
        if (words.length === 0) {
          categoryId = undefined;
          words = await savedWords();
        }
      } else {
        words = await savedWords();
      }

      if (words.length === 0 && !categoryId && !wantsSaved) {
        categoryId = FALLBACK_CATEGORY_ID;
        words = await repo.getWords(categoryId);
      }

      let label = 'Saved words';
      if (categoryId) {
        const category = await repo.getCategory(categoryId);
        label = category?.en ?? label;
      }

      if (!cancelled) {
        setDeck({ categoryId, label, words });
        setIndex(0);
        setRevealed(false);
        setFinished(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [repository, contentRevision, deckParam, lastCategoryId, progressRepo]);

  const advance = useCallback(() => {
    if (!deck) return;
    progressRepo?.recordActivity(todayKey());
    if (index < deck.words.length - 1) {
      setIndex((i) => i + 1);
      setRevealed(false);
    } else {
      showPracticeInterstitial({
        lastInterstitialAt,
        recordInterstitialShown: setLastInterstitialAt,
        onDismiss: () => setFinished(true),
      });
    }
  }, [deck, index, progressRepo, lastInterstitialAt, setLastInterstitialAt]);

  const handleKnowThis = useCallback(() => {
    const word = deck?.words[index];
    if (word) progressRepo?.markLearned(word.id);
    advance();
  }, [deck, index, progressRepo, advance]);

  const handlePracticeAgain = useCallback(() => {
    setIndex(0);
    setRevealed(false);
    setFinished(false);
  }, []);

  if (!deck) return null;

  const word = deck.words[index];
  const isEnFront = direction === 'en';

  return (
    <Screen style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: space[12], paddingBottom: space[16], gap: space[14] }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, color: colors.ink }}>Practice</Text>
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted }}>පුහුණුව · {deck.label}</Text>
          </View>
          {deck.words.length > 0 ? (
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.ink2 }}>
              {index + 1} of {deck.words.length}
            </Text>
          ) : null}
        </View>

        {deck.words.length > 0 ? <ProgressBar progress={(index + 1) / deck.words.length} /> : null}

        {deck.words.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[8] }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>Nothing to practice yet</Text>
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
              Save some words or browse a category to build a deck.
            </Text>
          </View>
        ) : (
          <>
            <SegmentedControl
              accessibilityLabel="Card direction"
              height={40}
              value={direction}
              onChange={(v) => setDirection(v as 'en' | 'si')}
              options={[
                { value: 'en', label: 'English → සිංහල' },
                { value: 'si', label: 'සිංහල → English' },
              ]}
            />

            {finished ? (
              <View
                accessibilityLiveRegion="polite"
                style={[
                  { flex: 1, backgroundColor: colors.surface, borderRadius: radius[28], padding: space[24], justifyContent: 'center', alignItems: 'center', gap: space[14] },
                  shadows.flashcard,
                ]}
              >
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, color: colors.ink, textAlign: 'center' }}>Deck complete!</Text>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.muted, textAlign: 'center' }}>
                  You practiced {deck.words.length} {deck.words.length === 1 ? 'word' : 'words'}.
                </Text>
                <DarkButton label="Practice again" icon="cards" onPress={handlePracticeAgain} fullWidth={false} />
              </View>
            ) : (
              <View
                accessibilityLiveRegion="polite"
                style={[
                  { flex: 1, backgroundColor: colors.surface, borderRadius: radius[28], padding: space[24], justifyContent: 'center', gap: space[14] },
                  shadows.flashcard,
                ]}
              >
                {isEnFront ? (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 52, lineHeight: 55, letterSpacing: -0.4, color: colors.ink, textAlign: 'center' }}>
                      {word.en}
                    </Text>
                    <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 22, color: colors.saffron, textAlign: 'center' }}>
                      {word.pronunciationSi}
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.muted }}>
                      WHAT IS THIS IN ENGLISH?
                    </Text>
                    <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 34, lineHeight: 48, color: colors.primary, textAlign: 'center' }}>
                      {word.meaningSi}
                    </Text>
                  </View>
                )}

                {revealed ? (
                  <View style={{ gap: space[12] }}>
                    <View style={{ height: 1, backgroundColor: colors.cardBorder }} />
                    {isEnFront ? (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.6, color: colors.muted }}>
                          තේරුම · MEANING
                        </Text>
                        <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 28, lineHeight: 41, color: colors.primary, textAlign: 'center' }}>
                          {word.meaningSi}
                        </Text>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 40, lineHeight: 44, color: colors.ink, textAlign: 'center' }}>
                          {word.en}
                        </Text>
                        <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 20, color: colors.saffron, textAlign: 'center' }}>
                          {word.pronunciationSi}
                        </Text>
                      </View>
                    )}
                    <View style={{ backgroundColor: colors.bg, borderRadius: radius[16], paddingVertical: 12, paddingHorizontal: 14, gap: 2 }}>
                      <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>{word.example.en}</Text>
                      <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.saffron }}>{word.example.pronunciationSi}</Text>
                      <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 15, color: colors.primary }}>{word.example.meaningSi}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            {!finished ? (
              revealed ? (
                <View style={{ flexDirection: 'row', gap: space[10] }}>
                  <View style={{ flex: 1 }}>
                    <OutlineButton label="Still learning" tone="muted" height={56} onPress={advance} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <PrimaryButton label="I know this" height={56} onPress={handleKnowThis} />
                  </View>
                </View>
              ) : (
                <PrimaryButton
                  label={isEnFront ? 'Show meaning · තේරුම බලන්න' : 'Show English · ඉංග්‍රීසි බලන්න'}
                  height={56}
                  onPress={() => setRevealed(true)}
                />
              )
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}
