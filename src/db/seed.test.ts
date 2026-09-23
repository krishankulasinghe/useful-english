import { MemoryStore } from './MemoryStore';
import { getContentVersion, getSchemaVersion, seedIfNeeded } from './seed';
import type { SeedFile } from '../content/schema';

const seed: SeedFile = {
  version: 1,
  schemaVersion: 1,
  topics: [{ id: 't1', type: 'vocabulary', en: 'Topic', si: 'මාතෘකාව', icon: 'text', order: 0 }],
  categories: [{ id: 'c1', topicId: 't1', en: 'Category', si: 'කාණ්ඩය', order: 0 }],
  vocabulary: [
    {
      id: 'w1',
      categoryIds: ['c1'],
      en: 'Hello',
      pronunciationSi: 'හෙලෝ',
      meaningSi: 'ආයුබෝවන්',
      example: { en: 'Hello there.', pronunciationSi: 'හෙලෝ දෙයා', meaningSi: 'ආයුබෝවන් එහෙනම්' },
    },
  ],
  sentences: [
    {
      id: 's1',
      categoryId: 'c1',
      en: 'How are you?',
      pronunciationSi: 'හව්ආ යූ?',
      meaningSi: 'කොහොමද?',
      level: 'beginner',
    },
  ],
};

describe('seedIfNeeded', () => {
  it('inserts the bundled content on first launch', async () => {
    const store = new MemoryStore();
    await seedIfNeeded(store, seed);

    expect(await store.getAllTopics()).toHaveLength(1);
    expect(await store.getAllCategories()).toHaveLength(1);
    expect(await store.getAllVocab()).toHaveLength(1);
    expect(await store.getAllSentences()).toHaveLength(1);
    expect(await getContentVersion(store)).toBe(1);
    expect(await getSchemaVersion(store)).toBe(1);
  });

  it('is idempotent: does nothing on a second call', async () => {
    const store = new MemoryStore();
    await seedIfNeeded(store, seed);
    await seedIfNeeded(store, { ...seed, vocabulary: [...seed.vocabulary, { ...seed.vocabulary[0], id: 'w2' }] });

    // The second (different) seed was ignored because contentVersion already existed.
    expect(await store.getAllVocab()).toHaveLength(1);
  });
});
