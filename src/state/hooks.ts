import { useEffect, useMemo, useState } from 'react';

import { useContentContext } from '../content/ContentProvider';
import type { SavedItemType } from '../db/ContentStore';
import { ProgressRepo } from './progressRepo';

export function useProgressRepo(): ProgressRepo | null {
  const { store } = useContentContext();
  return useMemo(() => (store ? new ProgressRepo(store) : null), [store]);
}

export function useSaved(type: SavedItemType, id: string | undefined): boolean {
  const repo = useProgressRepo();
  const { contentRevision } = useContentContext();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!repo || !id) return;
    repo.isSaved(type, id).then((v) => {
      if (!cancelled) setSaved(v);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, type, id, contentRevision]);
  return saved;
}

export function useLearned(id: string | undefined): boolean {
  const repo = useProgressRepo();
  const { contentRevision } = useContentContext();
  const [learned, setLearned] = useState(false);
  useEffect(() => {
    let cancelled = false;
    if (!repo || !id) return;
    repo.isLearned(id).then((v) => {
      if (!cancelled) setLearned(v);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, id, contentRevision]);
  return learned;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useStreak(): number {
  const repo = useProgressRepo();
  const { contentRevision } = useContentContext();
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (!repo) return;
    repo.streak(todayKey()).then((v) => {
      if (!cancelled) setStreak(v);
    });
    return () => {
      cancelled = true;
    };
  }, [repo, contentRevision]);
  return streak;
}
