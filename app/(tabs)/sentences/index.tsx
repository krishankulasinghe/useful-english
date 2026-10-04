import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { useSpeech } from '../../../src/audio/useSpeech';
import {
  GroupedList,
  IconButton,
  ListRow,
  Screen,
  ScreenTitle,
  SearchField,
  SectionLabel,
  SentenceCard,
  Toast,
  TopicRow,
  useToast,
} from '../../../src/components';
import { useCategories, useSearch, useTopics } from '../../../src/content/hooks';
import type { Category, SentenceItem } from '../../../src/content/types';
import type { IconName } from '../../../src/icons/Icon';
import { Icon } from '../../../src/icons/Icon';
import { useSettingsStore } from '../../../src/state/settingsStore';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

const FILTER_PILLS = [
  { id: 'all', label: 'All Topics', si: 'සියල්ල' },
  { id: 'work', label: '💼 Workplace & Office', si: 'රැකියාව', topicId: 's-work-study' },
  { id: 'errands', label: '🛒 Errands & Services', si: 'පිටතදී', topicId: 's-services-help' },
  { id: 'daily', label: '🗣️ Daily Basics', si: 'මූලික කතාබහ', topicId: 's-everyday-basics' },
  { id: 'out', label: '✈️ Out & Travel', si: 'සංචාරය', topicId: 's-out-about' },
  { id: 'asking', label: '❓ Asking & Requests', si: 'ප්‍රශ්න ඇසීම', topicId: 's-asking-responding' },
  { id: 'social', label: '🏠 Home & Social', si: 'නිවස සහ සමාජය', topicId: 's-home-social' },
];

const SPOTLIGHT_SENTENCE: SentenceItem = {
  id: 'spotlight-sentence',
  categoryId: 's-work-office',
  en: 'Could you give me a few minutes to look into this?',
  pronunciationSi: 'කුඩ් යූ ගිව් මී අ ෆිව් මිනිට්ස් ට ලුක් ඉන්ටු දිස්?',
  meaningSi: 'මේ ගැන හොයලා බලන්න මට විනාඩි කිහිපයක් දෙන්න පුළුවන්ද?',
  level: 'intermediate',
};

function topicPreview(categories: Category[]): string {
  return categories.map((c) => c.shortEn ?? c.en).join(' · ');
}

