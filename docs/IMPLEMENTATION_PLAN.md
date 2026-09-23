# Sin-Eng mobile app — Phase 1 implementation plan

## Context
The repo has only `design/`: the approved UI handoff (`DESIGN.md`, `content.sample.json`, and 15 `screens/*.dc.html` reference frames at 390×844). We are building the Phase 1 app (text only) as an **Expo + React Native (TypeScript)** app for iOS and Android. It must match the screen files' colours, spacing and copy exactly. Content must be data-driven: it ships bundled in the app, and small update files from a static host add or change content without an app release. Phase 2 audio gets hooks now but no working UI.

Decisions already made:
- Stack: Expo SDK (latest) + expo-router + TypeScript.
- Storage: **SQLite on the phone** (expo-sqlite) for content and progress, filled from the bundled JSON on first launch. **Only changes come from the backend**: a static host serves `manifest.json` plus numbered update files. Settings are stored in AsyncStorage. Nothing is uploaded.
- Ads: AdMob (react-native-google-mobile-ads). An adaptive **banner on every app page** (Splash and Onboarding excluded, per AdMob policy on loading screens) and an **interstitial after a finished Practice deck**, with a frequency cap. This requires an Expo dev build; Expo Go won't work.
- Dark mode and app language: the switches save their state, but the behaviour is stubbed. The theme has a dark slot, and UI strings live in an i18n file.
- No user name. The greeting has no name, and the avatar shows an icon instead of a letter.
- All user data is stored locally on the phone. Nothing is synced.
- Reminder switch: saves state only, no notifications yet. The Saved screen is a minimal list built from existing components.

---

## 1. Project structure
```
Lexi/
  app.config.ts              # name "Sin-Eng", splash bg #0E5A52, extra.CONTENT_BASE_URL (empty = no remote),
                             # AdMob app IDs + ad unit IDs (from env; TestIds in dev), plugins
  eas.json                   # development / preview / production build profiles (dev client)
  package.json  tsconfig.json  babel.config.js  jest.config.js
  assets/
    fonts/                   # Fraunces 500/600/700, PlusJakartaSans 400–700, NotoSansSinhala 400–700
    content/content.json     # seed: copy of design/content.sample.json + "version": 1, "schemaVersion": 1
  content-host/              # what you upload to the static host (example)
    manifest.json            # { "schemaVersion": 1, "latestVersion": 2, "updates": [{ "version": 2, "url": "updates/2.json" }] }
    updates/2.json           # delta: { "version": 2, "upsert": {topics,categories,vocabulary,sentences}, "delete": {…ids} }
  app/                       # expo-router routes (see §3)
  src/
    theme/  tokens.ts  typography.ts  shadows.ts  ThemeProvider.tsx  useTheme.ts
    components/              # shared UI (see Step 1)
    icons/  paths.ts  Icon.tsx   # exact SVG path strings copied from the screen files
    db/      database.ts (open + migrations)  schema.sql.ts  seed.ts
    content/ types.ts  schema.ts(zod)  ContentRepository.ts (SQLite queries)  UpdateService.ts
             ContentProvider.tsx  hooks.ts  search.ts
    state/   settingsStore.ts (zustand + persist → AsyncStorage)  progressRepo.ts (SQLite: saved, learned, activity)
    ads/     AdsProvider.tsx (consent + init)  AdBanner.tsx  interstitial.ts  adUnits.ts
    audio/   AudioService.ts (interface + NoopAudioService)  useAudio.ts   # Phase 2 hook
    i18n/    strings.ts (en + si keys; si = en for now)  useT.ts
    config/  features.ts  ({ audio: false, darkMode: false, remoteContent: true })
  design/                    # untouched
```

