import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GroupedList, ListRow, Screen, ScreenTitle, SearchField, SectionLabel, TopicRow, WordRow } from '../../../src/components';
import { useCategories, useSearch, useTopics } from '../../../src/content/hooks';
import type { Category } from '../../../src/content/types';
import type { IconName } from '../../../src/icons/Icon';
import { useLearned } from '../../../src/state/hooks';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

function topicPreview(categories: Category[]): string {
  const names = categories.map((c) => c.shortEn ?? c.en).join(', ');
  return `${categories.length} · ${names}`;
}

export default function Words() {
  const router = useRouter();
  const { colors, space } = useTheme();
  const [query, setQuery] = useState('');
  const isSearching = query.trim().length > 0;

  const topics = useTopics('vocabulary');
  const allCategories = useCategories(undefined);
  const categoriesByTopic = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const category of allCategories) {
      const list = map.get(category.topicId) ?? [];
      list.push(category);
      map.set(category.topicId, list);
    }
    return map;
  }, [allCategories]);

  const results = useSearch(query, 'vocabulary');

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[16] }}>
      <View style={{ marginTop: space[12] }}>
        <ScreenTitle title="Vocabulary" subtitle="වචන මාලාව" />
      </View>

      <SearchField value={query} onChangeText={setQuery} placeholder="Search a word or category" accessibilityLabel="Search words or categories" />

      {isSearching ? (
        <SearchResults categories={results.categories} words={results.words} query={query} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: space[4] }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 18, color: colors.ink }}>Browse by topic</Text>
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>මාතෘකා අනුව</Text>
          </View>

          <View style={{ gap: space[10] }}>
            {topics.map((topic, i) => (
              <TopicRow
                key={topic.id}
                en={topic.en}
                si={topic.si}
                preview={topicPreview(categoriesByTopic.get(topic.id) ?? [])}
                icon={topic.icon as IconName}
                variant={i % 2 === 0 ? 'teal' : 'saffron'}
                onPress={() => router.push({ pathname: '/(tabs)/words/topic/[topicId]', params: { topicId: topic.id } })}
              />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function SearchResults({ categories, words, query }: { categories: Category[]; words: ReturnType<typeof useSearch>['words']; query: string }) {
  const router = useRouter();
  const { colors, space } = useTheme();
  const isEmpty = categories.length === 0 && words.length === 0;

  if (isEmpty) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: space[32] }}>
        <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 15, color: colors.muted }}>No results for "{query}"</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: space[16] }}>
      {categories.length > 0 ? (
        <View style={{ gap: space[10] }}>
          <SectionLabel>CATEGORIES</SectionLabel>
          <GroupedList>
            {categories.map((c) => (
              <ListRow
                key={c.id}
                label={c.en}
                sublabel={c.si}
                onPress={() => router.push({ pathname: '/(tabs)/words/category/[categoryId]', params: { categoryId: c.id } })}
              />
            ))}
          </GroupedList>
        </View>
      ) : null}
      {words.length > 0 ? (
        <View style={{ gap: space[10] }}>
          <SectionLabel>WORDS</SectionLabel>
          <View style={{ gap: space[10] }}>
            {words.map((w) => (
              <WordSearchRow key={w.id} id={w.id} en={w.en} pron={w.pronunciationSi} meaning={w.meaningSi} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function WordSearchRow({ id, en, pron, meaning }: { id: string; en: string; pron: string; meaning: string }) {
  const router = useRouter();
  const learned = useLearned(id);
  return (
    <WordRow
      en={en}
      pron={pron}
      meaning={meaning}
      learned={learned}
      onPress={() => router.push({ pathname: '/word/[wordId]', params: { wordId: id } })}
    />
  );
}
