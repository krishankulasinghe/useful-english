// UI strings keyed by app language. Sinhala UI translation is a TODO
// (see docs/IMPLEMENTATION_PLAN.md "Open items"); `si` falls back to `en`
// for now — this file only covers chrome text, not bilingual content.
const en = {
  tabHome: 'Home',
  tabWords: 'Words',
  tabSentences: 'Sentences',
  tabPractice: 'Practice',
  tabSettings: 'Settings',
  skip: 'Skip',
  next: 'Next',
  back: 'Back',
  save: 'Save',
  continue: 'Continue',
};

export type StringKey = keyof typeof en;

const si: Record<StringKey, string> = { ...en };

export const strings = { en, si };
