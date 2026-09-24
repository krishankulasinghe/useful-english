// SVG shape data for <Icon/>, viewBox 0 0 24 24, stroke-only (Feather/Lucide style).
// Paths for the UI chrome icons (home, book, message, cards, settings, search,
// chevron-*, bookmark, copy, check, flame, bell, filter, arrow-right) are copied
// verbatim from design/screens/*.dc.html. The topic icons (text, user, leaf,
// coffee, briefcase, message-circle, help-circle, map-pin, phone, quote) are not
// given exact paths in the screens (the sample data there uses unrelated
// placeholder paths), so these use the standard Lucide icon paths for the same
// names instead.

export type IconShape =
  | { type: 'path'; d: string }
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number };

export const iconPaths = {
  home: [{ type: 'path', d: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' }],
  book: [
    { type: 'path', d: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z' },
    { type: 'path', d: 'M4 21V5' },
    { type: 'path', d: 'M8 7h7' },
  ],
  message: [{ type: 'path', d: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z' }],
  cards: [
    { type: 'rect', x: 3, y: 7, width: 14, height: 14, rx: 2 },
    { type: 'path', d: 'M7 3h12a2 2 0 0 1 2 2v12' },
  ],
  settings: [
    { type: 'path', d: 'M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0z' },
    {
      type: 'path',
      d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
    },
  ],
  search: [
    { type: 'circle', cx: 11, cy: 11, r: 7 },
    { type: 'path', d: 'm20 20-3.5-3.5' },
  ],
  'chevron-right': [{ type: 'path', d: 'm9 6 6 6-6 6' }],
  'chevron-left': [{ type: 'path', d: 'm15 18-6-6 6-6' }],
  bookmark: [{ type: 'path', d: 'M6 3h12v18l-6-4-6 4z' }],
  copy: [
    { type: 'rect', x: 9, y: 9, width: 12, height: 12, rx: 2 },
    { type: 'path', d: 'M5 15V5a2 2 0 0 1 2-2h10' },
  ],
  check: [{ type: 'path', d: 'm5 12 5 5 9-10' }],
  flame: [
    {
      type: 'path',
      d: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.7 1.2 2.7 2.5 3 0-3-1-5.5 0-8z',
    },
  ],
  bell: [{ type: 'path', d: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4' }],
  filter: [{ type: 'path', d: 'M4 6h16M7 12h10M10 18h4' }],
  sort: [
    { type: 'path', d: 'm3 16 4 4 4-4' },
    { type: 'path', d: 'M7 20V4' },
    { type: 'path', d: 'm21 8-4-4-4 4' },
    { type: 'path', d: 'M17 4v16' },
  ],
  eye: [
    { type: 'path', d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' },
    { type: 'circle', cx: 12, cy: 12, r: 3 },
  ],
  'eye-off': [
    { type: 'path', d: 'M9.88 9.88a3 3 0 1 0 4.24 4.24' },
    { type: 'path', d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' },
    { type: 'path', d: 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' },
    { type: 'path', d: 'm2 2 20 20' },
  ],
  'arrow-right': [{ type: 'path', d: 'M5 12h14M13 6l6 6-6 6' }],

  // Topic icons (standard Lucide paths).
  text: [{ type: 'path', d: 'M4 7V4h16v3M9 20h6M12 4v16' }],
  user: [
    { type: 'circle', cx: 12, cy: 7, r: 4 },
    { type: 'path', d: 'M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2' },
  ],
  leaf: [
    {
      type: 'path',
      d: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z',
    },
    { type: 'path', d: 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12' },
  ],
  coffee: [
    { type: 'path', d: 'M17 8h1a4 4 0 1 1 0 8h-1' },
    { type: 'path', d: 'M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z' },
    { type: 'path', d: 'M6 1v3' },
    { type: 'path', d: 'M10 1v3' },
    { type: 'path', d: 'M14 1v3' },
  ],
  briefcase: [
    { type: 'rect', x: 2, y: 7, width: 20, height: 14, rx: 2 },
    { type: 'path', d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
  ],
  'message-circle': [{ type: 'path', d: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z' }],
  'help-circle': [
    { type: 'circle', cx: 12, cy: 12, r: 10 },
    { type: 'path', d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' },
    { type: 'path', d: 'M12 17h.01' },
  ],
  'map-pin': [
    { type: 'path', d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' },
    { type: 'circle', cx: 12, cy: 10, r: 3 },
  ],
  phone: [
    {
      type: 'path',
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    },
  ],
  quote: [
    {
      type: 'path',
      d: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z',
    },
    {
      type: 'path',
      d: 'M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
    },
  ],
} satisfies Record<string, IconShape[]>;

export type IconName = keyof typeof iconPaths;
