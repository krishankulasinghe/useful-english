import { MemoryStore } from './MemoryStore';
import { getContentVersion, getSchemaVersion, seedIfNeeded } from './seed';
import { seedFileSchema, type SeedFile } from '../content/schema';
import realContent from '../../assets/content/content.json';

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

  it('filters sentences by category and level', async () => {
    const store = new MemoryStore();
    await seedIfNeeded(store, {
      ...seed,
      sentences: [
        { id: 's1', categoryId: 'c1', en: 'Hi', pronunciationSi: 'හායි', meaningSi: 'හායි', level: 'beginner' },
        { id: 's2', categoryId: 'c1', en: 'Good morning', pronunciationSi: 'ගුඩ් මෝනින්', meaningSi: 'සුබ උදෑසනක්', level: 'intermediate' },
        { id: 's3', categoryId: 'c2', en: 'Thank you', pronunciationSi: 'තෑන්ක් යූ', meaningSi: 'ස්තුතියි', level: 'beginner' },
      ],
    });

    const c1All = await store.getSentencesByCategory('c1');
    expect(c1All).toHaveLength(2);

    const c1Beginner = await store.getSentencesByCategory('c1', 'beginner');
    expect(c1Beginner).toHaveLength(1);
    expect(c1Beginner[0].id).toBe('s1');

    const c1Intermediate = await store.getSentencesByCategory('c1', 'intermediate');
    expect(c1Intermediate).toHaveLength(1);
    expect(c1Intermediate[0].id).toBe('s2');

    const c2All = await store.getSentencesByCategory('c2');
    expect(c2All).toHaveLength(1);
    expect(c2All[0].id).toBe('s3');
  });

  it('validates real bundled content.json and seeds successfully', async () => {
    const parsed = seedFileSchema.parse(realContent);
    expect(parsed.sentences.length).toBeGreaterThan(5000);

    const store = new MemoryStore();
    const seeded = await seedIfNeeded(store, parsed);
    expect(seeded).toBe(true);

    const convSentences = await store.getSentencesByCategory('s-everyday-conversations');
    expect(convSentences.length).toBeGreaterThan(1000);

    const questions = await store.getSentencesByCategory('s-asking-questions');
    expect(questions.length).toBeGreaterThan(100);
  });
});
