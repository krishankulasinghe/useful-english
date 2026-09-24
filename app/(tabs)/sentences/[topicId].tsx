import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { IconButton, NavHeader, Screen, SentenceCard, Toast, useToast } from '../../../src/components';
import { Icon } from '../../../src/icons/Icon';
import { useCategories, useSentences, useTopic } from '../../../src/content/hooks';
import type { Level } from '../../../src/content/types';
import { useProgressRepo, useSaved } from '../../../src/state/hooks';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

const PAGE_SIZE = 20;

const LEVEL_OPTIONS: { label: string; value: Level | undefined }[] = [
  { label: 'All levels', value: undefined },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

type SortOrder = 'default' | 'difficulty-asc' | 'difficulty-desc';

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: 'Default order', value: 'default' },
  { label: 'Easy to Hard (Beginner → Advanced)', value: 'difficulty-asc' },
  { label: 'Hard to Easy (Advanced → Beginner)', value: 'difficulty-desc' },
];

const LEVEL_WEIGHT: Record<Level, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export default function SentenceList() {
  const router = useRouter();
  const { colors, space } = useTheme();
  const { topicId, categoryId: categoryIdParam } = useLocalSearchParams<{ topicId: string; categoryId?: string }>();
  const toast = useToast();

  const topic = useTopic(topicId);
  const categories = useCategories(topicId);
  const [levelFilter, setLevelFilter] = useState<Level | undefined>(undefined);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [sortOpen, setSortOpen] = useState(false);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [selectedCategoryIdState, setSelectedCategoryIdState] = useState<string | undefined>(categoryIdParam);

  const selectedCategoryId = selectedCategoryIdState ?? categoryIdParam ?? categories[0]?.id;
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const sentences = useSentences(selectedCategoryId, levelFilter);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination whenever category, level filter, or sort changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategoryId, levelFilter, sortOrder]);

  const sortedSentences = useMemo(() => {
    if (sortOrder === 'default') return sentences;
    const copy = [...sentences];
    copy.sort((a, b) => {
      const diff = LEVEL_WEIGHT[a.level] - LEVEL_WEIGHT[b.level];
      return sortOrder === 'difficulty-asc' ? diff : -diff;
    });
    return copy;
  }, [sentences, sortOrder]);

  const visibleSentences = useMemo(
    () => sortedSentences.slice(0, visibleCount),
    [sortedSentences, visibleCount],
  );

  const handleEndReached = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= sortedSentences.length) return prev;
      return Math.min(prev + PAGE_SIZE, sortedSentences.length);
    });
  }, [sortedSentences.length]);

  return (
    <View style={{ flex: 1 }}>
      <Screen padded={false} style={{ flex: 1 }}>
        <NavHeader
          title={topic?.en ?? ''}
          subtitle={topic?.si}
          backLabel="Back to sentence categories"
          onBack={() => router.back()}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[6] }}>
              <IconButton
                name="sort"
                variant="outline"
                accessibilityLabel="Sort by difficulty"
                color={sortOrder !== 'default' ? colors.primary : colors.ink}
                style={
                  sortOrder !== 'default'
                    ? { borderColor: colors.primary, backgroundColor: colors.primaryTint2 }
                    : undefined
                }
                onPress={() => setSortOpen(true)}
              />
              <IconButton
                name="filter"
                variant="outline"
                accessibilityLabel="Filter by level"
                color={levelFilter ? colors.primary : colors.ink}
                style={
                  levelFilter
                    ? { borderColor: colors.primary, backgroundColor: colors.primaryTint2 }
                    : undefined
                }
                onPress={() => setFilterOpen(true)}
              />
            </View>
          }
        />

        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space[20], gap: 22 }}>
            {categories.map((category) => {
              const active = category.id === selectedCategoryId;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategoryIdState(category.id)}
                  style={{
                    minHeight: 44,
                    justifyContent: 'center',
                    borderBottomWidth: active ? 3 : 0,
                    borderBottomColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: active ? fontFamily.jakarta700 : fontFamily.jakarta500,
                      fontSize: 15,
                      color: active ? colors.primary : colors.muted,
                    }}
                  >
                    {category.shortEn ?? category.en}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {!selectedCategory ? null : sortedSentences.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[8], paddingHorizontal: space[20] }}>
            <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 16, color: colors.ink }}>No sentences yet</Text>
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
              This category doesn't have any sentences yet.
            </Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: space[20], paddingBottom: space[32] }}
            data={visibleSentences}
            keyExtractor={(item) => item.id}
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={5}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={{ marginBottom: space[12], gap: space[8] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, flex: 1 }} numberOfLines={1}>
                    {selectedCategory.si} · {sortedSentences.length} sentences
                  </Text>
                  <Pressable
                    onPress={() => setShowPronunciation((prev) => !prev)}
                    accessibilityRole="button"
                    accessibilityLabel={showPronunciation ? 'Hide English pronunciation' : 'Show English pronunciation'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 14,
                      backgroundColor: showPronunciation ? colors.primaryTint2 : colors.surface,
                      borderWidth: 1,
                      borderColor: showPronunciation ? colors.primary : colors.line,
                    }}
                  >
                    <Icon
                      name={showPronunciation ? 'eye' : 'eye-off'}
                      size={14}
                      color={showPronunciation ? colors.primary : colors.muted}
                    />
                    <Text
                      style={{
                        fontFamily: fontFamily.jakarta600,
                        fontSize: 12,
                        color: showPronunciation ? colors.primary : colors.muted,
                      }}
                    >
                      Pronunciation
                    </Text>
                  </Pressable>
                </View>

                {levelFilter || sortOrder !== 'default' ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[6], paddingTop: 2 }}>
                    {levelFilter ? (
                      <Pressable
                        onPress={() => setLevelFilter(undefined)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                          borderRadius: 10,
                          backgroundColor: colors.primaryTint2,
                        }}
                      >
                        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11, color: colors.primaryDark }}>
                          Level: {LEVEL_OPTIONS.find((o) => o.value === levelFilter)?.label} ✕
                        </Text>
                      </Pressable>
                    ) : null}
                    {sortOrder !== 'default' ? (
                      <Pressable
                        onPress={() => setSortOrder('default')}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingVertical: 3,
                          paddingHorizontal: 8,
                          borderRadius: 10,
                          backgroundColor: colors.primaryTint2,
                        }}
                      >
                        <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 11, color: colors.primaryDark }}>
                          Sorted: {sortOrder === 'difficulty-asc' ? 'Easy → Hard' : 'Hard → Easy'} ✕
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            }
            ItemSeparatorComponent={() => <View style={{ height: space[12] }} />}
            renderItem={({ item }) => (
              <SentenceListCard
                id={item.id}
                en={item.en}
                pron={item.pronunciationSi}
                meaning={item.meaningSi}
                level={item.level}
                showPronunciation={showPronunciation}
                onCopied={() => toast.show('Copied')}
              />
            )}
            ListFooterComponent={
              visibleCount < sortedSentences.length ? (
                <View style={{ paddingVertical: space[16], alignItems: 'center' }}>
                  <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>
                    Showing {visibleSentences.length} of {sortedSentences.length} sentences · Scroll for more
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </Screen>

      <Toast message={toast.message} />

      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(22,24,29,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setSortOpen(false)}
        >
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: space[12], paddingBottom: space[32] }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: space[12] }} />
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink, paddingHorizontal: space[20], marginBottom: space[8] }}>
              Sort by Difficulty
            </Text>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSortOrder(option.value);
                  setSortOpen(false);
                }}
                style={{
                  minHeight: 52,
                  paddingHorizontal: space[20],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: option.value === sortOrder ? colors.primaryTint2 : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: option.value === sortOrder ? fontFamily.jakarta700 : fontFamily.jakarta500,
                    fontSize: 16,
                    color: colors.ink,
                  }}
                >
                  {option.label}
                </Text>
                {option.value === sortOrder ? <Icon name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(22,24,29,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setFilterOpen(false)}
        >
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: space[12], paddingBottom: space[32] }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: space[12] }} />
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink, paddingHorizontal: space[20], marginBottom: space[8] }}>
              Filter by Difficulty
            </Text>
            {LEVEL_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                onPress={() => {
                  setLevelFilter(option.value);
                  setFilterOpen(false);
                }}
                style={{
                  minHeight: 52,
                  paddingHorizontal: space[20],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: option.value === levelFilter ? colors.primaryTint2 : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: option.value === levelFilter ? fontFamily.jakarta700 : fontFamily.jakarta500,
                    fontSize: 16,
                    color: colors.ink,
                  }}
                >
                  {option.label}
                </Text>
                {option.value === levelFilter ? <Icon name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const SentenceListCard = React.memo(function SentenceListCard({
  id,
  en,
  pron,
  meaning,
  level,
  showPronunciation,
  onCopied,
}: {
  id: string;
  en: string;
  pron: string;
  meaning: string;
  level: Level;
  showPronunciation: boolean;
  onCopied: () => void;
}) {
  const progressRepo = useProgressRepo();
  const savedFromRepo = useSaved('sentence', id);
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);
  useEffect(() => setSavedOverride(undefined), [id]);
  const saved = savedOverride ?? savedFromRepo;

  return (
    <SentenceCard
      en={en}
      pron={pron}
      meaning={meaning}
      level={level}
      saved={saved}
      showPronunciation={showPronunciation}
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
});
