// Plus Jakarta Sans and Fraunces have no Sinhala glyphs. Many caller-supplied
// strings in this app mix scripts in one string (e.g. "Verbs · ක්‍රියා පද",
// "Continue · ඉදිරියට"), so components pick the right family per-string
// instead of hardcoding one, keeping Sinhala glyphs on Noto Sans Sinhala.
const SINHALA_RANGE = /[඀-෿]/;

export function containsSinhala(value: string): boolean {
  return SINHALA_RANGE.test(value);
}

export function fontForText(value: string, latinFamily: string, sinhalaFamily: string): string {
  return containsSinhala(value) ? sinhalaFamily : latinFamily;
}
