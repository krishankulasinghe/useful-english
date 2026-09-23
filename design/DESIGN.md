# Sin-Eng — English for Sinhala speakers: design handoff

This folder is the approved UI design for the app. Build the app to match it.

- `screens/*.dc.html` — one file per screen (390×844 phone frames; some are drawn taller to show the full scroll). They are **reference markup**: all styling is inline CSS, so read them for exact colors, sizes, spacing and copy. Ignore the design-tool runtime bits (`<x-dc>`, `<helmet>`, `<sc-for>`, `<sc-if>`, `{{holes}}`, `class Component extends DCLogic`, `support.js`) — treat `<sc-for>` as a list, `<sc-if>` as a conditional, and the `renderVals()` arrays as sample data.
- `screens/canvas.json` — the canvas layout (which screen is which, grouped in rows).
- `content.sample.json` — the full category taxonomy plus sample vocabulary and sentences, in the shape the app should consume.

Live, clickable design: https://claude.ai/artifact/TWzj7wusu6Wd6PgH4Y5241 (owner-only link).

## 1. Product in one paragraph

A friendly, premium, simple English-learning app for Sinhala speakers of every level (school students to older adults). Every item is shown as a trio: **English → Sinhala pronunciation → Sinhala meaning**, plus an example sentence in the same trio. Two content types: **Vocabulary** and **Useful Sentences**. Content must be data-driven so words, sentences and categories can be added often without an app release. Phase 1 is text only; Phase 2 adds English audio playback.

## 2. Design tokens

Colors (use these names in code):

| Token | Hex | Use |
|---|---|---|
| `bg` | `#F7F4EE` | App background (warm ivory) |
| `surface` | `#FFFFFF` | Cards, nav bar, inputs |
| `ink` | `#16181D` | Primary text, English words, dark buttons |
| `ink2` | `#3B3F48` | Secondary body text |
| `muted` | `#5B606B` | Captions, inactive tabs, chevrons |
| `muted2` | `#6B707A` | Preview lines, placeholders |
| `line` | `#E7E1D6` | Input/button borders, nav top border |
| `cardBorder` | `#EEE8DD` | Card borders |
| `divider` | `#F0EBE2` | Row dividers inside grouped lists |
| `neutralFill` | `#EEEAE2` | Segmented-control track, neutral chips |
| `dashed` | `#CFC7B8` | Off switch track, inactive dots, dashed borders |
| `primary` (teal) | `#0E5A52` | Primary buttons, active tab, **Sinhala meaning text** |
| `primaryDark` | `#0A443E` | Pressed/hover, labels on teal tint |
| `primaryTint` | `#E3F0EC` | Teal tiles, meaning panel, active tab pill |
| `primaryTint2` | `#F1F8F6` | Selected option card background |
| `saffron` | `#9A5409` | **Sinhala pronunciation text**, streak |
| `saffronDark` | `#7A4307` | Labels on saffron tint |
| `saffronTint` | `#FBEEDC` | Saffron tiles, pronunciation panel |

**The colour rule that must hold everywhere:** English = `ink` (serif display font for single words), Sinhala pronunciation = `saffron`, Sinhala meaning = `primary` teal. Users learn to read the trio by colour.

Typography (Google Fonts):
- Display / English words: **Fraunces** 600 (word detail 58px, word of the day 46px, flashcard 52px, screen titles 28–32px, list words 23px).
- UI / body: **Plus Jakarta Sans** 400–700 (body 16–17px, captions 12–14px, section labels 12px 700 with 0.04–0.08em letter-spacing).
- Sinhala: **Noto Sans Sinhala** 400–700 (fallback in the same font stack). Meaning 16–28px, pronunciation 15–30px. Body line-height 1.45; never shrink Sinhala below 12.5px.
- Settings offers Small / Normal / Large text — implement type sizes as a scale that multiplies.

Shape & depth: cards radius 18–24px, buttons fully rounded (height 50–56px), tiles 44–48px with radius 14–15px, inputs 52px tall radius 16px. Shadows are subtle: `0 1px 2px rgba(22,24,29,.04), 0 10px 30px rgba(22,24,29,.06)` on hero cards only; most cards use a 1px `cardBorder` instead. Screen side padding 20px; gaps 10–16px.

Accessibility: touch targets ≥ 44px; icon-only buttons have labels; switches are real switches (`role="switch"`); text contrast ≥ 4.5:1. No emoji; icons are 1.8px stroke line icons (Lucide/Feather style).

## 3. Navigation

Bottom tab bar (5 tabs, 84px tall, white): **Home · Words · Sentences · Practice · Settings**. Active tab = teal label + teal-tint pill (56×30) behind the icon. Pushed screens (word list, word detail, sentence list, topic) show a round 44px back button top-left; word detail hides the tab bar and shows a bottom action bar.

