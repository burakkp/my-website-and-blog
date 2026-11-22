#!/usr/bin/env node
// Import positions from LinkedIn's official data export into src/content/experience/.
//
// 1. LinkedIn → Settings → Data privacy → Get a copy of your data → "Positions" (or the full archive).
// 2. Unzip the email attachment.
// 3. npm run import:linkedin -- /path/to/unzipped-folder   (or the path to Positions.csv)
//
// Existing entries are kept so dashboard edits are never lost. Pass --overwrite to replace them.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const input = args.find(a => !a.startsWith('--'));
if (!input) {
	console.error('Usage: npm run import:linkedin -- <export folder or Positions.csv> [--overwrite]');
	process.exit(1);
}

const csvPath = statSync(input).isDirectory() ? join(input, 'Positions.csv') : input;
if (!existsSync(csvPath)) {
	console.error(`Positions.csv not found at ${csvPath}`);
	process.exit(1);
}

/** RFC 4180 CSV: quoted fields may contain commas, quotes ("") and newlines. */
function parseCsv(text) {
	const rows = [];
	let row = [], field = '', quoted = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (quoted) {
			if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
			else if (c === '"') quoted = false;
			else field += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') { row.push(field); field = ''; }
		else if (c === '\n' || c === '\r') {
			if (c === '\r' && text[i + 1] === '\n') i++;
			row.push(field); rows.push(row); row = []; field = '';
		} else field += c;
	}
	if (field || row.length) { row.push(field); rows.push(row); }
	return rows.filter(r => r.some(v => v.trim()));
}

const MONTHS = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
/** "Mar 2021" → "2021-03", "2021" → "2021-01", "" → "". */
function toMonth(value) {
	const v = value.trim();
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

const [header, ...rows] = parseCsv(readFileSync(csvPath, 'utf8').replace(/^﻿/, ''));
const col = name => {
	const i = header.findIndex(h => h.trim().toLowerCase() === name.toLowerCase());
	if (i < 0) throw new Error(`Column "${name}" missing. Found: ${header.join(', ')}`);
	return i;
};
const idx = { company: col('Company Name'), title: col('Title'), description: col('Description'), location: col('Location'), start: col('Started On'), end: col('Finished On') };

const outDir = resolve(import.meta.dirname, '../src/content/experience');
mkdirSync(outDir, { recursive: true });
let written = 0, skipped = 0;
for (const r of rows) {
	const get = k => (r[idx[k]] ?? '').trim();
	const start = toMonth(get('start'));
	if (!get('title') || !get('company') || !start) { console.warn(`Skipping incomplete row: ${r.join(' | ')}`); continue; }
	const file = join(outDir, `${slugify(`${get('company')}-${get('title')}-${start}`)}.md`);
	if (existsSync(file) && !overwrite) { skipped++; continue; }
	const end = toMonth(get('end'));
	const lines = ['---', `role: ${yaml(get('title'))}`, `company: ${yaml(get('company'))}`];
	if (get('location')) lines.push(`location: ${yaml(get('location'))}`);
	lines.push(`start: ${yaml(start)}`);
	if (end) lines.push(`end: ${yaml(end)}`);
	lines.push('---', '', get('description'), '');
	writeFileSync(file, lines.join('\n'));
	written++;
}
console.log(`Experience: ${written} written, ${skipped} kept (already present) in ${outDir}`);
