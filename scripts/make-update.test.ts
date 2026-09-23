import { computeDelta, type ContentBundleLike } from './make-update';

const oldBundle: ContentBundleLike = {
  version: 1,
  topics: [{ id: 't1' }],
  categories: [{ id: 'c1' }],
  vocabulary: [{ id: 'w1', en: 'Hello' } as any],
  sentences: [{ id: 's1' }],
};

describe('computeDelta', () => {
  it('upserts a new item', () => {
    const newBundle: ContentBundleLike = {
      ...oldBundle,
      version: 2,
      vocabulary: [...oldBundle.vocabulary, { id: 'w2', en: 'World' } as any],
    };
    const delta = computeDelta(oldBundle, newBundle);
    expect(delta.version).toBe(2);
    expect(delta.upsert?.vocabulary).toEqual([{ id: 'w2', en: 'World' }]);
    expect(delta.delete).toBeUndefined();
  });

  it('upserts a changed item', () => {
    const newBundle: ContentBundleLike = {
      ...oldBundle,
      version: 2,
      vocabulary: [{ id: 'w1', en: 'Hello!' } as any],
    };
    const delta = computeDelta(oldBundle, newBundle);
    expect(delta.upsert?.vocabulary).toEqual([{ id: 'w1', en: 'Hello!' }]);
  });

  it('deletes a removed item', () => {
    const newBundle: ContentBundleLike = { ...oldBundle, version: 2, sentences: [] };
    const delta = computeDelta(oldBundle, newBundle);
    expect(delta.delete?.sentences).toEqual(['s1']);
    expect(delta.upsert?.sentences).toBeUndefined();
  });

  it('produces no upsert/delete when nothing changed', () => {
    const newBundle: ContentBundleLike = { ...oldBundle, version: 2 };
    const delta = computeDelta(oldBundle, newBundle);
    expect(delta).toEqual({ version: 2 });
  });
});