## 2. Design tokens / theme (`src/theme/tokens.ts`)
- `colors.light`: the 18 DESIGN.md tokens, using the exact names (`bg, surface, ink, ink2, muted, muted2, line, cardBorder, divider, neutralFill, dashed, primary, primaryDark, primaryTint, primaryTint2, saffron, saffronDark, saffronTint`). Plus these extras found in the screen files: `white #FFFFFF`, `splashMarkSi #B8660B`, `splashText #CFE8E1`, `listenBorder #CFE3DD` (Phase 2), `progressTrack = line`.
- `colors.dark`: same keys, holding placeholder values copied from light. It is gated by `features.darkMode=false`.
- Semantic trio aliases (these enforce the colour rule): `trio.en = ink`, `trio.pron = saffron`, `trio.meaning = primary`.
- `level` chip map: beginner `{bg: primaryTint, fg: primaryDark}`, intermediate `{saffronTint, saffronDark}`, advanced `{ink, white}`, each with bilingual labels.
- `space`: 2,4,6,8,10,12,14,16,18,20,22,24,28,32; `screenPadding = 20`.
- `radius`: 10,11,12,14,15,16,18,20,22,24,28,32, `pill = 999`.
- `shadows`: `hero` (0 1 2 .04 + 0 10 30 .06), `flashcard` (0 14 40 .08), `segment` (0 1 3 .10), `knob` (0 1 2 rgba(0,0,0,.2)), `lift` (0 18 40 .10 for the onboarding card), `splashMark` (0 18 40 rgba(0,0,0,.18)). These are converted to iOS shadow* props and Android `elevation`.
- `typography.ts`: named styles, each with `family, size, weight, lineHeight, letterSpacing`. Examples: `wordDetail 58`, `wordOfDay 46`, `flashcard 52`, `title32`, `title28`, `navTitle24`, `listWord 23`, `body17/16`, `caption14/13/12`, `sectionLabel 12/700/0.04–0.08em`, `tab 12`. A `scale(textSize)` helper multiplies sizes by S 0.875 / M 1 / L 1.15 and clamps Sinhala text to ≥ 12.5. Letter-spacing em values are converted to px.
- Fonts are chosen by script. `<Text lang="si">` uses NotoSansSinhala. English display text uses Fraunces_600SemiBold, and UI text uses PlusJakartaSans_*.

## 3. Navigation (expo-router)
```
app/_layout.tsx            fonts + ContentProvider + ThemeProvider; SplashScreen gate
app/index.tsx              → /splash
app/splash.tsx             teal Splash; after load (≥1.2s) or on tap → onboarded ? /(tabs)/home : /onboarding/welcome
app/onboarding/_layout.tsx Stack, no header, no gesture back on welcome
  welcome.tsx  level.tsx  goal.tsx      (level/goal also accept ?mode=edit, opened from Settings)
app/(tabs)/_layout.tsx     Tabs with custom <TabBar/> (5 tabs)
  home/index.tsx
  words/_layout.tsx (Stack) → index.tsx (Option A), topic/[topicId].tsx, category/[categoryId].tsx
  sentences/_layout.tsx (Stack) → index.tsx, [topicId].tsx (SentenceList, ?categoryId=)
  practice/index.tsx       (?deck=category:<id> | saved)
  settings/_layout.tsx (Stack) → index.tsx, saved.tsx
app/word/[wordId].tsx      root-level stack screen → tab bar hidden, bottom action bar
```
- Pushed screens use the shared `BackButton` (44px round), not a native header. Headers are hidden everywhere.
- Every onboarding step has Skip, which sets `onboarded=true` and goes to `router.replace('/(tabs)/home')`. Onboarding 3 has no Skip in the design (it shows an empty 44px spacer). I'll match the design.

## 4. Data storage & content updates

**Where each kind of data lives**

| Data | Store | Why |
|---|---|---|
| Topics, categories, words, sentences | SQLite (`expo-sqlite`), file `sineng.db` | Scales to thousands of items; indexed queries and search; updates applied row by row |
| Saved ids, learned ids, activity dates | SQLite tables `saved`, `learned`, `activity` | Grows over time; the queries join with content |
| Settings (level, goal, reminder, text size, toggles, onboarded, direction) | AsyncStorage via zustand `persist` | Small key-value data that screens read synchronously |

**SQLite schema (migration 1)**
- `meta(key PRIMARY KEY, value)`, holding `contentVersion` and `schemaVersion`.
- `topics(id PK, type, en, si, icon, ord)`
- `categories(id PK, topic_id, en, si, short_en, ord)`
- `vocab(id PK, en, pron_si, meaning_si, pos, forms_json, example_json, level, audio_url, search_text)`
- `vocab_categories(vocab_id, category_id, PK(vocab_id, category_id))` (a word can be in several categories)
- `sentences(id PK, category_id, en, pron_si, meaning_si, level, audio_url, search_text)`
- `saved(item_type, item_id, created_at)`, `learned(vocab_id PK, at)`, `activity(day PK)`
- Indexes on the foreign keys. `search_text` is a normalised, lowercase concatenation of en, pronunciation and meaning (NFC, ZWJ/ZWNJ stripped), searched with `LIKE %q%`. That is enough for this size, and FTS can come later.

