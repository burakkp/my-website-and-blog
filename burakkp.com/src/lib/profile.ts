import { z } from 'astro/zod';
import raw from '../data/profile.json';

const optionalUrl = z.union([z.literal(''), z.url()]);

/** Editable from the dashboard (Site settings → Profile). Validated so a bad edit fails the build, not the page. */
export const profile = z
	.object({
		greeting: z.string(),
		intro: z.string(),
		interests: z.array(z.string()),
		terminalNote: z.string(),
		links: z.object({ github: optionalUrl, linkedin: optionalUrl, email: z.union([z.literal(''), z.email()]) }),
		github: z.object({ username: z.string(), topic: z.string(), limit: z.number().int().min(1).max(12) }),
	})
	.parse(raw);
