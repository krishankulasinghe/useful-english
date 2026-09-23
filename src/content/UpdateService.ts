import Constants from 'expo-constants';

import type { ContentStore } from '../db/ContentStore';
import { getContentVersion, getSchemaVersion } from '../db/seed';
import { manifestSchema, updateFileSchema, type UpdateFile } from './schema';
import { features } from '../config/features';

const FETCH_TIMEOUT_MS = 5000;
const CHECK_THROTTLE_MS = 6 * 60 * 60 * 1000; // 6h
const LAST_CHECK_KEY = 'lastUpdateCheckAt';

function getContentBaseUrl(): string {
  return (Constants.expoConfig?.extra?.CONTENT_BASE_URL as string | undefined) ?? '';
}

async function fetchJson(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Applies a single validated update file to the store, in one transaction.
// Upsert = INSERT OR REPLACE; vocab_categories rows are rewritten for
// upserted words (handled inside store.upsertVocab). Rolls back on failure.
export async function applyUpdate(store: ContentStore, update: UpdateFile): Promise<void> {
  await store.withTransaction(async () => {
    if (update.delete?.vocabulary?.length) await store.deleteVocab(update.delete.vocabulary);
    if (update.delete?.sentences?.length) await store.deleteSentences(update.delete.sentences);
    if (update.delete?.categories?.length) await store.deleteCategories(update.delete.categories);
    if (update.delete?.topics?.length) await store.deleteTopics(update.delete.topics);

    if (update.upsert?.topics?.length) await store.upsertTopics(update.upsert.topics);
    if (update.upsert?.categories?.length) await store.upsertCategories(update.upsert.categories);
    if (update.upsert?.vocabulary?.length) await store.upsertVocab(update.upsert.vocabulary);
    if (update.upsert?.sentences?.length) await store.upsertSentences(update.upsert.sentences);

    await store.setMeta('contentVersion', String(update.version));
  });
}

export interface CheckResult {
  applied: number[];
  skipped: boolean;
  reason?: string;
}

// Fetches the manifest, downloads and applies every update newer than the
// store's contentVersion in order. Skips everything if the manifest's
// schemaVersion is newer than this app understands. A failed update rolls
// back and is retried on the next check.
export async function checkForUpdates(
  store: ContentStore,
  opts: { force?: boolean; now?: () => number } = {},
): Promise<CheckResult> {
  const now = opts.now ?? Date.now;
  const baseUrl = getContentBaseUrl();
  if (!features.remoteContent || !baseUrl) {
    return { applied: [], skipped: true, reason: 'no CONTENT_BASE_URL' };
  }

  if (!opts.force) {
    const lastCheck = await store.getMeta(LAST_CHECK_KEY);
    if (lastCheck && now() - Number(lastCheck) < CHECK_THROTTLE_MS) {
      return { applied: [], skipped: true, reason: 'throttled' };
    }
  }

  const applied: number[] = [];
  let failure: string | undefined;
  try {
    const manifestRaw = await fetchJson(`${baseUrl}/manifest.json`);
    const manifest = manifestSchema.parse(manifestRaw);

    const appSchemaVersion = await getSchemaVersion(store);
    if (manifest.schemaVersion > appSchemaVersion) {
      return { applied: [], skipped: true, reason: 'schemaVersion too new' };
    }

    const currentVersion = await getContentVersion(store);
    const pending = manifest.updates
      .filter((u) => u.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    for (const entry of pending) {
      try {
        const updateRaw = await fetchJson(`${baseUrl}/${entry.url}`);
        const update = updateFileSchema.parse(updateRaw);
        await applyUpdate(store, update);
        applied.push(update.version);
      } catch (err) {
        // This update (and any after it) rolls back and retries next check.
        failure = err instanceof Error ? err.message : String(err);
        break;
      }
    }
  } catch (err) {
    failure = err instanceof Error ? err.message : String(err);
  } finally {
    await store.setMeta(LAST_CHECK_KEY, String(now()));
  }

  return { applied, skipped: false, reason: failure };
}
