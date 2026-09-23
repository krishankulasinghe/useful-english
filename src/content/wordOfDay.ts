import type { Level, VocabItem } from './types';

// Deterministic string hash (djb2).
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

// Picks the same word for a given date across app opens, preferring the
// user's level when any word at that level exists.
export function pickWordOfTheDay(date: string, level: Level | undefined, vocab: VocabItem[]): VocabItem | undefined {
  if (vocab.length === 0) return undefined;
  const preferred = level ? vocab.filter((v) => v.level === level) : [];
  const pool = preferred.length > 0 ? preferred : vocab;
  const index = hash(date) % pool.length;
  return pool[index];
}
