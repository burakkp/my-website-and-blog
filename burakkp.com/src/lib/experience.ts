import { getCollection, type CollectionEntry } from 'astro:content';

const fmt = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const label = (m: string) => fmt.format(new Date(`${m}-01T00:00:00Z`));
const period = (start: string, end?: string) => `${label(start)} – ${end ? label(end) : 'Present'}`;
const sameCompany = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export interface Role { entry: CollectionEntry<'experience'>; period: string; location?: string; }
export interface CompanyGroup { company: string; period: string; location?: string; roles: Role[]; }

/**
 * Positions newest first, with consecutive roles at the same company merged into one group,
 * like LinkedIn's Experience section. A location shared by every role in a group is shown once.
 */
export async function getExperienceGroups(): Promise<CompanyGroup[]> {
	const entries = (await getCollection('experience')).sort(
		(a, b) => b.data.start.localeCompare(a.data.start) || (a.data.end ? 1 : 0) - (b.data.end ? 1 : 0),
	);

	const groups: { company: string; entries: CollectionEntry<'experience'>[] }[] = [];
	for (const entry of entries) {
		const last = groups.at(-1);
		if (last && sameCompany(last.company, entry.data.company)) last.entries.push(entry);
		else groups.push({ company: entry.data.company, entries: [entry] });
	}

	return groups.map(({ company, entries }) => {
		const starts = entries.map(e => e.data.start).sort();
		const current = entries.some(e => !e.data.end);
		const end = current ? undefined : entries.map(e => e.data.end as string).sort().at(-1);
		const locations = new Set(entries.map(e => e.data.location ?? ''));
		const shared = locations.size === 1 ? [...locations][0] || undefined : undefined;
		return {
			company,
			period: period(starts[0], end),
			location: shared,
			roles: entries.map(e => ({ entry: e, period: period(e.data.start, e.data.end || undefined), location: shared ? undefined : e.data.location })),
		};
	});
}
