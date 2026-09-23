import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card, HeroCard, IconButton, PrimaryButton, Screen, TrioBlock } from '../../../src/components';
import { useContentContext } from '../../../src/content/ContentProvider';
import { useCategories, useCategory, useTopics, useWord, useWordOfTheDay } from '../../../src/content/hooks';
import { Icon } from '../../../src/icons/Icon';
import { useProgressRepo, useSaved, useStreak } from '../../../src/state/hooks';
import { useSettingsStore } from '../../../src/state/settingsStore';
import { fontFamily } from '../../../src/theme/typography';
import { useTheme } from '../../../src/theme/useTheme';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'සුබ උදෑසනක්';
  if (hour < 17) return 'සුබ දහවලක්';
  return 'සුබ සන්ධ්‍යාවක්';
}

export default function Home() {
  const router = useRouter();
  const { colors, space, radius, text } = useTheme();
  const level = useSettingsStore((s) => s.level);
  const lastCategoryId = useSettingsStore((s) => s.lastCategoryId);
  const streak = useStreak();
  const progressRepo = useProgressRepo();
  const { repository } = useContentContext();

  const today = useMemo(() => todayKey(), []);
  const word = useWordOfTheDay(today, level);
  const saved = useSaved('word', word?.id);
  const [savedOverride, setSavedOverride] = useState<boolean | undefined>(undefined);
  useEffect(() => setSavedOverride(undefined), [word?.id]);
  const isSaved = savedOverride ?? saved;

  const vocabTopics = useTopics('vocabulary');
  const sentenceTopics = useTopics('sentences');
  const allCategories = useCategories(undefined);
  const vocabTopicIds = useMemo(() => new Set(vocabTopics.map((t) => t.id)), [vocabTopics]);
  const sentenceTopicIds = useMemo(() => new Set(sentenceTopics.map((t) => t.id)), [sentenceTopics]);
  const vocabCategoryCount = allCategories.filter((c) => vocabTopicIds.has(c.topicId)).length;
  const sentenceCategoryCount = allCategories.filter((c) => sentenceTopicIds.has(c.topicId)).length;

  const [continueInfo, setContinueInfo] = useState<{ categoryId: string; wordId: string } | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    if (!progressRepo || !repository) return;
    progressRepo
      .continueLearning(lastCategoryId, (categoryId) => repository.getWords(categoryId))
      .then((v) => {
        if (!cancelled) setContinueInfo(v);
      });
    return () => {
      cancelled = true;
    };
  }, [progressRepo, repository, lastCategoryId]);
  const continueCategory = useCategory(continueInfo?.categoryId);
  const continueWord = useWord(continueInfo?.wordId);

  const handleToggleSave = useCallback(async () => {
    if (!progressRepo || !word) return;
    const next = await progressRepo.toggleSaved('word', word.id);
    setSavedOverride(next);
  }, [progressRepo, word]);

  const handleOpenWord = useCallback(() => {
    if (!word) return;
    progressRepo?.recordActivity(todayKey());
    router.push({ pathname: '/word/[wordId]', params: { wordId: word.id } });
  }, [router, word, progressRepo]);

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: space[32], gap: space[16] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[12] }}>
          <View>
            <Text style={{ fontFamily: fontFamily.notoSinhala400, fontSize: 14, color: colors.muted }}>{greeting()}</Text>
            <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 28, lineHeight: 32, letterSpacing: -0.28, color: colors.ink }}>
              Hi
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[10] }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                height: 36,
                paddingHorizontal: 12,
                borderRadius: 18,
                backgroundColor: colors.saffronTint,
              }}
            >
              <Icon name="flame" size={18} color={colors.saffron} strokeWidth={2} />
              <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 14, color: colors.saffron }}>{streak} days</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              accessibilityRole="button"
              accessibilityLabel="Profile and settings"
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="user" size={20} color={colors.white} strokeWidth={1.8} />
            </Pressable>
          </View>
        </View>

        {word ? (
          <HeroCard radius={24} padding={space[20]} style={{ gap: space[14] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[text('sectionLabel'), { color: colors.primary, textTransform: 'uppercase' }]}>Word of the day</Text>
              <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 13, color: colors.muted }}>අද දවසේ වචනය</Text>
            </View>
            <TrioBlock variant="hero" en={word.en} pron={word.pronunciationSi} meaning={word.meaningSi} />
            <View style={{ backgroundColor: colors.bg, borderRadius: radius[16], paddingVertical: 12, paddingHorizontal: 16, gap: 2 }}>
              <TrioBlock
                variant="example"
                en={word.example.en}
                pron={word.example.pronunciationSi}
                meaning={word.example.meaningSi}
                highlight={word.example.highlight}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: space[10] }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton label="Learn this word" height={50} onPress={handleOpenWord} />
              </View>
              <IconButton
                name="bookmark"
                accessibilityLabel={isSaved ? 'Unsave word' : 'Save word'}
                size={50}
                filled={isSaved}
                color={isSaved ? colors.primary : colors.ink}
                onPress={handleToggleSave}
              />
            </View>
          </HeroCard>
        ) : null}

        <View style={{ flexDirection: 'row', gap: space[12] }}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/(tabs)/words')} accessibilityRole="button" accessibilityLabel="Vocabulary">
            <Card style={{ gap: space[10] }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="book" size={22} color={colors.primary} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }}>Vocabulary</Text>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted }}>වචන මාලාව</Text>
              </View>
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.primary }}>{vocabCategoryCount} categories →</Text>
            </Card>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/(tabs)/sentences')} accessibilityRole="button" accessibilityLabel="Sentences">
            <Card style={{ gap: space[10] }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="message" size={22} color={colors.saffron} strokeWidth={1.8} />
              </View>
              <View>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 17, color: colors.ink }}>Sentences</Text>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 14, color: colors.muted }}>ප්‍රයෝජනවත් වාක්‍ය</Text>
              </View>
              <Text style={{ fontFamily: fontFamily.jakarta600, fontSize: 13, color: colors.saffron }}>{sentenceCategoryCount} categories →</Text>
            </Card>
          </Pressable>
        </View>

        {continueCategory && continueWord ? (
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/words/category/[categoryId]', params: { categoryId: continueCategory.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Continue learning ${continueCategory.en}`}
          >
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space[12], paddingVertical: 12, paddingHorizontal: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fontFamily.frauncesSemiBold, fontSize: 20, color: colors.white }}>
                  {continueCategory.en.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fontFamily.jakarta400, fontSize: 12, color: colors.muted }}>Continue learning · දිගටම ඉගෙන ගන්න</Text>
                <Text style={{ fontFamily: fontFamily.jakarta700, fontSize: 16, color: colors.ink }}>
                  {continueCategory.en} · next: {continueWord.en}
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color={colors.muted} strokeWidth={1.8} />
            </Card>
          </Pressable>
        ) : null}
    </Screen>
  );
}
