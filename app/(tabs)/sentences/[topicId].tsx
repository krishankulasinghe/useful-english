import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import { IconButton, NavHeader, Screen, SentenceCard, Toast, useToast } from '../../../src/components';
import { useCategories, useSentences, useTopic } from '../../../src/content/hooks';
import type { Level } from '../../../src/content/types';
import { useProgressRepo, useSaved } from '../../../src/state/hooks';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

const PAGE_SIZE = 20;

const LEVEL_OPTIONS: { label: string; value: Level | undefined }[] = [
  { label: 'All levels', value: undefined },
  { label: 'Beginner · ආරම්භක', value: 'beginner' },
  { label: 'Intermediate · මධ්‍යම', value: 'intermediate' },
  { label: 'Advanced · උසස්', value: 'advanced' },
];

export default function SentenceList() {
  const router = useRouter();
  const { colors, space } = useTheme();
  const { topicId, categoryId: categoryIdParam } = useLocalSearchParams<{ topicId: string; categoryId?: string }>();
  const toast = useToast();

  const topic = useTopic(topicId);
  const categories = useCategories(topicId);
  const [levelFilter, setLevelFilter] = useState<Level | undefined>(undefined);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategoryIdState, setSelectedCategoryIdState] = useState<string | undefined>(categoryIdParam);

  const selectedCategoryId = selectedCategoryIdState ?? categoryIdParam ?? categories[0]?.id;
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const sentences = useSentences(selectedCategoryId, levelFilter);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination whenever category or level filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategoryId, levelFilter]);

  const visibleSentences = useMemo(
    () => sentences.slice(0, visibleCount),
    [sentences, visibleCount],
  );

  const handleEndReached = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= sentences.length) return prev;
      return Math.min(prev + PAGE_SIZE, sentences.length);
    });
  }, [sentences.length]);

  return (
    <View style={{ flex: 1 }}>
      <Screen padded={false} style={{ flex: 1 }}>
        <NavHeader
          title={topic?.en ?? ''}
          subtitle={topic?.si}
          backLabel="Back to sentence categories"
          onBack={() => router.back()}
          right={<IconButton name="filter" accessibilityLabel="Filter by level" onPress={() => setFilterOpen(true)} />}
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

        {!selectedCategory ? null : sentences.length === 0 ? (
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
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, marginBottom: space[12] }}>
                {selectedCategory.si} · {sentences.length} sentences
              </Text>
            }
            ItemSeparatorComponent={() => <View style={{ height: space[12] }} />}
            renderItem={({ item }) => (
              <SentenceListCard
                id={item.id}
                en={item.en}
                pron={item.pronunciationSi}
                meaning={item.meaningSi}
                level={item.level}
                onCopied={() => toast.show('Copied')}
              />
            )}
            ListFooterComponent={
              visibleCount < sentences.length ? (
                <View style={{ paddingVertical: space[16], alignItems: 'center' }}>
                  <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>
                    Showing {visibleSentences.length} of {sentences.length} sentences · Scroll for more
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </Screen>

      <Toast message={toast.message} />

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(22,24,29,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setFilterOpen(false)}
        >
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: space[8], paddingBottom: space[32] }}>
            {LEVEL_OPTIONS.map((option) => (
              <Pressable
                key={option.label}
                onPress={() => {
                  setLevelFilter(option.value);
                  setFilterOpen(false);
                }}
                style={{
                  minHeight: 54,
                  paddingHorizontal: space[20],
                  justifyContent: 'center',
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
  useEffect(() => setSavedOverride(undefined), [id]);
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
});
