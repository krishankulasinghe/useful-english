import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { GroupedList, ListRow, Screen, ScreenTitle, SearchField, SectionLabel, SentenceCard, Toast, TopicRow, useToast } from '../../../src/components';
import { useCategories, useSearch, useTopics } from '../../../src/content/hooks';
import type { Category, Level } from '../../../src/content/types';
import type { IconName } from '../../../src/icons/Icon';
import { useProgressRepo, useSaved } from '../../../src/state/hooks';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

function topicPreview(categories: Category[]): string {
  return categories.map((c) => c.shortEn ?? c.en).join(', ');
}

export default function Sentences() {
  const router = useRouter();
  const { space } = useTheme();
  const [query, setQuery] = useState('');
  const isSearching = query.trim().length > 0;
  const toast = useToast();

  const topics = useTopics('sentences');
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

  const results = useSearch(query, 'sentences');

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[16] }}>
        <View style={{ marginTop: space[12] }}>
          <ScreenTitle title="Useful Sentences" subtitle="ප්‍රයෝජනවත් වාක්‍ය" />
        </View>

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search a sentence or situation"
          accessibilityLabel="Search sentences or situations"
        />

        {isSearching ? (
          <SearchResults
            categories={results.categories}
            sentences={results.sentences}
            query={query}
            onCopied={() => toast.show('Copied')}
          />
        ) : (
          <View style={{ gap: space[10] }}>
            {topics.map((topic, i) => (
              <TopicRow
                key={topic.id}
                en={topic.en}
                si={topic.si}
                preview={topicPreview(categoriesByTopic.get(topic.id) ?? [])}
                icon={topic.icon as IconName}
                variant={i % 2 === 0 ? 'saffron' : 'teal'}
                onPress={() => router.push({ pathname: '/(tabs)/sentences/[topicId]', params: { topicId: topic.id } })}
              />
            ))}
          </View>
        )}
      </Screen>
      <Toast message={toast.message} />
    </View>
  );
}

function SearchResults({
  categories,
  sentences,
  query,
  onCopied,
}: {
  categories: Category[];
  sentences: ReturnType<typeof useSearch>['sentences'];
  query: string;
  onCopied: () => void;
}) {
  const router = useRouter();
  const { colors, space } = useTheme();
  const isEmpty = categories.length === 0 && sentences.length === 0;

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
          <SectionLabel>SITUATIONS</SectionLabel>
          <GroupedList>
            {categories.map((c) => (
              <ListRow
                key={c.id}
                label={c.en}
                sublabel={c.si}
                onPress={() => router.push({ pathname: '/(tabs)/sentences/[topicId]', params: { topicId: c.topicId, categoryId: c.id } })}
              />
            ))}
          </GroupedList>
        </View>
      ) : null}
      {sentences.length > 0 ? (
        <View style={{ gap: space[10] }}>
          <SectionLabel>SENTENCES</SectionLabel>
          <View style={{ gap: space[10] }}>
            {sentences.map((s) => (
              <SentenceSearchCard
                key={s.id}
                id={s.id}
                en={s.en}
                pron={s.pronunciationSi}
                meaning={s.meaningSi}
                level={s.level}
                onCopied={onCopied}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SentenceSearchCard({
  id,
  en,
  pron,
  meaning,
  level,
  onCopied,
}: {
  id: string;
  en: string;
  pron: string;
  meaning: string;
  level: Level;
  onCopied: () => void;
}) {
  const progressRepo = useProgressRepo();
  const savedFromRepo = useSaved('sentence', id);
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);
  const saved = savedOverride ?? savedFromRepo;

  return (
    <SentenceCard
      en={en}
      pron={pron}
      meaning={meaning}
      level={level}
      saved={saved}
      onSave={async () => {
        if (!progressRepo) return;
        const next = await progressRepo.toggleSaved('sentence', id);
        setSavedOverride(next);
      }}
      onCopy={async () => {
        await Clipboard.setStringAsync(en);
        onCopied();
      }}
    />
  );
}
