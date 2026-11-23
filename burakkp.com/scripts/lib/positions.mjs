// Shared by the LinkedIn CSV importer and the daily API sync.
// LinkedIn uses the same field names in its data export (Positions.csv) and in the
// Member Snapshot API POSITIONS domain: Company Name, Title, Description, Location, Started On, Finished On.

import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const EXPERIENCE_DIR = resolve(import.meta.dirname, '../../src/content/experience');

const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };

/** "Mar 2021" → "2021-03", "2021" → "2021-01", "" → "". */
export function toMonth(value = '') {
	const v = String(value).trim();
	if (!v) return '';
	let m = v.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/);
	if (m && MONTHS[m[1].toLowerCase()]) return `${m[2]}-${MONTHS[m[1].toLowerCase()]}`;
	m = v.match(/^(\d{4})$/);
	if (m) return `${m[1]}-01`;
	m = v.match(/^(\d{4})-(\d{2})/);
	if (m) return `${m[1]}-${m[2]}`;
	throw new Error(`Unrecognised date "${value}"`);
}

const slugify = s => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const yaml = s => JSON.stringify(s); // JSON strings are valid YAML scalars

/** Turn a LinkedIn position record into { file, content }, or null if it lacks title/company/start. */
export function renderPosition(record) {
	const get = key => String(record[key] ?? '').trim();
	const start = toMonth(get('Started On'));
	if (!get('Title') || !get('Company Name') || !start) return null;
	const end = toMonth(get('Finished On'));
	const lines = ['---', `role: ${yaml(get('Title'))}`, `company: ${yaml(get('Company Name'))}`];
	if (get('Location')) lines.push(`location: ${yaml(get('Location'))}`);
	lines.push(`start: ${yaml(start)}`);
	if (end) lines.push(`end: ${yaml(end)}`);
	lines.push('---', '', get('Description'), '');
	return { file: `${slugify(`${get('Company Name')}-${get('Title')}-${start}`)}.md`, content: lines.join('\n') };
}

/**
 * Write positions into the experience folder.
 * mode "add": keep existing files (CSV import never overwrites dashboard edits).
 * mode "overwrite": replace files with the same name.
 * mode "mirror": make the folder exactly match LinkedIn (daily sync).
 */
export function writePositions(records, mode = 'add') {
	mkdirSync(EXPERIENCE_DIR, { recursive: true });
	const stats = { written: 0, unchanged: 0, kept: 0, removed: 0, skipped: 0 };
	const wanted = new Set();
	for (const record of records) {
		const entry = renderPosition(record);
		if (!entry) { stats.skipped++; continue; }
		if (wanted.has(entry.file)) continue;
		wanted.add(entry.file);
		const path = join(EXPERIENCE_DIR, entry.file);
		if (existsSync(path)) {
			if (mode === 'add') { stats.kept++; continue; }
			if (readFileSync(path, 'utf8') === entry.content) { stats.unchanged++; continue; }
		}
		writeFileSync(path, entry.content);
		stats.written++;
	}
	if (mode === 'mirror') {
		for (const name of readdirSync(EXPERIENCE_DIR)) {
			if (name.endsWith('.md') && !wanted.has(name)) { unlinkSync(join(EXPERIENCE_DIR, name)); stats.removed++; }
		}
	}
	return stats;
}
