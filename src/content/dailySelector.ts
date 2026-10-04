import { getGoalCategoryIds, type GoalId } from './goals';
import type { Level, SentenceItem } from './types';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic shuffle with seed so today's 10 sentences remain stable on the same day
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;
  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const rnd = currentSeed / 233280;
    const j = Math.floor(rnd * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export function pickDailySentences(
  allSentences: SentenceItem[],
  options: {
    date: string;
    level: Level;
    goalId: GoalId;
    subTrackId?: string;
    count?: number;
  },
): SentenceItem[] {
  const { date, level, goalId, subTrackId, count = 10 } = options;
  if (!allSentences || allSentences.length === 0) return [];

  const targetCategoryIds = new Set(getGoalCategoryIds(goalId, subTrackId));

  // 1. Preferred pool: sentences matching both target categories AND level
  const exactMatch = allSentences.filter(
    (s) => targetCategoryIds.has(s.categoryId) && s.level === level,
  );

  // 2. Secondary pool: sentences matching target categories (any level)
  const categoryMatch = allSentences.filter(
    (s) => targetCategoryIds.has(s.categoryId) && s.level !== level,
  );

  // 3. Fallback pool: sentences matching user's level (any category)
  const levelMatch = allSentences.filter(
    (s) => !targetCategoryIds.has(s.categoryId) && s.level === level,
  );

  const seed = hashCode(`${date}-${goalId}-${subTrackId ?? 'none'}-${level}`);

  const shuffledExact = seededShuffle(exactMatch, seed);
  const shuffledCategory = seededShuffle(categoryMatch, seed + 1);
  const shuffledLevel = seededShuffle(levelMatch, seed + 2);

  const combined: SentenceItem[] = [];
  const seenIds = new Set<string>();

  for (const s of [...shuffledExact, ...shuffledCategory, ...shuffledLevel, ...allSentences]) {
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id);
      combined.push(s);
      if (combined.length >= count) break;
    }
  }

  return combined;
}
