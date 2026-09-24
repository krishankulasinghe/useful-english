import type { SeedFile } from '../content/schema';
import type { ContentStore } from './ContentStore';

const CONTENT_VERSION_KEY = 'contentVersion';
const SCHEMA_VERSION_KEY = 'schemaVersion';

// Idempotent: inserts or updates bundled seed content when contentVersion
// is missing, outdated (existingVersion < seed.version), or sentences are unpopulated.
export async function seedIfNeeded(store: ContentStore, seed: SeedFile): Promise<boolean> {
  const existingVersion = await store.getMeta(CONTENT_VERSION_KEY);
  const existingSentences = await store.getAllSentences();

  if (
    existingVersion !== undefined &&
    Number(existingVersion) >= seed.version &&
    (seed.sentences.length === 0 || existingSentences.length >= seed.sentences.length)
  ) {
    return false;
  }

  await store.withTransaction(async () => {
    await store.upsertTopics(seed.topics);
    await store.upsertCategories(seed.categories);
    await store.upsertVocab(seed.vocabulary);
    await store.upsertSentences(seed.sentences);
    await store.setMeta(CONTENT_VERSION_KEY, String(seed.version));
    await store.setMeta(SCHEMA_VERSION_KEY, String(seed.schemaVersion));
  });

  return true;
}

export async function getContentVersion(store: ContentStore): Promise<number> {
  const v = await store.getMeta(CONTENT_VERSION_KEY);
  return v ? Number(v) : 0;
}

export async function getSchemaVersion(store: ContentStore): Promise<number> {
  const v = await store.getMeta(SCHEMA_VERSION_KEY);
  return v ? Number(v) : 0;
}
