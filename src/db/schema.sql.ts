// Migration 1: initial schema. See docs/IMPLEMENTATION_PLAN.md §4.
export const MIGRATION_1 = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  en TEXT NOT NULL,
  si TEXT NOT NULL,
  icon TEXT NOT NULL,
  ord INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  en TEXT NOT NULL,
  si TEXT NOT NULL,
  short_en TEXT,
  ord INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_topic_id ON categories(topic_id);

CREATE TABLE IF NOT EXISTS vocab (
  id TEXT PRIMARY KEY,
  en TEXT NOT NULL,
  pron_si TEXT NOT NULL,
  meaning_si TEXT NOT NULL,
  pos TEXT,
  forms_json TEXT,
  example_json TEXT NOT NULL,
  level TEXT,
  audio_url TEXT,
  search_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vocab_categories (
  vocab_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (vocab_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_vocab_categories_category_id ON vocab_categories(category_id);

CREATE TABLE IF NOT EXISTS sentences (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  en TEXT NOT NULL,
  pron_si TEXT NOT NULL,
  meaning_si TEXT NOT NULL,
  level TEXT NOT NULL,
  audio_url TEXT,
  search_text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sentences_category_id ON sentences(category_id);

CREATE TABLE IF NOT EXISTS saved (
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (item_type, item_id)
);

CREATE TABLE IF NOT EXISTS learned (
  vocab_id TEXT PRIMARY KEY,
  at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
  day TEXT PRIMARY KEY
);
`;

export const SCHEMA_VERSION = 1;
