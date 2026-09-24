import type { ContentStore } from '../db/ContentStore';
import type { Category, Level, SentenceItem, Topic, VocabItem } from './types';

export class ContentRepository {
  constructor(private store: ContentStore) {}

  async getTopics(type?: 'vocabulary' | 'sentences'): Promise<Topic[]> {
    const topics = await this.store.getAllTopics();
    const filtered = type ? topics.filter((t) => t.type === type) : topics;
    return filtered.sort((a, b) => a.order - b.order);
  }

  async getTopic(id: string): Promise<Topic | undefined> {
    const topics = await this.store.getAllTopics();
    return topics.find((t) => t.id === id);
  }

  async getCategories(topicId?: string): Promise<Category[]> {
    const categories = await this.store.getAllCategories();
    const filtered = topicId ? categories.filter((c) => c.topicId === topicId) : categories;
    return filtered.sort((a, b) => a.order - b.order);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const categories = await this.store.getAllCategories();
    return categories.find((c) => c.id === id);
  }

  async getWords(categoryId: string): Promise<VocabItem[]> {
    const vocab = await this.store.getAllVocab();
    return vocab.filter((v) => v.categoryIds.includes(categoryId));
  }

  async getWord(id: string): Promise<VocabItem | undefined> {
    const vocab = await this.store.getAllVocab();
    return vocab.find((v) => v.id === id);
  }

  async getSentences(categoryId: string, level?: Level): Promise<SentenceItem[]> {
    const list = await this.store.getSentencesByCategory(categoryId, level);
    if (list && list.length > 0) return list;
    const all = await this.store.getAllSentences();
    return all.filter((s) => s.categoryId === categoryId && (!level || s.level === level));
  }

  async getAllVocab(): Promise<VocabItem[]> {
    return this.store.getAllVocab();
  }

  async getAllSentences(): Promise<SentenceItem[]> {
    return this.store.getAllSentences();
  }

  // Word count per category, for topic preview lines and Home counts.
  async getCategoryCounts(topicId: string): Promise<number> {
    const categories = await this.getCategories(topicId);
    return categories.length;
  }
}
