// Diffs two full content JSON files (same shape as assets/content/content.json)
// into a delta update file, and bumps content-host/manifest.json.
//
// Usage: npx tsx scripts/make-update.ts old.json new.json
import fs from 'node:fs';
import path from 'node:path';

interface Identified {
  id: string;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffCollection<T extends Identified>(oldItems: T[], newItems: T[]) {
  const oldById = new Map(oldItems.map((i) => [i.id, i]));
  const newById = new Map(newItems.map((i) => [i.id, i]));

  const upsert: T[] = [];
  for (const [id, item] of newById) {
    const prev = oldById.get(id);
    if (!prev || !deepEqual(prev, item)) upsert.push(item);
  }

  const deleted: string[] = [];
  for (const id of oldById.keys()) {
    if (!newById.has(id)) deleted.push(id);
  }

  return { upsert, deleted };
}

export interface ContentBundleLike {
  version: number;
  topics: Identified[];
  categories: Identified[];
  vocabulary: Identified[];
  sentences: Identified[];
}

export function computeDelta(oldBundle: ContentBundleLike, newBundle: ContentBundleLike) {
  const topics = diffCollection(oldBundle.topics, newBundle.topics);
  const categories = diffCollection(oldBundle.categories, newBundle.categories);
  const vocabulary = diffCollection(oldBundle.vocabulary, newBundle.vocabulary);
  const sentences = diffCollection(oldBundle.sentences, newBundle.sentences);

  const upsert: Record<string, unknown[]> = {};
  if (topics.upsert.length) upsert.topics = topics.upsert;
  if (categories.upsert.length) upsert.categories = categories.upsert;
  if (vocabulary.upsert.length) upsert.vocabulary = vocabulary.upsert;
  if (sentences.upsert.length) upsert.sentences = sentences.upsert;

  const del: Record<string, string[]> = {};
  if (topics.deleted.length) del.topics = topics.deleted;
  if (categories.deleted.length) del.categories = categories.deleted;
  if (vocabulary.deleted.length) del.vocabulary = vocabulary.deleted;
  if (sentences.deleted.length) del.sentences = sentences.deleted;

  const update: { version: number; upsert?: typeof upsert; delete?: typeof del } = {
    version: newBundle.version,
  };
  if (Object.keys(upsert).length) update.upsert = upsert;
  if (Object.keys(del).length) update.delete = del;
  return update;
}

function main() {
  const [, , oldPath, newPath] = process.argv;
  if (!oldPath || !newPath) {
    console.error('Usage: make-update.ts <old.json> <new.json>');
    process.exit(1);
  }

  const oldBundle: ContentBundleLike = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  const newBundle: ContentBundleLike = JSON.parse(fs.readFileSync(newPath, 'utf8'));
  const update = computeDelta(oldBundle, newBundle);

  const hostDir = path.join(__dirname, '..', 'content-host');
  const updatesDir = path.join(hostDir, 'updates');
  fs.mkdirSync(updatesDir, { recursive: true });

  const updateFile = path.join(updatesDir, `${update.version}.json`);
  fs.writeFileSync(updateFile, JSON.stringify(update, null, 2));

  const manifestPath = path.join(hostDir, 'manifest.json');
  const manifest = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : { schemaVersion: newBundle.version, latestVersion: 0, updates: [] };
  manifest.latestVersion = update.version;
  manifest.updates = manifest.updates.filter((u: { version: number }) => u.version !== update.version);
  manifest.updates.push({ version: update.version, url: `updates/${update.version}.json` });
  manifest.updates.sort((a: { version: number }, b: { version: number }) => a.version - b.version);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`Wrote ${updateFile} and updated ${manifestPath}`);
}

if (require.main === module) {
  main();
}
