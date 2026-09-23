// Consecutive days of activity ending today or yesterday (a missed day
// today doesn't reset the streak until tomorrow). `days` are "YYYY-MM-DD"
// strings, not necessarily sorted or deduplicated.
export function computeStreak(days: string[], today: string): number {
  const set = new Set(days);
  const toDate = (s: string) => new Date(`${s}T00:00:00Z`);
  const toKey = (d: Date) => d.toISOString().slice(0, 10);

  let cursor = toDate(today);
  if (!set.has(toKey(cursor))) {
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
    if (!set.has(toKey(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(toKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}
