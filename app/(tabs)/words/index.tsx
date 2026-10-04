import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useSpeech } from '../../../src/audio/useSpeech';
import {
  CategoryCard,
  GroupedList,
  IconButton,
  ListRow,
  Screen,
  ScreenTitle,
  SearchField,
  SectionLabel,
  TopicRow,
  WordRow,
} from '../../../src/components';
import { useCategories, useSearch, useTopics, useWordOfTheDay } from '../../../src/content/hooks';
import type { Category, Level } from '../../../src/content/types';
import type { IconName } from '../../../src/icons/Icon';
import { Icon } from '../../../src/icons/Icon';
import { useSettingsStore } from '../../../src/state/settingsStore';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

const LEVEL_TABS: { id: Level | 'all'; label: string; si: string }[] = [
  { id: 'all', label: 'All Levels', si: 'සියල්ල' },
  { id: 'beginner', label: '🌱 Beginner', si: 'ආරම්භක' },
  { id: 'intermediate', label: '🚀 Intermediate', si: 'මධ්‍යම' },
  { id: 'advanced', label: '⭐ Advanced', si: 'උසස්' },
];

function topicPreview(categories: Category[]): string {
  const names = categories.map((c) => c.shortEn ?? c.en).join(' · ');
  return names;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Words() {
  const router = useRouter();
  const { colors, space, radius, shadows } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | 'all'>('all');
  const isSearching = query.trim().length > 0;

  const topics = useTopics('vocabulary');
  const allCategories = useCategories(undefined);
  const userLevel = useSettingsStore((s) => s.level);

  // Word of the day for spotlight
  const today = useMemo(() => todayKey(), []);
  const spotlightWord = useWordOfTheDay(today, userLevel);
  const { isSpeaking: isSpotlightSpeaking, speak: speakSpotlight } = useSpeech(spotlightWord?.en);

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
      {/* Top Header */}
      <View style={{ marginTop: space[12], flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ScreenTitle title="Vocabulary" subtitle="වචන මාලාව" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.saffronTint,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 14,
          }}
        >
          <Icon name="book" size={15} color={colors.saffron} />
          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, color: colors.saffronDark }}>
            Essential Words
          </Text>
        </View>
      </View>

      {/* Search Field */}
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Search a word, meaning, or category"
        accessibilityLabel="Search words or categories"
      />

      {isSearching ? (
        <SearchResults categories={results.categories} words={results.words} query={query} />
      ) : (
        <>
          {/* Level Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {LEVEL_TABS.map((tab) => {
              const isSelected = selectedLevel === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setSelectedLevel(tab.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    backgroundColor: isSelected ? colors.primaryDark : colors.surface,
                    borderWidth: 1.2,
                    borderColor: isSelected ? colors.primaryDark : colors.cardBorder,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fontFamily.jakarta700,
                      fontSize: 13,
                      color: isSelected ? colors.white : colors.ink,
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Featured Word Spotlight Hero Card */}
          {spotlightWord ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius[24],
                padding: space[18],
                borderWidth: 1.5,
                borderColor: colors.saffronTint,
                gap: space[12],
                ...shadows.hero,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name="sparkles" size={16} color={colors.saffron} />
                  <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.8, color: colors.saffronDark, textTransform: 'uppercase' }}>
                    Word Spotlight · දවසේ වචනය
                  </Text>
                </View>

                <IconButton
                  name="volume-2"
                  size={38}
                  variant="ghost"
                  accessibilityLabel="Listen to word"
                  color={isSpotlightSpeaking ? colors.saffron : colors.primary}
                  onPress={() => speakSpotlight()}
                />
              </View>

              <View style={{ gap: 4 }}>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 32, lineHeight: 36, color: colors.ink }}>
                  {spotlightWord.en}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                  <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 18, color: colors.saffronDark }}>
                    {spotlightWord.pronunciationSi}
                  </Text>
                  <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 18, color: colors.primary }}>
                    · {spotlightWord.meaningSi}
                  </Text>
                </View>
              </View>

              {spotlightWord.example ? (
                <View
                  style={{
                    backgroundColor: colors.bg,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    gap: 3,
                  }}
                >
                  <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.ink }}>
                    "{spotlightWord.example.en}"
                  </Text>
                  <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 12.5, color: colors.muted }}>
                    {spotlightWord.example.meaningSi}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => router.push({ pathname: '/word/[wordId]', params: { wordId: spotlightWord.id } })}
                style={{
                  backgroundColor: colors.saffronTint,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.saffronDark }}>
                  View Full Word Details →
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Practice Cards CTA Banner */}
          <Pressable
            onPress={() => router.push('/(tabs)/practice')}
            style={{
              backgroundColor: colors.primaryTint,
              borderRadius: radius[20],
              padding: space[14],
              borderWidth: 1.2,
              borderColor: colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="cards" size={20} color={colors.white} />
              </View>
              <View>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 15, color: colors.primaryDark }}>
                  Practice with Flashcards
                </Text>
                <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 12, color: colors.ink2 }}>
                  කාඩ්පත් මඟින් වචන මතක තබා ගන්න
                </Text>
              </View>
            </View>
            <Icon name="arrow-right" size={18} color={colors.primaryDark} />
          </Pressable>

          {/* Topics List Header */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: space[4] }}>
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 18, color: colors.ink }}>
              Browse by Topic
            </Text>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.muted }}>
              {topics.length} topics
            </Text>
          </View>

          {/* Topics List with Rich TopicRow Cards */}
          <View style={{ gap: space[12] }}>
            {topics.map((topic, i) => {
              const categories = categoriesByTopic.get(topic.id) ?? [];
              return (
                <TopicRow
                  key={topic.id}
                  en={topic.en}
                  si={topic.si}
                  preview={topicPreview(categories)}
                  icon={topic.icon as IconName}
                  variant={i % 2 === 0 ? 'teal' : 'saffron'}
                  countText={`${categories.length} categories`}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/words/topic/[topicId]',
                      params: { topicId: topic.id },
                    })
                  }
                />
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

function SearchResults({
  categories,
  words,
  query,
}: {
  categories: Category[];
  words: ReturnType<typeof useSearch>['words'];
  query: string;
}) {
  const router = useRouter();
  const { colors, space } = useTheme();
  const isEmpty = categories.length === 0 && words.length === 0;

  if (isEmpty) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: space[32], gap: 8 }}>
        <Icon name="search" size={32} color={colors.muted} />
        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>
          No results for "{query}"
        </Text>
        <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
          Try checking the spelling or searching another word.
        </Text>
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
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/words/category/[categoryId]',
                    params: { categoryId: c.id },
                  })
                }
              />
            ))}
          </GroupedList>
        </View>
      ) : null}

      {words.length > 0 ? (
        <View style={{ gap: space[10] }}>
          <SectionLabel>WORDS ({words.length})</SectionLabel>
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
    </View>
  );
}
