import { useEffect, useState } from 'react';

import { useContentContext } from './ContentProvider';
import { search as runSearch, type SearchResult } from './search';
import type { Category, Level, SentenceItem, Topic, VocabItem } from './types';
import { pickWordOfTheDay } from './wordOfDay';

function useAsync<T>(fn: () => Promise<T> | undefined, deps: unknown[], initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    let cancelled = false;
    const result = fn();
    if (result === undefined) return;
    result.then((v) => {
      if (!cancelled) setValue(v);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

export function useTopics(type?: 'vocabulary' | 'sentences'): Topic[] {
  const { repository, contentRevision } = useContentContext();
  return useAsync(() => repository?.getTopics(type), [repository, contentRevision, type], []);
}

export function useTopic(id: string | undefined): Topic | undefined {
  const { repository, contentRevision } = useContentContext();
  return useAsync(() => (id ? repository?.getTopic(id) : undefined), [repository, contentRevision, id], undefined);
}

export function useCategories(topicId: string | undefined): Category[] {
  const { repository, contentRevision } = useContentContext();
  return useAsync(() => repository?.getCategories(topicId), [repository, contentRevision, topicId], []);
}

export function useCategory(id: string | undefined): Category | undefined {
  const { repository, contentRevision } = useContentContext();
  return useAsync(() => (id ? repository?.getCategory(id) : undefined), [repository, contentRevision, id], undefined);
}

export function useWords(categoryId: string | undefined): VocabItem[] {
  const { repository, contentRevision } = useContentContext();
  return useAsync(() => (categoryId ? repository?.getWords(categoryId) : undefined), [repository, contentRevision, categoryId], []);
}

export function useWord(id: string | undefined): VocabItem | undefined {
  const { repository, contentRevision } = useContentContext();
  return useAsync(() => (id ? repository?.getWord(id) : undefined), [repository, contentRevision, id], undefined);
}

export function useSentences(categoryId: string | undefined, level?: Level): SentenceItem[] {
  const { repository, contentRevision } = useContentContext();
  return useAsync(
    () => (categoryId ? repository?.getSentences(categoryId, level) : undefined),
    [repository, contentRevision, categoryId, level],
    [],
  );
}

const EMPTY_SEARCH: SearchResult = { categories: [], words: [], sentences: [] };

export function useSearch(query: string, scope?: 'vocabulary' | 'sentences'): SearchResult {
  const { repository, contentRevision } = useContentContext();
  return useAsync(
    async () => {
      if (!repository) return EMPTY_SEARCH;
      const [topics, categories, words, sentences] = await Promise.all([
        repository.getTopics(),
        repository.getCategories(),
        repository.getAllVocab(),
        repository.getAllSentences(),
      ]);
      return runSearch(query, { topics, categories, words, sentences }, scope);
    },
    [repository, contentRevision, query, scope],
    EMPTY_SEARCH,
  );
}

export function useWordOfTheDay(date: string, level?: Level): VocabItem | undefined {
  const { repository, contentRevision } = useContentContext();
  return useAsync(
    async () => {
      if (!repository) return undefined;
      const vocab = await repository.getAllVocab();
      return pickWordOfTheDay(date, level, vocab);
    },
    [repository, contentRevision, date, level],
    undefined,
  );
}
