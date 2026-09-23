export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Topic {
  id: string;
  type: 'vocabulary' | 'sentences';
  en: string;
  si: string;
  icon: string;
  order: number;
}

export interface Category {
  id: string;
  topicId: string;
  en: string;
  si: string;
  order: number;
  shortEn?: string; // short tab label, e.g. "School"
}

export interface VocabExample {
  en: string;
  pronunciationSi: string;
  meaningSi: string;
  highlight?: string;
}

export interface VocabItem {
  id: string;
  categoryIds: string[];
  en: string;
  pronunciationSi: string;
  meaningSi: string;
  partOfSpeech?: string;
  forms?: string[]; // e.g. reach, reached, reached, reaching
  example: VocabExample;
  level?: Level;
  audioUrl?: string; // Phase 2
}

export interface SentenceItem {
  id: string;
  categoryId: string;
  en: string;
  pronunciationSi: string;
  meaningSi: string;
  level: Level;
  audioUrl?: string;
}

export interface ContentBundle {
  topics: Topic[];
  categories: Category[];
  vocabulary: VocabItem[];
  sentences: SentenceItem[];
}
