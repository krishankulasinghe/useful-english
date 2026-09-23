import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { NavHeader, Screen, SectionLabel, SentenceCard, Toast, WordRow, useToast } from '../../../src/components';
import { useContentContext } from '../../../src/content/ContentProvider';
import type { SentenceItem, VocabItem } from '../../../src/content/types';
import { useLearned, useProgressRepo } from '../../../src/state/hooks';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

export default function Saved() {
  const router = useRouter();
  const { colors, space } = useTheme();
  const { repository } = useContentContext();
  const progressRepo = useProgressRepo();

  const [words, setWords] = useState<VocabItem[]>([]);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [loaded, setLoaded] = useState(false);
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

  const isEmpty = loaded && words.length === 0 && sentences.length === 0;

  return (
    <View style={{ flex: 1 }}>
    <Screen scroll padded={false} contentContainerStyle={{ paddingBottom: space[32] }}>
      <NavHeader title="Saved" subtitle="සුරැකි" backLabel="Back to settings" onBack={() => router.back()} />

      <View style={{ paddingHorizontal: space[20], gap: space[20] }}>
        {isEmpty ? (
          <View style={{ alignItems: 'center', paddingVertical: space[32], gap: space[8] }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>Nothing saved yet</Text>
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
              Tap the bookmark on a word or sentence to save it here.
            </Text>
          </View>
        ) : (
          <>
            {words.length > 0 ? (
              <View style={{ gap: space[10] }}>
                <SectionLabel>WORDS</SectionLabel>
                <View style={{ gap: space[10] }}>
                  {words.map((word) => (
                    <SavedWordRow key={word.id} word={word} onPress={() => router.push({ pathname: '/word/[wordId]', params: { wordId: word.id } })} />
                  ))}
                </View>
              </View>
            ) : null}

            {sentences.length > 0 ? (
              <View style={{ gap: space[10] }}>
                <SectionLabel>SENTENCES</SectionLabel>
                <View style={{ gap: space[10] }}>
                  {sentences.map((sentence) => (
                    <SavedSentenceCard
                      key={sentence.id}
                      sentence={sentence}
                      onUnsaved={load}
                      onCopied={() => toast.show('Copied')}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </View>
    </Screen>
    <Toast message={toast.message} />
    </View>
  );
}

function SavedWordRow({ word, onPress }: { word: VocabItem; onPress: () => void }) {
  const learned = useLearned(word.id);
  return <WordRow en={word.en} pron={word.pronunciationSi} meaning={word.meaningSi} learned={learned} onPress={onPress} />;
}

function SavedSentenceCard({
  sentence,
  onUnsaved,
  onCopied,
}: {
  sentence: SentenceItem;
  onUnsaved: () => void;
  onCopied: () => void;
}) {
  const progressRepo = useProgressRepo();
  return (
    <SentenceCard
      en={sentence.en}
      pron={sentence.pronunciationSi}
      meaning={sentence.meaningSi}
      level={sentence.level}
      saved
      onSave={async () => {
        await progressRepo?.toggleSaved('sentence', sentence.id);
        onUnsaved();
      }}
      onCopy={async () => {
        await Clipboard.setStringAsync(sentence.en);
        onCopied();
      }}
    />
  );
}