**First launch (seed):** `db/seed.ts` runs migrations. If `contentVersion` is missing, it inserts `assets/content/content.json` in one transaction and sets `contentVersion = 1`. The app works fully offline from then on.

**Updates (only changes come from the backend):**
- The backend is any static host, e.g. GitHub Pages, Cloudflare R2 or Firebase Hosting, set by `CONTENT_BASE_URL`. No server code.
- `manifest.json` has the form `{ schemaVersion, latestVersion, updates: [{ version, url }] }`.
- Each update file is a delta: `{ version, upsert: { topics?, categories?, vocabulary?, sentences? }, delete: { topics?, categories?, vocabulary?, sentences? (ids) } }`.
- `UpdateService.check()` runs on app start and on foreground, at most once every 6h. It fetches the manifest with a 5s timeout. It skips everything if `schemaVersion` is newer than the app understands (in that case the app needs a store update). Otherwise it downloads each update with `version > contentVersion` in order, validates it with zod, and applies it in **one SQLite transaction per update** (upsert = `INSERT OR REPLACE`; `vocab_categories` rows are rewritten for upserted words), then bumps `contentVersion`. If anything fails, that update rolls back and is retried next time.
- After updates are applied, `ContentProvider` bumps a `contentRevision` counter, and the screens' hooks re-query.
- Authoring workflow: edit the master content, then run a small script, `scripts/make-update.ts old.json new.json`. It diffs the two files, writes `updates/N.json` and bumps the manifest. Then upload.

