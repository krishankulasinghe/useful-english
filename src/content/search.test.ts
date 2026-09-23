import { search } from './search';
import type { Category, SentenceItem, Topic, VocabItem } from './types';

const topics: Topic[] = [{ id: 't1', type: 'vocabulary', en: 'Grammar', si: 'ව්‍යාකරණ', icon: 'text', order: 0 }];
const categories: Category[] = [{ id: 'c1', topicId: 't1', en: 'Verbs', si: 'ක්‍රියා පද', order: 0 }];
const words: VocabItem[] = [
  {
    id: 'reach',
    categoryIds: ['c1'],
    en: 'Reach',
    pronunciationSi: 'රීච්',
    meaningSi: 'ළඟා වෙනවා',
    example: { en: 'I reached home.', pronunciationSi: 'x', meaningSi: 'y' },
  },
];
const sentences: SentenceItem[] = [
  {
    id: 's1',
    categoryId: 'c1',
    en: 'Could you give me a minute?',
    pronunciationSi: 'කුඩ් යූ ගිව් මී අ මිනිට්?',
    meaningSi: 'මට විනාඩියක් දෙන්න පුළුවන්ද?',
    level: 'beginner',
  },
];

const scope = { topics, categories, words, sentences };

describe('search', () => {
  it('finds a word by English input', () => {
    const result = search('reach', scope);
    expect(result.words.map((w) => w.id)).toEqual(['reach']);
  });

  it('finds a word by Sinhala pronunciation input', () => {
    const result = search('රීච්', scope);
    expect(result.words.map((w) => w.id)).toEqual(['reach']);
  });

  it('finds a sentence by Sinhala meaning input', () => {
    const result = search('විනාඩියක්', scope);
    expect(result.sentences.map((s) => s.id)).toEqual(['s1']);
  });

  it('finds a category by name', () => {
    const result = search('verbs', scope);
    expect(result.categories.map((c) => c.id)).toEqual(['c1']);
  });

  it('is case-insensitive', () => {
    const result = search('REACH', scope);
    expect(result.words.map((w) => w.id)).toEqual(['reach']);
  });

  it('returns nothing for an empty query', () => {
    expect(search('', scope)).toEqual({ categories: [], words: [], sentences: [] });
  });
});
