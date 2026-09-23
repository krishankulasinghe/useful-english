import type { Category, SentenceItem, Topic, VocabItem } from '../content/types';
import { normalizeSearchText } from '../content/normalize';
import type { ContentStore, SavedItem, SavedItemType } from './ContentStore';

interface State {
  meta: Map<string, string>;
  topics: Map<string, Topic>;
  categories: Map<string, Category>;
  vocab: Map<string, VocabItem>;
  sentences: Map<string, SentenceItem>;
  saved: Map<string, SavedItem>; // key = `${type}:${id}`
  learned: Map<string, string>; // vocabId -> at
  activity: Set<string>; // days
}

function emptyState(): State {
  return {
    meta: new Map(),
    topics: new Map(),
    categories: new Map(),
    vocab: new Map(),
    sentences: new Map(),
    saved: new Map(),
    learned: new Map(),
    activity: new Set(),
  };
}

function cloneState(s: State): State {
  return {
    meta: new Map(s.meta),
    topics: new Map(s.topics),
    categories: new Map(s.categories),
    vocab: new Map(s.vocab),
    sentences: new Map(s.sentences),
    saved: new Map(s.saved),
    learned: new Map(s.learned),
    activity: new Set(s.activity),
  };
}

// In-memory reference implementation of ContentStore, used by unit tests and
// as a lightweight substitute wherever a real device isn't available.
export class MemoryStore implements ContentStore {
  private state: State = emptyState();

  async getMeta(key: string) {
    return this.state.meta.get(key);
  }
  async setMeta(key: string, value: string) {
    this.state.meta.set(key, value);
  }

  async getAllTopics() {
    return [...this.state.topics.values()].sort((a, b) => a.order - b.order);
  }
  async getAllCategories() {
    return [...this.state.categories.values()].sort((a, b) => a.order - b.order);
  }
  async getAllVocab() {
    return [...this.state.vocab.values()];
  }
  async getAllSentences() {
    return [...this.state.sentences.values()];
  }

  async upsertTopics(topics: Topic[]) {
    for (const t of topics) this.state.topics.set(t.id, t);
  }
  async upsertCategories(categories: Category[]) {
    for (const c of categories) this.state.categories.set(c.id, c);
  }
  async upsertVocab(vocab: VocabItem[]) {
    for (const v of vocab) this.state.vocab.set(v.id, v);
  }
  async upsertSentences(sentences: SentenceItem[]) {
    for (const s of sentences) this.state.sentences.set(s.id, s);
  }

  async deleteTopics(ids: string[]) {
    for (const id of ids) this.state.topics.delete(id);
  }
  async deleteCategories(ids: string[]) {
    for (const id of ids) this.state.categories.delete(id);
  }
  async deleteVocab(ids: string[]) {
    for (const id of ids) this.state.vocab.delete(id);
  }
  async deleteSentences(ids: string[]) {
    for (const id of ids) this.state.sentences.delete(id);
  }

  async clearAll() {
    this.state = emptyState();
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const snapshot = cloneState(this.state);
    try {
      return await fn();
    } catch (err) {
      this.state = snapshot;
      throw err;
    }
  }

  async toggleSaved(type: SavedItemType, id: string) {
    const key = `${type}:${id}`;
    if (this.state.saved.has(key)) {
      this.state.saved.delete(key);
      return false;
    }
    this.state.saved.set(key, { itemType: type, itemId: id, createdAt: new Date().toISOString() });
    return true;
  }
  async isSaved(type: SavedItemType, id: string) {
    return this.state.saved.has(`${type}:${id}`);
  }
  async listSaved() {
    return [...this.state.saved.values()];
  }

  async markLearned(vocabId: string) {
    this.state.learned.set(vocabId, new Date().toISOString());
  }
  async isLearned(vocabId: string) {
    return this.state.learned.has(vocabId);
  }
  async listLearnedIds() {
    return [...this.state.learned.keys()];
  }

  async recordActivity(day: string) {
    this.state.activity.add(day);
  }
  async listActivityDays() {
    return [...this.state.activity].sort();
  }
}

export function vocabSearchText(v: VocabItem): string {
  return normalizeSearchText(v.en, v.pronunciationSi, v.meaningSi, v.example.en, v.example.meaningSi);
}

export function sentenceSearchText(s: SentenceItem): string {
  return normalizeSearchText(s.en, s.pronunciationSi, s.meaningSi);
}
