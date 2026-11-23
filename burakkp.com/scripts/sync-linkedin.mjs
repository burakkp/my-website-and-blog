#!/usr/bin/env node
// Daily sync: LinkedIn (Member Data Portability API) → src/content/experience/.
// Runs in GitHub Actions (.github/workflows/linkedin-sync.yml); the workflow commits any changes,
// which triggers the normal Cloudflare deploy.
//
// Env: LINKEDIN_TOKEN (required), LINKEDIN_TOKEN_EXPIRES (ISO date, optional; enables the expiry warning).
// Local run: LINKEDIN_TOKEN=... node scripts/sync-linkedin.mjs [--dry-run]
//
// LinkedIn is the source of truth: the experience folder is made to match it exactly.
// Safety: if LinkedIn returns no data or no positions, nothing is changed.

import { EXPERIENCE_DIR, writePositions } from './lib/positions.mjs';

const token = process.env.LINKEDIN_TOKEN?.trim();
const dryRun = process.argv.includes('--dry-run');
const RENEW_DAYS = 14;
const notice = (kind, msg) => console.log(process.env.GITHUB_ACTIONS ? `::${kind}::${msg}` : `${kind.toUpperCase()}: ${msg}`);

if (!token) { notice('error', 'LINKEDIN_TOKEN is not set. Run `npm run linkedin:token` in burakkp.com to create it.'); process.exit(1); }

const expires = process.env.LINKEDIN_TOKEN_EXPIRES ? new Date(process.env.LINKEDIN_TOKEN_EXPIRES) : null;
let expiringSoon = false;
if (expires && !Number.isNaN(expires.valueOf())) {
	const daysLeft = Math.floor((expires - Date.now()) / 86_400_000);
	if (daysLeft <= RENEW_DAYS) {
		expiringSoon = true;
		notice('error', `LinkedIn token expires in ${daysLeft} day(s), on ${expires.toISOString().slice(0, 10)}. Renew it: cd burakkp.com && npm run linkedin:token`);
	}
}

/** Fetch every page of one snapshot domain. Returns null when LinkedIn has no snapshot yet. */
async function fetchDomain(domain) {
	const records = [];
	for (let start = 0, page = 0; page < 50; page++) {
		const url = `https://api.linkedin.com/rest/memberSnapshotData?q=criteria&domain=${domain}&start=${start}`;
		const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'LinkedIn-Version': '202312' }, signal: AbortSignal.timeout(30_000) });
		if (res.status === 404) return page === 0 ? null : records; // LinkedIn signals "no (more) data" with 404
		if (res.status === 401) throw new Error('LinkedIn rejected the token (401). Renew it: cd burakkp.com && npm run linkedin:token');
		if (!res.ok) throw new Error(`LinkedIn responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
		const body = await res.json();
		for (const element of body.elements ?? []) {
			if (element.snapshotDomain === domain) records.push(...(element.snapshotData ?? []));
		}
		const next = body.paging?.links?.find(link => link.rel === 'next');
		if (!next) return records;
		const nextStart = Number(new URL(next.href, 'https://api.linkedin.com').searchParams.get('start'));
		start = Number.isFinite(nextStart) && nextStart > start ? nextStart : start + 1;
	}
	return records;
}

try {
	const positions = await fetchDomain('POSITIONS');
	if (positions === null) notice('notice', 'LinkedIn has no snapshot for POSITIONS yet (HTTP 404). Nothing changed. This is normal for the first days after consent.');
	else if (positions.length === 0) notice('warning', 'LinkedIn returned zero positions. Nothing changed, to avoid wiping the Experience section by mistake.');
	else if (dryRun) console.log(`Dry run: LinkedIn returned ${positions.length} position(s). Fields: ${Object.keys(positions[0]).join(', ')}`);
	else {
		const s = writePositions(positions, 'mirror');
		console.log(`Experience synced from LinkedIn: ${positions.length} position(s); ${s.written} written, ${s.unchanged} unchanged, ${s.removed} removed, ${s.skipped} skipped (incomplete) in ${EXPERIENCE_DIR}`);
	}
} catch (error) {
	notice('error', error.message);
	process.exit(1);
}
// Fail the run (GitHub emails you) while the token is close to expiry, after the sync itself has run.
if (expiringSoon) process.exit(1);
