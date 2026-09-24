import * as SQLite from 'expo-sqlite';

import type { Category, Level, SentenceItem, Topic, VocabItem } from '../content/types';
import { normalizeSearchText } from '../content/normalize';
import type { ContentStore, SavedItem, SavedItemType } from './ContentStore';
import { MIGRATION_1 } from './schema.sql';

const DB_NAME = 'sineng.db';

function vocabSearchText(v: VocabItem): string {
  return normalizeSearchText(v.en, v.pronunciationSi, v.meaningSi, v.example.en, v.example.meaningSi);
}

function sentenceSearchText(s: SentenceItem): string {
  return normalizeSearchText(s.en, s.pronunciationSi, s.meaningSi);
}

function rowToTopic(row: any): Topic {
  return { id: row.id, type: row.type, en: row.en, si: row.si, icon: row.icon, order: row.ord };
}
function rowToCategory(row: any): Category {
  return {
    id: row.id,
    topicId: row.topic_id,
    en: row.en,
    si: row.si,
    order: row.ord,
    shortEn: row.short_en ?? undefined,
  };
}
function rowToVocab(row: any, categoryIds: string[]): VocabItem {
  return {
    id: row.id,
    categoryIds,
    en: row.en,
    pronunciationSi: row.pron_si,
    meaningSi: row.meaning_si,
    partOfSpeech: row.pos ?? undefined,
    forms: row.forms_json ? JSON.parse(row.forms_json) : undefined,
    example: JSON.parse(row.example_json),
    level: row.level ?? undefined,
    audioUrl: row.audio_url ?? undefined,
  };
}
function rowToSentence(row: any): SentenceItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    en: row.en,
    pronunciationSi: row.pron_si,
    meaningSi: row.meaning_si,
    level: row.level,
    audioUrl: row.audio_url ?? undefined,
  };
}

export class SqliteStore implements ContentStore {
  private db: SQLite.SQLiteDatabase;

  private constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  static async open(): Promise<SqliteStore> {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync(MIGRATION_1);
    return new SqliteStore(db);
  }

