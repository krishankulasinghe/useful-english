import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DarkButton, IconButton, NavHeader, Screen, SearchField, WordRow } from '../../../../src/components';
import { normalizeSearchText } from '../../../../src/content/normalize';
import { useCategory, useWords } from '../../../../src/content/hooks';
import { useLearned } from '../../../../src/state/hooks';
import { useSettingsStore } from '../../../../src/state/settingsStore';
import { fontFamily } from '../../../../src/theme/typography';
import { useTheme } from '../../../../src/theme/useTheme';

export default function WordsCategory() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { colors, space } = useTheme();
  const setLastCategoryId = useSettingsStore((s) => s.setLastCategoryId);

  const category = useCategory(categoryId);
  const words = useWords(categoryId);

  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (categoryId) setLastCategoryId(categoryId);
  }, [categoryId, setLastCategoryId]);

  const filteredWords = useMemo(() => {
    const q = normalizeSearchText(query);
    if (!q) return words;
    return words.filter((w) => normalizeSearchText(w.en, w.pronunciationSi, w.meaningSi).includes(q));
  }, [words, query]);

  return (
    <Screen padded={false} style={{ flex: 1 }}>
      <NavHeader
        title={category?.en ?? ''}
        subtitle={category?.si}
        backLabel="Back to categories"
        onBack={() => router.back()}
        right={
          <IconButton
            name="search"
            accessibilityLabel={`Search ${category?.en ?? 'words'}`}
            onPress={() => setFilterOpen((v) => !v)}
          />
        }
      />

      {words.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[8], paddingHorizontal: space[20] }}>
          <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>No words yet</Text>
          <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
            This category doesn't have any words yet.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: space[20], paddingTop: space[8], gap: space[10] }}
            showsVerticalScrollIndicator={false}
          >
            {filterOpen ? (
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder={`Search ${category?.en ?? 'words'}`}
                accessibilityLabel={`Search ${category?.en ?? 'words'}`}
              />
            ) : null}
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted }}>
              Tap a word to learn it · වචනයක් තෝරන්න
            </Text>
            {filteredWords.map((word) => (
              <WordListRow key={word.id} id={word.id} en={word.en} pron={word.pronunciationSi} meaning={word.meaningSi} categoryId={categoryId} />
            ))}
          </ScrollView>
          <View style={{ paddingHorizontal: space[20], paddingTop: space[10], paddingBottom: space[16] }}>
            <DarkButton
              label="Practice these words"
              icon="cards"
              onPress={() => router.push({ pathname: '/(tabs)/practice', params: { deck: `category:${categoryId}` } })}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function WordListRow({ id, en, pron, meaning, categoryId }: { id: string; en: string; pron: string; meaning: string; categoryId?: string }) {
  const router = useRouter();
  const learned = useLearned(id);
  return (
    <WordRow
      en={en}
      pron={pron}
      meaning={meaning}
      learned={learned}
      onPress={() => router.push({ pathname: '/word/[wordId]', params: { wordId: id, categoryId } })}
    />
  );
}
