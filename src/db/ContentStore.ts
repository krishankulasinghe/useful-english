import type { Category, SentenceItem, Topic, VocabItem } from '../content/types';

export type SavedItemType = 'word' | 'sentence';

export interface SavedItem {
  itemType: SavedItemType;
  itemId: string;
  createdAt: string;
}

// Backing store for content + local progress. Implemented by SqliteStore
// (the app, via expo-sqlite) and MemoryStore (tests, and a reference impl).
export interface ContentStore {
  getMeta(key: string): Promise<string | undefined>;
  setMeta(key: string, value: string): Promise<void>;

  getAllTopics(): Promise<Topic[]>;
  getAllCategories(): Promise<Category[]>;
  getAllVocab(): Promise<VocabItem[]>;
  getAllSentences(): Promise<SentenceItem[]>;

  upsertTopics(topics: Topic[]): Promise<void>;
  upsertCategories(categories: Category[]): Promise<void>;
  upsertVocab(vocab: VocabItem[]): Promise<void>;
  upsertSentences(sentences: SentenceItem[]): Promise<void>;

  deleteTopics(ids: string[]): Promise<void>;
  deleteCategories(ids: string[]): Promise<void>;
  deleteVocab(ids: string[]): Promise<void>;
  deleteSentences(ids: string[]): Promise<void>;

  clearAll(): Promise<void>;

  // Runs `fn`; if it throws, all writes made inside are rolled back.
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;

  // Progress
  toggleSaved(type: SavedItemType, id: string): Promise<boolean>; // returns new saved state
  isSaved(type: SavedItemType, id: string): Promise<boolean>;
  listSaved(): Promise<SavedItem[]>;
  markLearned(vocabId: string): Promise<void>;
  isLearned(vocabId: string): Promise<boolean>;
  listLearnedIds(): Promise<string[]>;
  recordActivity(day: string): Promise<void>;
  listActivityDays(): Promise<string[]>;
}
