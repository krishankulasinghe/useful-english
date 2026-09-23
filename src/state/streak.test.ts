import { computeStreak } from './streak';

describe('computeStreak', () => {
  it('is 0 with no activity', () => {
    expect(computeStreak([], '2026-09-23')).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    const days = ['2026-09-21', '2026-09-22', '2026-09-23'];
    expect(computeStreak(days, '2026-09-23')).toBe(3);
  });

  it('still counts the streak if today has no activity yet, but yesterday does', () => {
    const days = ['2026-09-21', '2026-09-22'];
    expect(computeStreak(days, '2026-09-23')).toBe(2);
  });

  it('resets to 0 if the last activity was more than a day ago', () => {
    const days = ['2026-09-20'];
    expect(computeStreak(days, '2026-09-23')).toBe(0);
  });

  it('stops counting at the first gap', () => {
    const days = ['2026-09-18', '2026-09-21', '2026-09-22', '2026-09-23'];
    expect(computeStreak(days, '2026-09-23')).toBe(3);
  });
});
