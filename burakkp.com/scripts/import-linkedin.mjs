#!/usr/bin/env node
// Import positions from LinkedIn's official data export into src/content/experience/.
//
// 1. LinkedIn → Settings → Data privacy → Get a copy of your data → "Positions" (or the full archive).
// 2. Unzip the email attachment.
// 3. npm run import:linkedin -- /path/to/unzipped-folder   (or the path to Positions.csv)
//
// Existing entries are kept so dashboard edits are never lost. Pass --overwrite to replace them.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { EXPERIENCE_DIR, writePositions } from './lib/positions.mjs';

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

const [header, ...rows] = parseCsv(readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''));
const records = rows.map(r => Object.fromEntries(header.map((h, i) => [h.trim(), r[i] ?? ''])));
const missing = ['Company Name', 'Title', 'Started On'].filter(h => !header.some(x => x.trim() === h));
if (missing.length) { console.error(`Columns missing: ${missing.join(', ')}. Found: ${header.join(', ')}`); process.exit(1); }

const stats = writePositions(records, overwrite ? 'overwrite' : 'add');
console.log(`Experience: ${stats.written} written, ${stats.kept} kept (already present), ${stats.unchanged} unchanged, ${stats.skipped} skipped (incomplete) in ${EXPERIENCE_DIR}`);