  async getMeta(key: string) {
    const row = await this.db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key]);
    return row?.value;
  }
  async setMeta(key: string, value: string) {
    await this.db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [key, value]);
  }

  async getAllTopics() {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM topics ORDER BY ord ASC');
    return rows.map(rowToTopic);
  }
  async getAllCategories() {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM categories ORDER BY ord ASC');
    return rows.map(rowToCategory);
  }
  async getAllVocab() {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM vocab');
    const links = await this.db.getAllAsync<{ vocab_id: string; category_id: string }>(
      'SELECT vocab_id, category_id FROM vocab_categories',
    );
    const byVocab = new Map<string, string[]>();
    for (const l of links) {
      const list = byVocab.get(l.vocab_id) ?? [];
      list.push(l.category_id);
      byVocab.set(l.vocab_id, list);
    }
    return rows.map((row) => rowToVocab(row, byVocab.get(row.id) ?? []));
  }
  async getAllSentences() {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM sentences');
    return rows.map(rowToSentence);
  }

  async getSentencesByCategory(categoryId: string, level?: Level) {
    let sql = 'SELECT * FROM sentences WHERE category_id = ?';
    const params: any[] = [categoryId];
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    const rows = await this.db.getAllAsync<any>(sql, ...params);
    return rows.map(rowToSentence);
  }

  async upsertTopics(topics: Topic[]) {
    for (const t of topics) {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO topics (id, type, en, si, icon, ord) VALUES (?, ?, ?, ?, ?, ?)',
        [t.id, t.type, t.en, t.si, t.icon, t.order],
      );
    }
  }
  async upsertCategories(categories: Category[]) {
    for (const c of categories) {
      await this.db.runAsync(
        'INSERT OR REPLACE INTO categories (id, topic_id, en, si, short_en, ord) VALUES (?, ?, ?, ?, ?, ?)',
        [c.id, c.topicId, c.en, c.si, c.shortEn ?? null, c.order],
      );
    }
  }
  async upsertVocab(vocab: VocabItem[]) {
    for (const v of vocab) {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO vocab
          (id, en, pron_si, meaning_si, pos, forms_json, example_json, level, audio_url, search_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          v.id,
          v.en,
          v.pronunciationSi,
          v.meaningSi,
          v.partOfSpeech ?? null,
          v.forms ? JSON.stringify(v.forms) : null,
          JSON.stringify(v.example),
          v.level ?? null,
          v.audioUrl ?? null,
          vocabSearchText(v),
        ],
      );
      // Rewrite vocab_categories for this word.
      await this.db.runAsync('DELETE FROM vocab_categories WHERE vocab_id = ?', [v.id]);
      for (const categoryId of v.categoryIds) {
        await this.db.runAsync('INSERT OR REPLACE INTO vocab_categories (vocab_id, category_id) VALUES (?, ?)', [
          v.id,
          categoryId,
        ]);
      }
    }
  }
  async upsertSentences(sentences: SentenceItem[]) {
    if (sentences.length === 0) return;
    try {
      const stmt = await this.db.prepareAsync(
        `INSERT OR REPLACE INTO sentences
          (id, category_id, en, pron_si, meaning_si, level, audio_url, search_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );
      try {
        for (const s of sentences) {
          await stmt.executeAsync([
            s.id,
            s.categoryId,
            s.en,
            s.pronunciationSi,
            s.meaningSi,
            s.level,
            s.audioUrl ?? null,
            sentenceSearchText(s),
          ]);
        }
      } finally {
        await stmt.finalizeAsync();
      }
    } catch {
      for (const s of sentences) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO sentences
            (id, category_id, en, pron_si, meaning_si, level, audio_url, search_text)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            s.categoryId,
            s.en,
            s.pronunciationSi,
            s.meaningSi,
            s.level,
            s.audioUrl ?? null,
            sentenceSearchText(s),
          ],
        );
      }
    }
  }

  async deleteTopics(ids: string[]) {
    for (const id of ids) await this.db.runAsync('DELETE FROM topics WHERE id = ?', [id]);
  }
  async deleteCategories(ids: string[]) {
    for (const id of ids) await this.db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  }
  async deleteVocab(ids: string[]) {
    for (const id of ids) {
      await this.db.runAsync('DELETE FROM vocab WHERE id = ?', [id]);
      await this.db.runAsync('DELETE FROM vocab_categories WHERE vocab_id = ?', [id]);
    }
  }
  async deleteSentences(ids: string[]) {
    if (ids.length === 0) return;
    const CHUNK_SIZE = 100;
    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
      const chunk = ids.slice(i, i + CHUNK_SIZE);
      const placeholders = chunk.map(() => '?').join(', ');
      await this.db.runAsync(`DELETE FROM sentences WHERE id IN (${placeholders})`, chunk);
    }
  }

  async clearAll() {
    await this.db.execAsync(`
      DELETE FROM topics; DELETE FROM categories; DELETE FROM vocab;
      DELETE FROM vocab_categories; DELETE FROM sentences; DELETE FROM meta;
    `);
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    let result: T;
    await this.db.withTransactionAsync(async () => {
      result = await fn();
    });
    return result!;
  }

  async toggleSaved(type: SavedItemType, id: string) {
    const existing = await this.db.getFirstAsync('SELECT 1 FROM saved WHERE item_type = ? AND item_id = ?', [
      type,
      id,
    ]);
    if (existing) {
      await this.db.runAsync('DELETE FROM saved WHERE item_type = ? AND item_id = ?', [type, id]);
      return false;
    }
    await this.db.runAsync('INSERT INTO saved (item_type, item_id, created_at) VALUES (?, ?, ?)', [
      type,
      id,
      new Date().toISOString(),
    ]);
    return true;
  }
  async isSaved(type: SavedItemType, id: string) {
    const row = await this.db.getFirstAsync('SELECT 1 FROM saved WHERE item_type = ? AND item_id = ?', [type, id]);
    return !!row;
  }
  async listSaved(): Promise<SavedItem[]> {
    const rows = await this.db.getAllAsync<any>('SELECT * FROM saved ORDER BY created_at DESC');
    return rows.map((r) => ({ itemType: r.item_type, itemId: r.item_id, createdAt: r.created_at }));
  }

  async markLearned(vocabId: string) {
    await this.db.runAsync('INSERT OR REPLACE INTO learned (vocab_id, at) VALUES (?, ?)', [
      vocabId,
      new Date().toISOString(),
    ]);
  }
  async isLearned(vocabId: string) {
    const row = await this.db.getFirstAsync('SELECT 1 FROM learned WHERE vocab_id = ?', [vocabId]);
    return !!row;
  }
  async listLearnedIds() {
    const rows = await this.db.getAllAsync<{ vocab_id: string }>('SELECT vocab_id FROM learned');
    return rows.map((r) => r.vocab_id);
  }

  async recordActivity(day: string) {
    await this.db.runAsync('INSERT OR IGNORE INTO activity (day) VALUES (?)', [day]);
  }
  async listActivityDays() {
    const rows = await this.db.getAllAsync<{ day: string }>('SELECT day FROM activity ORDER BY day ASC');
    return rows.map((r) => r.day);
  }
}
