import { z } from 'zod';

export const levelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const topicSchema = z.object({
  id: z.string(),
  type: z.enum(['vocabulary', 'sentences']),
  en: z.string(),
  si: z.string(),
  icon: z.string(),
  order: z.number(),
});

export const categorySchema = z.object({
  id: z.string(),
  topicId: z.string(),
  en: z.string(),
  si: z.string(),
  order: z.number(),
  shortEn: z.string().optional(),
});

export const vocabExampleSchema = z.object({
  en: z.string(),
  pronunciationSi: z.string(),
  meaningSi: z.string(),
  highlight: z.string().optional(),
});

export const vocabItemSchema = z.object({
  id: z.string(),
  categoryIds: z.array(z.string()),
  en: z.string(),
  pronunciationSi: z.string(),
  meaningSi: z.string(),
  partOfSpeech: z.string().optional(),
  forms: z.array(z.string()).optional(),
  example: vocabExampleSchema,
  level: levelSchema.optional(),
  audioUrl: z.string().optional(),
});

export const sentenceItemSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  en: z.string(),
  pronunciationSi: z.string(),
  meaningSi: z.string(),
  level: levelSchema,
  audioUrl: z.string().optional(),
});

export const contentBundleSchema = z.object({
  topics: z.array(topicSchema),
  categories: z.array(categorySchema),
  vocabulary: z.array(vocabItemSchema),
  sentences: z.array(sentenceItemSchema),
});

export const seedFileSchema = contentBundleSchema.extend({
  version: z.number(),
  schemaVersion: z.number(),
});

// A delta update: only the items that changed.
export const upsertSchema = z.object({
  topics: z.array(topicSchema).optional(),
  categories: z.array(categorySchema).optional(),
  vocabulary: z.array(vocabItemSchema).optional(),
  sentences: z.array(sentenceItemSchema).optional(),
});

export const deleteSchema = z.object({
  topics: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  vocabulary: z.array(z.string()).optional(),
  sentences: z.array(z.string()).optional(),
});

export const updateFileSchema = z.object({
  version: z.number(),
  upsert: upsertSchema.optional(),
  delete: deleteSchema.optional(),
});

export const manifestSchema = z.object({
  schemaVersion: z.number(),
  latestVersion: z.number(),
  updates: z.array(
    z.object({
      version: z.number(),
      url: z.string(),
    }),
  ),
});

export type UpdateFile = z.infer<typeof updateFileSchema>;
export type Manifest = z.infer<typeof manifestSchema>;
export type SeedFile = z.infer<typeof seedFileSchema>;
