jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { CONTENT_BASE_URL: 'https://content.example.com' } },
  },
}));

import { MemoryStore } from '../db/MemoryStore';
import { seedIfNeeded } from '../db/seed';
import type { SeedFile } from './schema';
import { applyUpdate, checkForUpdates } from './UpdateService';

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
      example: { en: 'Hello there.', pronunciationSi: 'x', meaningSi: 'y' },
    },
  ],
  sentences: [],
};

async function seededStore() {
  const store = new MemoryStore();
  await seedIfNeeded(store, seed);
  return store;
}

describe('applyUpdate', () => {
  it('upserts, deletes, rewrites categoryIds and bumps the version', async () => {
    const store = await seededStore();

    await applyUpdate(store, {
      version: 2,
      upsert: {
        vocabulary: [
          {
            id: 'w1',
            categoryIds: ['c1', 'c2'], // rewritten
            en: 'Hello!',
            pronunciationSi: 'හෙලෝ',
            meaningSi: 'ආයුබෝවන්',
            example: { en: 'Hello there.', pronunciationSi: 'x', meaningSi: 'y' },
          },
          {
            id: 'w2',
            categoryIds: ['c1'],
            en: 'World',
            pronunciationSi: 'වර්ල්ඩ්',
            meaningSi: 'ලෝකය',
            example: { en: 'World peace.', pronunciationSi: 'x', meaningSi: 'y' },
          },
        ],
      },
      delete: {
        sentences: ['s1'],
      },
    });

    const vocab = await store.getAllVocab();
    expect(vocab.map((v) => v.id).sort()).toEqual(['w1', 'w2']);
    expect(vocab.find((v) => v.id === 'w1')?.categoryIds).toEqual(['c1', 'c2']);
    expect(await store.getMeta('contentVersion')).toBe('2');
  });

  it('rolls back entirely if a write in the middle throws', async () => {
    const store = await seededStore();
    const before = await store.getAllVocab();

    await expect(
      store.withTransaction(async () => {
        await store.upsertVocab([{ ...seed.vocabulary[0], id: 'w2' }]);
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(await store.getAllVocab()).toEqual(before);
  });
});

describe('checkForUpdates', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  function mockFetchSequence(responses: unknown[]) {
    let call = 0;
    global.fetch = jest.fn(() => {
      const body = responses[call++];
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(body),
      }) as unknown as ReturnType<typeof fetch>;
    });
  }

  it('applies pending updates newer than contentVersion', async () => {
    const store = await seededStore();
    mockFetchSequence([
      { schemaVersion: 1, latestVersion: 2, updates: [{ version: 2, url: 'updates/2.json' }] },
      { version: 2, upsert: { vocabulary: [{ ...seed.vocabulary[0], id: 'w2' }] } },
    ]);

    const result = await checkForUpdates(store, { force: true });
    expect(result.applied).toEqual([2]);
    expect(await store.getMeta('contentVersion')).toBe('2');
  });

  it('skips everything when the manifest schemaVersion is newer than the app understands', async () => {
    const store = await seededStore();
    mockFetchSequence([{ schemaVersion: 99, latestVersion: 2, updates: [{ version: 2, url: 'updates/2.json' }] }]);

    const result = await checkForUpdates(store, { force: true });
    expect(result.skipped).toBe(true);
    expect(result.reason).toMatch(/schemaVersion/);
    expect(await store.getMeta('contentVersion')).toBe('1');
  });

  it('rolls back and does not bump the version when an update file is invalid', async () => {
    const store = await seededStore();
    mockFetchSequence([
      { schemaVersion: 1, latestVersion: 2, updates: [{ version: 2, url: 'updates/2.json' }] },
      { version: 2, upsert: { vocabulary: [{ id: 'w2' /* missing required fields */ }] } },
    ]);

    const result = await checkForUpdates(store, { force: true });
    expect(result.applied).toEqual([]);
    expect(await store.getMeta('contentVersion')).toBe('1');
  });
});
