import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const optionalUrl = z.union([z.literal(''), z.url()]).optional();
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM');

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    category: z.string(),
    summary: z.string(),
    mark: z.string(),
    tone: z.enum(['lime', 'blue', 'orange', 'violet']),
    website: optionalUrl,
    repo: optionalUrl,
  }),
});

const experience = defineCollection({
  loader: glob({ base: './src/content/experience', pattern: '**/*.md' }),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    location: z.string().optional(),
    start: month,
    end: month.optional().or(z.literal('')),
  }),
});

export const collections = { projects, experience };
