import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  IconButton,
  LevelChip,
  NavHeader,
  PrimaryButton,
  Screen,
  SentenceCard,
  Toast,
  useToast,
} from '../../../src/components';
import { Icon, type IconName } from '../../../src/icons/Icon';
import { useCategories, useSentences, useTopic } from '../../../src/content/hooks';
import type { Category, Level, SentenceItem } from '../../../src/content/types';
import { useProgressRepo, useSaved } from '../../../src/state/hooks';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

const PAGE_SIZE = 25;

const LEVEL_CHIPS: { label: string; value: Level | undefined }[] = [
  { label: 'All Levels', value: undefined },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export default function SentenceListScreen() {
  const router = useRouter();
  const { colors, space, radius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const { topicId, categoryId: categoryIdParam } = useLocalSearchParams<{ topicId: string; categoryId?: string }>();
  const toast = useToast();
  const progressRepo = useProgressRepo();

  const topic = useTopic(topicId);
  const categories = useCategories(topicId);

  const [selectedCategoryIdState, setSelectedCategoryIdState] = useState<string | undefined>(categoryIdParam);
  const [levelFilter, setLevelFilter] = useState<Level | undefined>(undefined);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showAllPronunciations, setShowAllPronunciations] = useState(false);

  const selectedCategoryId = selectedCategoryIdState ?? categoryIdParam ?? categories[0]?.id;
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? categories[0];

  const sentences = useSentences(selectedCategory?.id, levelFilter);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryIdState(catId);
    setIsPickerOpen(false);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Screen padded={false} style={{ flex: 1 }}>
        {/* Navigation Header */}
        <NavHeader
          title={topic?.en ?? 'Topic Sentences'}
          subtitle={topic?.si}
          backLabel="Back"
          onBack={() => router.back()}
          right={
            <IconButton
              name="cards"
              variant="outline"
              accessibilityLabel="Practice with cards"
              color={colors.primary}
              onPress={() =>
                router.push({
                  pathname: '/practice/workout',
                  params: { mode: 'situation', categoryId: selectedCategory?.id, topicId },
                })
              }
            />
          }
        />

        {/* Top Controls Container */}
        <View style={{ paddingHorizontal: space[20], paddingTop: space[8], gap: space[12] }}>
          {/* Situation Selector Card */}
          {selectedCategory ? (
            <Pressable
              onPress={() => setIsPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Current situation: ${selectedCategory.en}. Tap to switch situation.`}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius[20],
                borderWidth: 1.5,
                borderColor: colors.cardBorder,
                paddingVertical: space[12],
                paddingHorizontal: space[16],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                ...shadows.hero,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: colors.primaryTint,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={(topic?.icon as IconName) ?? 'message'} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 16, color: colors.ink }} numberOfLines={1}>
                      {selectedCategory.en}
                    </Text>
                    <View
                      style={{
                        backgroundColor: colors.saffronTint,
                        paddingVertical: 2,
                        paddingHorizontal: 8,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 11, color: colors.saffronDark }}>
                        {sentences.length}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.muted }} numberOfLines={1}>
                    {selectedCategory.si} · Tap to change situation
                  </Text>
                </View>
              </View>

              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.neutralFill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="sort" size={16} color={colors.ink} />
              </View>
            </Pressable>
          ) : null}

          {/* Practice with Cards CTA Button */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/practice/workout',
                params: { mode: 'situation', categoryId: selectedCategory?.id, topicId },
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Practice with Cards"
            style={{
              backgroundColor: colors.primaryDark,
              borderRadius: radius[16],
              paddingVertical: 11,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon name="cards" size={18} color={colors.white} />
            <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.white }}>
              Practice with Flip Cards ({sentences.length})
            </Text>
          </Pressable>

          {/* Quick Level Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {LEVEL_CHIPS.map((chip) => {
              const isSelected = levelFilter === chip.value;
              return (
                <Pressable
                  key={chip.label}
                  onPress={() => {
                    setLevelFilter(chip.value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  style={{
                    paddingVertical: 7,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderWidth: 1.2,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
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
          </ScrollView>
        </View>

        {/* Sentences List */}
        {sentences.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[8], paddingHorizontal: space[20], marginTop: 40 }}>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 18, color: colors.ink }}>No sentences found</Text>
            <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted, textAlign: 'center' }}>
              No sentences at the selected level. Try choosing "All Levels".
            </Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: space[20], paddingTop: space[14], paddingBottom: space[32], gap: space[12] }}
            data={visibleSentences}
            keyExtractor={(item) => item.id}
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={5}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SentenceRowItem
                sentence={item}
                onCopied={() => toast.show('Copied to clipboard')}
              />
            )}
          />
        )}

        {/* Situation Picker Bottom Sheet Modal */}
        <Modal
          visible={isPickerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsPickerOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
            onPress={() => setIsPickerOpen(false)}
          >
            <Pressable
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                maxHeight: '75%',
                paddingTop: 16,
                paddingBottom: insets.bottom + 20,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <View
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: colors.line,
                  alignSelf: 'center',
                  marginBottom: 14,
                }}
              />

              <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 20, color: colors.ink }}>
                  Select Situation
                </Text>
                <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.muted }}>
                  අවස්ථාව තෝරන්න · {categories.length} situations available
                </Text>
              </View>

              <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 20 }}>
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedCategory?.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => handleSelectCategory(cat.id)}
                      style={{
                        backgroundColor: isSelected ? colors.primaryTint : colors.bg,
                        borderWidth: 1.5,
                        borderColor: isSelected ? colors.primary : colors.cardBorder,
                        borderRadius: 18,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            backgroundColor: isSelected ? colors.primary : colors.surface,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon name={(topic?.icon as IconName) ?? 'message'} size={18} color={isSelected ? colors.white : colors.ink} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 16, color: colors.ink }}>
                            {cat.en}
                          </Text>
                          <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 13, color: colors.primaryDark }}>
                            {cat.si}
                          </Text>
                        </View>
                      </View>

                      {isSelected ? (
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: colors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon name="check" size={16} color={colors.white} strokeWidth={2.5} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </Screen>
      <Toast message={toast.message} />
    </View>
  );
}

function SentenceRowItem({
  sentence,
  onCopied,
}: {
  sentence: SentenceItem;
  onCopied: () => void;
}) {
  const saved = useSaved('sentence', sentence.id);
  const progressRepo = useProgressRepo();
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);
  const isSaved = savedOverride ?? saved;

  return (
    <SentenceCard
      en={sentence.en}
      pron={sentence.pronunciationSi}
      meaning={sentence.meaningSi}
      level={sentence.level}
      saved={isSaved}
      onSave={async () => {
        if (!progressRepo) return;
        const next = await progressRepo.toggleSaved('sentence', sentence.id);
        setSavedOverride(next);
      }}
      onCopy={async () => {
        await Clipboard.setStringAsync(`${sentence.en} - ${sentence.meaningSi}`);
        onCopied();
      }}
    />
  );
}
