import type { ContentStore, SavedItem, SavedItemType } from '../db/ContentStore';
import type { VocabItem } from '../content/types';
import { computeStreak } from './streak';

export interface ContinueLearning {
  categoryId: string;
  wordId: string;
}

export class ProgressRepo {
  constructor(private store: ContentStore) {}

  toggleSaved(type: SavedItemType, id: string): Promise<boolean> {
    return this.store.toggleSaved(type, id);
  }
  isSaved(type: SavedItemType, id: string): Promise<boolean> {
    return this.store.isSaved(type, id);
  }
  listSaved(): Promise<SavedItem[]> {
    return this.store.listSaved();
  }

  markLearned(id: string): Promise<void> {
    return this.store.markLearned(id);
  }
  isLearned(id: string): Promise<boolean> {
    return this.store.isLearned(id);
  }

  async recordActivity(today: string): Promise<void> {
    await this.store.recordActivity(today);
  }

  async streak(today: string): Promise<number> {
    const days = await this.store.listActivityDays();
    return computeStreak(days, today);
  }

  // `lastCategoryId` + the first word in it that isn't yet learned.
  async continueLearning(
    lastCategoryId: string | undefined,
    wordsInCategory: (categoryId: string) => Promise<VocabItem[]>,
  ): Promise<ContinueLearning | undefined> {
    if (!lastCategoryId) return undefined;
    const words = await wordsInCategory(lastCategoryId);
    const learnedIds = new Set(await this.store.listLearnedIds());
    const next = words.find((w) => !learnedIds.has(w.id));
    if (!next) return undefined;
    return { categoryId: lastCategoryId, wordId: next.id };
  }
}
