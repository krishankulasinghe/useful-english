import { pickDailySentences } from './dailySelector';
import type { SentenceItem } from './types';

describe('Daily Sentence Selector', () => {
  const dummySentences: SentenceItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: `s-${i}`,
    categoryId: i < 20 ? 's-work-office' : i < 35 ? 's-technology' : 's-everyday-conversations',
    en: `Sentence ${i}`,
    pronunciationSi: `සෙන්ටන්ස් ${i}`,
    meaningSi: `වාක්‍යය ${i}`,
    level: i % 3 === 0 ? 'beginner' : i % 3 === 1 ? 'intermediate' : 'advanced',
  }));

  it('returns exactly 10 sentences when available', () => {
    const selected = pickDailySentences(dummySentences, {
      date: '2026-10-04',
      level: 'beginner',
      goalId: 'workplace',
      count: 10,
    });
    expect(selected.length).toBe(10);
    const uniqueIds = new Set(selected.map((s) => s.id));
    expect(uniqueIds.size).toBe(10);
  });

  it('is deterministic for the same date and settings', () => {
    const run1 = pickDailySentences(dummySentences, {
      date: '2026-10-04',
      level: 'intermediate',
      goalId: 'workplace',
      subTrackId: 'it',
      count: 10,
    });
    const run2 = pickDailySentences(dummySentences, {
      date: '2026-10-04',
      level: 'intermediate',
      goalId: 'workplace',
      subTrackId: 'it',
      count: 10,
    });
    expect(run1.map((s) => s.id)).toEqual(run2.map((s) => s.id));
  });

  it('produces a different set on a different date', () => {
    const runDay1 = pickDailySentences(dummySentences, {
      date: '2026-10-04',
      level: 'beginner',
      goalId: 'workplace',
      count: 10,
    });
    const runDay2 = pickDailySentences(dummySentences, {
      date: '2026-10-05',
      level: 'beginner',
      goalId: 'workplace',
      count: 10,
    });
    expect(runDay1.map((s) => s.id)).not.toEqual(runDay2.map((s) => s.id));
  });
});
