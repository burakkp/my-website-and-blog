import { getCollection } from 'astro:content';

const fmt = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const label = (m: string) => fmt.format(new Date(`${m}-01T00:00:00Z`));

/** Positions newest first; current roles (no end month) first among equals. */
export async function getExperience() {
	const entries = await getCollection('experience');
	return entries
		.sort((a, b) => b.data.start.localeCompare(a.data.start) || (a.data.end ? 1 : 0) - (b.data.end ? 1 : 0))
		.map(entry => ({ entry, period: `${label(entry.data.start)} – ${entry.data.end ? label(entry.data.end) : 'Present'}` }));
}
