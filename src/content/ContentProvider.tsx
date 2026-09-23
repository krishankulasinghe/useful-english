import React, { createContext, useContext, useEffect, useState } from 'react';

import type { ContentStore } from '../db/ContentStore';
import { getContentStore } from '../db/database';
import { seedIfNeeded } from '../db/seed';
import seedData from '../../assets/content/content.json';
import { seedFileSchema } from './schema';
import { checkForUpdates } from './UpdateService';
import { ContentRepository } from './ContentRepository';

export interface ContentContextValue {
  ready: boolean;
  store: ContentStore | null;
  repository: ContentRepository | null;
  // Bumped whenever content changes underneath (seed, remote update, or a
  // local write). Screens' hooks re-query when this changes.
  contentRevision: number;
  refresh: () => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<ContentStore | null>(null);
  const [repository, setRepository] = useState<ContentRepository | null>(null);
  const [ready, setReady] = useState(false);
  const [contentRevision, setContentRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getContentStore();
      const seed = seedFileSchema.parse(seedData);
      await seedIfNeeded(s, seed);
      if (cancelled) return;
      setStore(s);
      setRepository(new ContentRepository(s));
      setReady(true);

      const result = await checkForUpdates(s);
      if (!cancelled && !result.skipped && result.applied.length > 0) {
        setContentRevision((r) => r + 1);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = () => setContentRevision((r) => r + 1);

  return (
    <ContentContext.Provider value={{ ready, store, repository, contentRevision, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContentContext(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContentContext must be used within a ContentProvider');
  return ctx;
}
