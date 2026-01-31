import { defineCollection, z } from 'astro:content';

const tutorials = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    status: z.enum(['draft', 'in-progress', 'complete']),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    dateCreated: z.coerce.date(),
    dateUpdated: z.coerce.date().optional(),
    estimatedTime: z.string().optional(),
  }),
});

const paths = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tutorials: z.array(z.string()),
    estimatedTime: z.string().optional(),
  }),
});

export const collections = { tutorials, paths };