First launch: Splash → Onboarding 1 (welcome) → 2 (level) → 3 (daily goal + reminder) → Home. Every onboarding step has Skip.

## 4. Screens (file → purpose)

| File | Screen | Notes |
|---|---|---|
| `Splash.dc.html` | Splash | Teal full-bleed, “A + අ” mark, “Sin-Eng” wordmark (working name), tagline EN + SI |
| `Onboarding1.dc.html` | Welcome | Illustration of the word trio card, headline + Sinhala explanation, step dots, Next |
| `Onboarding2.dc.html` | Choose level | Radio cards Beginner/Intermediate/Advanced with Sinhala descriptions; default Beginner |
| `Onboarding3.dc.html` | Daily goal | 5 / 10 / 20 words a day (default 10) + daily reminder switch (default on, 7:30 PM) |
| `Main.dc.html` | Home | Greeting, streak pill, profile button → Settings, Word of the day card, Vocabulary/Sentences entry cards, Continue learning row |
| `Vocabulary.dc.html` | Words tab (**Option A — chosen default**) | Search + 5 topic rows (icon tile, EN, SI, preview line) |
| `VocabularyCarousel.dc.html` | Words tab, **Option B** (alternative, not decided) | Topic sections with horizontally scrolling category cards + See all |
| `VocabCollection.dc.html` | Topic → categories | 2-column grid of category cards (letter tile, EN, SI) |
| `WordList.dc.html` | Category → words | Rows: English (serif) + pronunciation inline, meaning below; learned check; “Practice these words” CTA |
| `Detail.dc.html` | Word detail (Phase 1) | Big word, part-of-speech chip, pronunciation panel (saffron tint), meaning panel (teal tint), example card, verb forms chips, bottom bar: I know it / Next word |
| `DetailAudio.dc.html` | Word detail (Phase 2) | Adds 68px Listen button, Normal/Slow speed toggle, Listen on the example |
| `Sentences.dc.html` | Sentences tab | Search + 7 situation groups (same row pattern as Vocabulary Option A) |
| `SentenceList.dc.html` | Group → sentences | Underline tabs for the situations in the group; level filter button in header; sentence cards with level chip, save, copy |
| `Practice.dc.html` | Practice tab | Flashcards; direction toggle EN→SI / SI→EN; reveal; Still learning / I know this; progress bar |
| `Settings.dc.html` | Settings tab | Profile card, Saved words & sentences, level, goal, reminder, text size, show pronunciation, show meaning, dark mode, app language EN/SI, auto-play audio (Coming soon), support links, version |

Difficulty chips: Beginner = teal tint / `primaryDark` text; Intermediate = saffron tint / `saffronDark`; Advanced = `ink` fill / white text. Labels are bilingual (Beginner · ආරම්භක, Intermediate · මධ්‍යම, Advanced · උසස්).

## 5. Content model

See `content.sample.json`. Summary:

```ts
type Level = 'beginner' | 'intermediate' | 'advanced';

interface Topic      { id: string; type: 'vocabulary' | 'sentences'; en: string; si: string; icon: string; order: number; }
interface Category   { id: string; topicId: string; en: string; si: string; order: number; }

interface VocabItem {
  id: string; categoryIds: string[];
  en: string; pronunciationSi: string; meaningSi: string;
  partOfSpeech?: string; forms?: string[];            // e.g. reach, reached, reached, reaching
  example: { en: string; pronunciationSi: string; meaningSi: string; highlight?: string };
  level?: Level; audioUrl?: string;                    // audio = Phase 2
}

interface SentenceItem {
  id: string; categoryId: string;
  en: string; pronunciationSi: string; meaningSi: string;
  level: Level; audioUrl?: string;
}
```

Topics and categories are data, not code: adding a new category must not need an app release. Categories may belong to a topic; a vocab item may appear in several categories.

User state (local first, sync later): level, daily goal, reminder time, text size, show-pronunciation, show-meaning, theme, app language, saved item ids, learned word ids, streak.

## 6. Behaviour notes

- Search accepts English or Sinhala input and searches words, sentences and category names.
- “Show Sinhala meaning” off = self-test mode: meanings hidden until tapped.
- Practice uses the current category (or saved words) as the deck; “I know this” marks learned.
- Phase 2 audio: English only, normal and 0.75× speed, optional auto-play (setting already in the design as “Coming soon”).
- Sample names/numbers in the design (Kasun, 5-day streak, counts) are placeholders. Sinhala translations and pronunciations in the samples need native-speaker review before release.
