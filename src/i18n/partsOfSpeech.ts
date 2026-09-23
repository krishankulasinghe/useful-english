// Bilingual "verb · ක්‍රියා පදය" labels for the Word Detail part-of-speech chip.
const partOfSpeechSi: Record<string, string> = {
  noun: 'නාම පදය',
  verb: 'ක්‍රියා පදය',
  adjective: 'විශේෂණ පදය',
  adverb: 'ක්‍රියා විශේෂණය',
  pronoun: 'සර්වනාමය',
  preposition: 'පූර්ව පදය',
  conjunction: 'සංයෝජකය',
  interjection: 'උද්ගාරය',
};

export function partOfSpeechLabel(pos: string): string {
  const si = partOfSpeechSi[pos.toLowerCase()];
  return si ? `${pos} · ${si}` : pos;
}
