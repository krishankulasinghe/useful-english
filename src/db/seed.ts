import type { SeedFile } from '../content/schema';
import type { ContentStore } from './ContentStore';

const CONTENT_VERSION_KEY = 'contentVersion';
const SCHEMA_VERSION_KEY = 'schemaVersion';

// Idempotent: only inserts the bundled seed content on first launch
// (when `meta.contentVersion` is missing). Safe to call on every start.
export async function seedIfNeeded(store: ContentStore, seed: SeedFile): Promise<void> {
  const existingVersion = await store.getMeta(CONTENT_VERSION_KEY);
  if (existingVersion !== undefined) return;

  await store.withTransaction(async () => {
    await store.upsertTopics(seed.topics);
    await store.upsertCategories(seed.categories);
    await store.upsertVocab(seed.vocabulary);
    await store.upsertSentences(seed.sentences);
    await store.setMeta(CONTENT_VERSION_KEY, String(seed.version));
    await store.setMeta(SCHEMA_VERSION_KEY, String(seed.schemaVersion));
  });
}

export async function getContentVersion(store: ContentStore): Promise<number> {
  const v = await store.getMeta(CONTENT_VERSION_KEY);
  return v ? Number(v) : 0;
}

export async function getSchemaVersion(store: ContentStore): Promise<number> {
  const v = await store.getMeta(SCHEMA_VERSION_KEY);
  return v ? Number(v) : 0;
}