export default function Sentences() {
  const router = useRouter();
  const { colors, space, radius, shadows } = useTheme();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
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

  // Filter topics based on active filter pill
  const filteredTopics = useMemo(() => {
    if (activeFilter === 'all') return topics;
    const pill = FILTER_PILLS.find((p) => p.id === activeFilter);
    if (!pill?.topicId) return topics;
    return topics.filter((t) => t.id === pill.topicId);
  }, [topics, activeFilter]);

  const results = useSearch(query, 'sentences');

  // Spotlight speech
  const { isSpeaking: isSpotlightSpeaking, speak: speakSpotlight } = useSpeech(SPOTLIGHT_SENTENCE.en);

  return (
    <View style={{ flex: 1 }}>
      <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[16] }}>
        {/* Header with stats badge */}
        <View style={{ marginTop: space[12], flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <ScreenTitle title="Useful Sentences" subtitle="ප්‍රයෝජනවත් වාක්‍ය" />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.primaryTint,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 14,
            }}
          >
            <Icon name="message" size={15} color={colors.primary} />
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, color: colors.primaryDark }}>
              5,600+ Sentences
            </Text>
          </View>
        </View>

        {/* Search Field */}
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search a sentence, situation, or keyword"
          accessibilityLabel="Search sentences or situations"
        />

        {isSearching ? (
          <SearchResults
            categories={results.categories}
            sentences={results.sentences}
            query={query}
            onCopied={() => toast.show('Copied to clipboard')}
          />
        ) : (
          <>
            {/* Filter Pills Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {FILTER_PILLS.map((pill) => {
                const isSelected = activeFilter === pill.id;
                return (
                  <Pressable
                    key={pill.id}
                    onPress={() => setActiveFilter(pill.id)}
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
                      {pill.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fontFamily.notoSinhala600,
                        fontSize: 11,
                        color: isSelected ? colors.splashText : colors.muted,
                      }}
                    >
                      {pill.si}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Featured Spoken Sentence Spotlight Card */}
            {activeFilter === 'all' ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radius[24],
                  padding: space[18],
                  borderWidth: 1.5,
                  borderColor: colors.primaryTint,
                  gap: space[12],
                  ...shadows.hero,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon name="sparkles" size={16} color={colors.primary} />
                    <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 12, letterSpacing: 0.8, color: colors.primary, textTransform: 'uppercase' }}>
                      Spoken Spotlight · විශේෂ වාක්‍යය
                    </Text>
                  </View>
                  <IconButton
                    name="volume-2"
                    size={38}
                    variant="ghost"
                    accessibilityLabel="Listen to spotlight sentence"
                    color={isSpotlightSpeaking ? colors.saffron : colors.primary}
                    onPress={() => speakSpotlight()}
                  />
                </View>

                <View style={{ gap: 6 }}>
                  <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 20, lineHeight: 26, color: colors.ink }}>
                    "{SPOTLIGHT_SENTENCE.en}"
                  </Text>
                  <Text style={{ fontFamily: fontFamily.notoSinhala600, fontSize: 15, color: colors.saffronDark }}>
                    {SPOTLIGHT_SENTENCE.pronunciationSi}
                  </Text>
                  <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.ink2 }}>
                    {SPOTLIGHT_SENTENCE.meaningSi}
                  </Text>
                </View>

                <Pressable
                  onPress={() => router.push('/practice/workout')}
                  style={{
                    backgroundColor: colors.primaryTint,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <Icon name="cards" size={16} color={colors.primaryDark} />
                  <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 13, color: colors.primaryDark }}>
                    Practice Daily Sentences with Cards →
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Topics List */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }}>
                  {activeFilter === 'all' ? 'Browse Topics' : 'Selected Topics'}
                </Text>
                <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 12, color: colors.muted }}>
                  {filteredTopics.length} {filteredTopics.length === 1 ? 'topic' : 'topics'}
                </Text>
              </View>

              <View style={{ gap: space[12] }}>
                {filteredTopics.map((topic, i) => {
                  const categories = categoriesByTopic.get(topic.id) ?? [];
                  return (
                    <TopicRow
                      key={topic.id}
                      en={topic.en}
                      si={topic.si}
                      preview={topicPreview(categories)}
                      icon={topic.icon as IconName}
                      variant={i % 2 === 0 ? 'teal' : 'saffron'}
                      countText={`${categories.length} situations`}
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/sentences/[topicId]',
                          params: { topicId: topic.id },
                        })
                      }
                    />
                  );
                })}
              </View>
            </View>
          </>
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
      <View style={{ alignItems: 'center', paddingVertical: space[32], gap: 8 }}>
        <Icon name="search" size={32} color={colors.muted} />
        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>
          No results for "{query}"
        </Text>
        <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
          Try searching for words like "help", "order", "meeting", or "flight".
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: space[16] }}>
      {categories.length > 0 ? (
        <View style={{ gap: space[10] }}>
          <SectionLabel>SITUATIONS & CATEGORIES</SectionLabel>
          <GroupedList>
            {categories.map((c) => (
              <ListRow
                key={c.id}
                label={c.en}
                sublabel={c.si}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/sentences/[topicId]',
                    params: { topicId: c.topicId, categoryId: c.id },
                  })
                }
              />
            ))}
          </GroupedList>
        </View>
      ) : null}

      {sentences.length > 0 ? (
        <View style={{ gap: space[10] }}>
          <SectionLabel>MATCHING SENTENCES ({sentences.length})</SectionLabel>
          <View style={{ gap: space[10] }}>
            {sentences.slice(0, 15).map((s) => (
              <SentenceCard
                key={s.id}
                en={s.en}
                pron={s.pronunciationSi}
                meaning={s.meaningSi}
                level={s.level}
                saved={false}
                showPronunciation={false}
                onCopy={async () => {
                  await Clipboard.setStringAsync(`${s.en} - ${s.meaningSi}`);
                  onCopied();
                }}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
