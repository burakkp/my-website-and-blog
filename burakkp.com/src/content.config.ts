import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({ title: z.string(), order: z.number(), category: z.string(), summary: z.string(), mark: z.string(), tone: z.enum(['lime', 'blue', 'orange', 'violet']) }),
});
export const collections = { projects };
