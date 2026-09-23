import { normalizeSearchText } from './normalize';
import type { Category, SentenceItem, Topic, VocabItem } from './types';

export interface SearchResult {
  categories: Category[];
  words: VocabItem[];
  sentences: SentenceItem[];
}

function vocabSearchText(v: VocabItem): string {
  return normalizeSearchText(v.en, v.pronunciationSi, v.meaningSi, v.example.en, v.example.meaningSi);
}
function sentenceSearchText(s: SentenceItem): string {
  return normalizeSearchText(s.en, s.pronunciationSi, s.meaningSi);
}
function categorySearchText(c: Category): string {
  return normalizeSearchText(c.en, c.si, c.shortEn);
}

export interface SearchScope {
  topics: Topic[];
  categories: Category[];
  words: VocabItem[];
  sentences: SentenceItem[];
}

// Accepts English or Sinhala input; searches category names, words and
// sentences. `topicType` narrows to vocabulary or sentences (e.g. the Words
// tab only searches vocabulary-topic categories and words).
export function search(query: string, scope: SearchScope, topicType?: 'vocabulary' | 'sentences'): SearchResult {
  const q = normalizeSearchText(query);
  if (!q) return { categories: [], words: [], sentences: [] };

  const topicIds = new Set(
    (topicType ? scope.topics.filter((t) => t.type === topicType) : scope.topics).map((t) => t.id),
  );

  const categories = scope.categories.filter(
    (c) => topicIds.has(c.topicId) && categorySearchText(c).includes(q),
  );

  const words =
    topicType === 'sentences' ? [] : scope.words.filter((v) => vocabSearchText(v).includes(q));

  const sentences =
    topicType === 'vocabulary' ? [] : scope.sentences.filter((s) => sentenceSearchText(s).includes(q));

  return { categories, words, sentences };
}
