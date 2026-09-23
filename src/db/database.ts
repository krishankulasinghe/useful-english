import type { ContentStore } from './ContentStore';
import { SqliteStore } from './SqliteStore';

let storePromise: Promise<ContentStore> | null = null;

// Opens (once) and returns the app's real SQLite-backed content store.
export function getContentStore(): Promise<ContentStore> {
  if (!storePromise) {
    storePromise = SqliteStore.open();
  }
  return storePromise;
}