**Repository & hooks**
- `types.ts` uses the DESIGN.md interfaces verbatim, plus `Category.shortEn?` (the short tab labels, e.g. "School").
- `ContentRepository` holds the typed SQLite queries.
- Hooks: `useTopics(type)`, `useTopic(id)`, `useCategories(topicId)`, `useCategory(id)`, `useWords(categoryId)`, `useWord(id)`, `useSentences(categoryId, level?)`, `useSearch(query, scope)` (grouped: categories, words, sentences; English or Sinhala input), `useWordOfTheDay(date, level)` (a deterministic hash of date → item, preferring the user's level).
- Counts on Home ("35 categories", "37 categories") and the topic preview lines ("7 · Everyday English, Verbs…") are computed from data, never hard-coded.

## 5. Local user state
- `settingsStore` (AsyncStorage) holds: `onboarded, level('beginner'), dailyGoal(10), reminderOn(true), reminderTime('19:30'), textSize('m'), showPronunciation(true), showMeaning(true), theme('light'), appLanguage('en'), autoPlayAudio(false), lastCategoryId, practiceDirection('en'), lastInterstitialAt`.
- `progressRepo` (SQLite) provides: `toggleSaved(type,id)`, `isSaved`, `listSaved`, `markLearned(id)`, `isLearned`, `recordActivity(today)`, `streak()` (consecutive days ending today or yesterday), and `continueLearning()` (`lastCategoryId` + first unlearned word).
- Hooks: `useSaved(type,id)`, `useLearned(id)`, `useStreak()`.

## 5b. AdMob
- Library: `react-native-google-mobile-ads` with its Expo config plugin (`androidAppId`, `iosAppId`, `userTrackingUsageDescription`), plus `expo-tracking-transparency` and `expo-dev-client`. Builds go through EAS (`eas build --profile development`).
- `ads/adUnits.ts`: uses `TestIds.ADAPTIVE_BANNER` / `TestIds.INTERSTITIAL` when `__DEV__`, and real unit IDs from env in release builds. Never show real ads in development.
- `AdsProvider`, at startup after Splash:
  1. Gather consent with UMP (`AdsConsent.gatherConsent()`, which is needed for EEA/UK users).
  2. On iOS, request ATT.
  3. Call `mobileAds().initialize()`.
  4. Expose `adsReady` and `canRequestAds`.
  - A "Privacy & ad choices" row in Settings › Support re-opens the consent form (`AdsConsent.showPrivacyOptionsForm()`).
- `<AdBanner placement=… />`: an anchored adaptive banner (`BannerAdSize.ANCHORED_ADAPTIVE_BANNER`) on a `bg`-coloured strip with a 1px `line` top border. It reserves no space until an ad loads, so there's no empty gap and it collapses on error. It is hidden while the keyboard is open. The `placement` prop is used for analytics and per-placement unit IDs.
- **Placement (every app page; Splash and Onboarding are excluded):**
  - Tab screens: **one shared banner** rendered in `app/(tabs)/_layout.tsx` directly above the TabBar. It covers Home, Words, Topic, Word list, Sentences, Sentence list, Practice, Settings and Saved. A single instance avoids reloading an ad on every push.
  - Word detail (no tab bar): banner directly above the "I know it / Next word" footer.
  - Screens stay scrollable, so the design's content is never covered. Word list's sticky "Practice these words" button sits above the banner.
- **Interstitial:** preloaded when Practice opens and shown only after the user finishes a deck (on the summary card, before "Practice again"). Frequency cap: at most once every 3 minutes (`lastInterstitialAt`), never within the first session's first deck, and never mid-deck.
- `features.ads` flag: a single kill switch, also used by Jest and by screenshot QA.

## 6. Phase 2 audio hooks
- `AudioService { play(url, {rate: 1 | 0.75}); stop() }`. The Phase 1 implementation is a no-op. `useAudio(item)` returns `{available: features.audio && !!item.audioUrl, play}`.
- The Word detail header row has a `<ListenSlot/>` that renders nothing while the audio flag is off. The layout already matches `DetailAudio.dc.html`, so it just becomes a flex row when the flag is on. The example card gets the same treatment.
- Settings shows "Auto-play pronunciation" with the "Coming soon" chip. `autoPlayAudio` is already in the store.

---

## Build order: one prompt per step
Each prompt below is self-contained and can be pasted as-is. Every step ends with: `npx tsc --noEmit`, `npx jest`, then launch in the iOS simulator (iPhone 15/16, whose 390×844 points match the frames), screenshot the screen and compare it side by side with the `.dc.html` file.

### Step 0 — Scaffold, theme, content layer, state, navigation skeleton
> Create an Expo app (latest SDK, TypeScript, expo-router) named "Sin-Eng" in the repo root, following the structure in the plan.
> - Install: expo-router, expo-dev-client, expo-font, @expo-google-fonts/fraunces, @expo-google-fonts/plus-jakarta-sans, @expo-google-fonts/noto-sans-sinhala, react-native-svg, react-native-safe-area-context, zustand, @react-native-async-storage/async-storage, expo-sqlite, zod, expo-splash-screen, expo-clipboard, jest-expo. Add `eas.json` with development, preview and production profiles.
> - Implement `src/theme/*` exactly per plan §2: the tokens from design/DESIGN.md §2 plus the extras listed.
> - Implement `src/db/*` and `src/content/*` per §4:
>   - migrations and the schema
>   - the seed from assets/content/content.json (a copy of design/content.sample.json with `version:1, schemaVersion:1`)
>   - `ContentRepository` queries
>   - `UpdateService` (manifest + delta updates, zod validation, one transaction per update, 6h throttle, skip when `CONTENT_BASE_URL` is empty)
>   - `ContentProvider` with `contentRevision`
>   - the hooks
> - Add `content-host/` example files (manifest + `updates/2.json` adding one word) and `scripts/make-update.ts` (diffs two full JSON files into a delta).
> - Implement `settingsStore` and `progressRepo` per §5, `src/audio/*` per §6, `src/i18n/*` (en strings; si falls back to en), and `src/config/features.ts` (including `ads`).
> - Create every route file in §3 as a placeholder screen that shows its name.
> - Unit tests:
>   - seeding is idempotent
>   - a delta update upserts, deletes, rewrites vocab_categories and bumps the version
>   - an invalid delta rolls back
>   - a newer schemaVersion is skipped
>   - search works with English and Sinhala input
>   - streak calculation
>   - make-update diff
> - Do not build any screen UI yet.

### Step 1 — Shared components
> Build the shared components in `src/components/`, matching the inline CSS in design/screens exactly (sizes, radii, colours, font weights). Take all values from `src/theme` and never hard-code hex values. Components:
> - `Screen` (bg `bg`, safe area, optional scroll, 20px side padding)
> - `ScreenTitle` (Fraunces 32/28 + Sinhala 16 muted subtitle)
> - `NavHeader` (BackButton · centered Fraunces 24 title + 13px muted subtitle · optional right icon button)
> - `BackButton` / `IconButton` (44px round, white, 1px `line` border)
> - `Icon` (react-native-svg, 1.8 stroke, path strings copied verbatim from the screen files into `icons/paths.ts`: home, book, message, cards, settings, search, chevron-right, chevron-left, bookmark, copy, check, flame, bell, filter, arrow-right, and topic icons text/user/leaf/coffee/briefcase/message-circle/help-circle/home/map-pin/phone/quote)
> - Word trio: `EnglishText`, `PronText` (hidden when showPronunciation is off), `MeaningText` (when showMeaning is off, a tappable "Tap to show meaning" placeholder in the self-test style that reveals on tap), and `TrioBlock` (en/pron/meaning with the size variants used on Home, Detail, Practice and the example card, plus an underline highlight of `example.highlight` in `primary`, 2px thick, offset 4)
> - Cards: `Card` (surface, 1px cardBorder, radius 20), `HeroCard` (hero shadow, radius 24)
> - `TopicRow` (48px tile radius 15, teal/saffron variant, EN 17/700, SI 14 muted, preview 12.5 muted2 single line with ellipsis, chevron)
> - `CategoryCard` (letter tile 38/12, min height 124, radius 18)
> - `WordRow` (Fraunces 23 + pron 15/600 saffron inline, meaning 16 teal, learned check 28px or chevron, min height 78)
> - `SentenceCard` (level chip, save + copy 44px icon buttons, EN 20/700, pron 16, meaning 17)
> - Chips: `LevelChip` (bilingual labels, tint map), `PosChip` (neutralFill, 28px), `FormChip` (34px white, line border), `StatusChip` ("Coming soon")
> - `Switch` (52×32, 26px knob, primary/dashed track, `accessibilityRole="switch"`, animated)
> - `SegmentedControl` (neutralFill track radius 14, padding 4, selected white with segment shadow and primary 700 text; props for height 40/44/48)
> - `RadioCard` (2px border cardBorder → primary, bg primaryTint2 when selected, 20 radius; two variants: radio dot, and number tile 52px with a check)
> - `StepDots` (8px dots, active 24px primary, inactive dashed)
> - `PrimaryButton` / `OutlineButton` / `DarkButton` (56/54/52/50 heights, fully rounded)
> - `ProgressBar` (6px)
> - `SearchField` (52px, radius 16, line border, placeholder muted2)
> - `SectionLabel`
> - `GroupedList` + `ListRow` (min height 58/64/54, divider rows)
> - `TabBar` (84px, white, top border `line`, 8/8/20 padding; active = teal 700 label + 56×30 primaryTint pill with stroke 1.9; inactive muted 500)
>
> Wire `TabBar` into `app/(tabs)/_layout.tsx` with tabs Home · Words · Sentences · Practice · Settings. Add a hidden dev route `app/dev/components.tsx` that renders every component for visual QA. All touch targets must be ≥ 44, and icon-only buttons need `accessibilityLabel`.

### Step 2 — Splash & onboarding
> Implement `app/splash.tsx` from design/screens/Splash.dc.html: full-bleed `primary`; 108px ivory mark, radius 32, splashMark shadow, with "A" in Fraunces 50 teal and "අ" in Noto 42 `#B8660B`; "Sin-Eng" Fraunces 40; taglines "English, the easy way" / "ඉංග්‍රීසි, පහසුවෙන්" 17px `#CFE8E1`; 3 dots; footer "සිංහල කතා කරන අයට". Configure the native splash bg to `#0E5A52`. After fonts and content are ready and at least 1.2s has passed (or on tap), route to onboarding or Home based on `onboarded`.
> Implement onboarding/welcome, level and goal from Onboarding1/2/3.dc.html with the exact copy. **Welcome:** 3 stacked tilted cards (−6°/+5°) with a white trio card "Reach / රීච් / ළඟා වෙනවා", headline "Learn English through Sinhala", Sinhala paragraph, StepDots 1/3, and a Next pill with an arrow. **Level:** back, dots 2/3, Skip, "How is your English?", 3 RadioCards (Beginner default) with the Sinhala descriptions from the file, a hint line, and "Continue · ඉදිරියට". **Goal:** back, dots 3/3, "Set a daily goal", 5/10/20 number-tile RadioCards (default 10), a reminder card with a saffron bell tile and a Switch (default on, "හැමදාම 7:30 PM ට මතක් කරන්න"), and "Start learning · පටන් ගමු". Choices go to the settingsStore. Skip and finish set `onboarded` and `router.replace` to Home. Support `?mode=edit` on level/goal: hide dots and Skip, the button label becomes "Save", and it `router.back()`s to Settings.

### Step 3 — Home
> Implement `app/(tabs)/home/index.tsx` from design/screens/Main.dc.html.
> - Header: greeting "සුබ උදෑසනක්" (switch to afternoon/evening Sinhala greetings by time of day) over "Hi" in Fraunces 28. There is no name. Streak pill (saffronTint, flame icon, "{n} days"). 44px teal avatar button with a user icon (label "Profile and settings") → Settings tab.
> - Word of the day HeroCard: "WORD OF THE DAY" teal 12/700/0.08em + "අද දවසේ වචනය"; Fraunces 46 word; label column 76px wide for උච්චාරණය/තේරුම with 22/600 values; example box (bg `bg`, radius 16) with highlighted word; "Learn this word" button → `/word/[id]`, and a 50px save button that toggles saved.
> - Two entry cards (Vocabulary teal / Sentences saffron) with computed "{n} categories →" → Words / Sentences tabs.
> - Continue learning row: dark 44px "V"-style letter tile, "Continue learning · දිගටම ඉගෙන ගන්න", "{Category} · next: {Word}" → category word list. Hide the row if there's no history.
> - Call `progressRepo.recordActivity()` when the user opens a word or finishes a practice card.
> - Leave room for the shared tab-bar banner (Step 12): the content must scroll and must not assume a fixed 844pt height.

### Step 4 — Words tab (Option A)
> Implement `app/(tabs)/words/index.tsx` from design/screens/Vocabulary.dc.html (Option A; ignore VocabularyCarousel). Title "Vocabulary" / "වචන මාලාව", SearchField placeholder "Search a word or category", section "Browse by topic" / "මාතෘකා අනුව", and TopicRows for every `type:'vocabulary'` topic sorted by order. Tiles alternate teal/saffron starting teal. Preview = "{count} · " + category names (shortEn ?? en) joined with ", " and ellipsized. Row → `words/topic/[topicId]`. When the search query is non-empty, replace the list with grouped results (Categories → category screen, Words → WordRow → word detail) using `useSearch`, including Sinhala input, plus an empty state.

### Step 5 — Topic (category grid)
> Implement `app/(tabs)/words/topic/[topicId].tsx` from design/screens/VocabCollection.dc.html: NavHeader with the topic title (Fraunces 24) and subtitle "{si} · {n} categories"; 2-column grid (gap 10, padding 12/20) of CategoryCards (letter = first char of en, alternating teal/saffron starting teal, EN 15/700, SI 13). Card → `words/category/[categoryId]`. Scrollable.

### Step 6 — Word list
> Implement `app/(tabs)/words/category/[categoryId].tsx` from design/screens/WordList.dc.html: NavHeader (category en / si) with a right search IconButton that toggles an inline filter field; hint "Tap a word to learn it · වචනයක් තෝරන්න"; WordRows (learned → teal check, else chevron) → `/word/[id]?categoryId=`; sticky bottom DarkButton "Practice these words" (cards icon) → Practice with `deck=category:<id>`. Set `lastCategoryId`. Add an empty state for categories that don't have words yet (most in the sample).

### Step 7 — Word detail
> Implement `app/word/[wordId].tsx` from design/screens/Detail.dc.html (tab bar hidden).
> - Header: BackButton ("Back to {Category}"), centered "{Category} · {si}" 14/600 muted, save IconButton (filled teal bookmark when saved).
> - Fraunces 58 word; PosChip "{pos} · {si pos}" (map verb→ක්‍රියා පදය, noun→නාම පදය, adjective→විශේෂණ පදය, etc. in i18n).
> - Pronunciation panel (saffronTint, label "උච්චාරණය · PRONUNCIATION" saffronDark, 30/600 saffron) and meaning panel (primaryTint, "තේරුම · MEANING" primaryDark, 28/600 primary). Both respect the show-pronunciation and show-meaning settings.
> - Example HeroCard ("උදාහරණය · EXAMPLE", EN 20/700 with highlight, pron 16, meaning 17).
> - "FORMS · ක්‍රියා රූප" FormChips when `forms` exists.
> - Footer bar (bg `bg`, top border line, padding 12/20/28 + safe area): OutlineButton "I know it" (check) marks learned; PrimaryButton "Next word →" goes to the next word in the category, and is disabled on the last word.
> - Place `<ListenSlot/>` hooks per plan §6 for the word and the example. They render nothing in Phase 1.

### Step 8 — Sentences tab
> Implement `app/(tabs)/sentences/index.tsx` from design/screens/Sentences.dc.html: title "Useful Sentences" / "ප්‍රයෝජනවත් වාක්‍ය", SearchField "Search a sentence or situation", and TopicRows for the `type:'sentences'` topics, with tiles alternating **starting saffron**. The preview line has no count prefix (category names joined). Row → `sentences/[topicId]`. Search shows grouped results (situations, sentences as SentenceCards).

### Step 9 — Sentence list
> Implement `app/(tabs)/sentences/[topicId].tsx` from design/screens/SentenceList.dc.html.
> - NavHeader (topic en/si), with a right "Filter by level" IconButton that opens a bottom sheet/action sheet: All / Beginner / Intermediate / Advanced.
> - Horizontally scrollable underline tabs for the topic's categories (label shortEn ?? en, 15px, active 700 primary with a 3px primary bottom border, inactive 500 muted, gap 22, bottom border line). Selected via `?categoryId`, defaulting to the first.
> - Caption "{category si} · {n} sentences".
> - SentenceCards: save calls `progressRepo.toggleSaved('sentence', id)`; copy uses expo-clipboard with a small toast "Copied".
> - Empty state for categories without sentences.

### Step 10 — Practice
> Implement `app/(tabs)/practice/index.tsx` from design/screens/Practice.dc.html.
> - Deck resolution: the `deck` param → `lastCategoryId` → saved words → the sample Verbs category.
> - Header "Practice" Fraunces 28 + "පුහුණුව · {Category}", counter "{i} of {n}", ProgressBar.
> - SegmentedControl (height 40) "English → සිංහල" / "සිංහල → English", persisted in `practiceDirection`.
> - Flashcard (radius 28, flashcard shadow, flex-grow). EN front: Fraunces 52 + pron 22. SI front: "WHAT IS THIS IN ENGLISH?" + meaning 34. After reveal: divider plus the other side ("තේරුම · MEANING" 28, or Fraunces 40 + pron 20) and the example box.
> - Buttons: "Show meaning · තේරුම බලන්න" / "Show English · ඉංග්‍රීසි බලන්න", then "Still learning" (outline dashed border) and "I know this" (marks learned). Both advance.
> - End-of-deck summary card with "Practice again", plus an empty state when the deck is empty.
> - Use `accessibilityLiveRegion="polite"` on the card.

### Step 11 — Settings
> Implement `app/(tabs)/settings/index.tsx` from design/screens/Settings.dc.html.
> - Title "Settings" / "සැකසුම්".
> - Profile card: 56px teal avatar with a user icon. Title "My learning" instead of a name. Subtitle "{Level} · {goal} words a day". "Edit" → onboarding/level?mode=edit.
> - "Saved words & sentences" row → `settings/saved.tsx`, a simple list using WordRow + SentenceCard, with an empty state.
> - LEARNING · ඉගෙනීම: English level → level?mode=edit, Daily goal → goal?mode=edit, Daily reminder Switch "Every day at 7:30 PM". This saves state only; notifications are TODO.
> - DISPLAY · පෙනුම: Text size SegmentedControl (three "A"s at 14/18/23px, height 44) wired to the typography scale app-wide; switches for Show pronunciation, Show Sinhala meaning ("Turn off to test yourself"), and Dark mode (saves only, behind the flag).
> - APP LANGUAGE · යෙදුමේ භාෂාව: English/සිංහල segmented (height 48), saves only.
> - AUDIO · ශබ්දය: disabled row "Auto-play pronunciation" / "English audio for every word" + "Coming soon" chip.
> - SUPPORT · සහාය: Share with friends (RN Share), Rate the app, Send feedback (mailto), Privacy policy (URLs as TODO constants).
> - Footer "Sin-Eng · Version {expo version}".

### Step 12 — AdMob (banners + Practice interstitial)
> Integrate AdMob per plan §5b.
> - Install `react-native-google-mobile-ads` and `expo-tracking-transparency`, and configure their config plugins in app.config.ts. App IDs and unit IDs come from env: `ADMOB_ANDROID_APP_ID`, `ADMOB_IOS_APP_ID`, `ADMOB_BANNER_ANDROID/IOS`, `ADMOB_INTERSTITIAL_ANDROID/IOS`. Use Google's sample app IDs as defaults so dev builds work.
> - Build `src/ads/AdsProvider.tsx` (UMP consent → iOS ATT → initialize, run after the Splash/Onboarding flow finishes), `AdBanner.tsx`, `interstitial.ts` and `adUnits.ts`, using TestIds in `__DEV__`.
> - Render one `<AdBanner placement="tabs"/>` in `app/(tabs)/_layout.tsx` directly above the TabBar, and `<AdBanner placement="word_detail"/>` above the Word detail footer. No ads on Splash or Onboarding.
> - The banner takes no space until it loads, collapses on error, and hides while the keyboard is open.
> - Practice: preload the interstitial when the screen opens. Show it only after a deck is finished, when `features.ads` is on and at least 3 minutes have passed since `lastInterstitialAt` (and never on the first deck of the first session). Then continue to the summary.
> - Add "Privacy & ad choices" to Settings › SUPPORT. It is visible only when `AdsConsent` reports that privacy options are required.
> - Create a development build (`eas build --profile development --platform ios` / local `npx expo run:ios`), because Expo Go can't load native ad modules.
> - Verify that test banners show on every tab screen and on Word detail, and that the interstitial appears once after finishing a deck and not again within 3 minutes.

---

## Open items / TODOs carried forward
- Real reminder notifications (expo-notifications).
- Dark palette design.
- Sinhala UI translations.
- Choose the static host for `CONTENT_BASE_URL`.
- Real AdMob app and unit IDs.
- Whether a "Remove ads" purchase is wanted later.
- Store URLs and privacy policy URL.
- Native-speaker review of the Sinhala content.
- Words tab Option B (not built).

## Verification
- `npx tsc --noEmit` and `npx jest` (content repository, search, streak, deck resolution) must pass after every step.
- `npx expo start` → iOS simulator (iPhone 15/16 = 390×844 pt). Screenshot each screen and compare it with the matching `design/screens/*.dc.html` opened in the browser pane at 390px width: colours, spacing, copy.
- Test these flows by hand:
  - First launch: Splash → Onboarding (including Skip) → Home.
  - Relaunch goes straight to Home.
  - Browse: Home → Words → Topic → List → Detail → Next word, then "I know it" shows the check in the list.
  - Sentences: switch tabs, filter by level, copy a sentence.
  - Practice in both directions.
  - Every Settings toggle persists across an app restart.
  - Text size L enlarges the text app-wide.
  - Show meaning off hides meanings until tapped.
- Content updates: serve `content-host/` with `npx serve`, set `CONTENT_BASE_URL` to the LAN IP, then relaunch. The word from `updates/2.json` appears, and `meta.contentVersion` is 2. Make a broken `updates/3.json`: nothing changes, and the version stays at 2. Airplane mode: the app still works fully from SQLite.
- Ads: test ads only (TestIds). Banner above the tab bar, and above the Word detail footer. The interstitial follows the frequency cap. The UMP form appears when simulating EEA with `AdsConsent` debug geography.
- Store compliance before release: add `app-ads.txt` to the developer website, fill in the Play Data safety and App Store privacy labels (advertising ID), and set the ATT usage string.
