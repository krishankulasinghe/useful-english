// Normalised, lowercase, NFC text with zero-width joiners/non-joiners
// stripped, for LIKE %q% search over English and Sinhala.
export function normalizeSearchText(...parts: (string | undefined)[]): string {
  return parts
    .filter((p): p is string => !!p)
    .join(' ')
    .normalize('NFC')
    .replace(/[‌‍]/g, '')
    .toLowerCase()
    .trim();
}
