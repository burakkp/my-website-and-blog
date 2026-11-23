#!/usr/bin/env node
// Get (or renew) the LinkedIn Member Data Portability token and store it as the
// GitHub Actions secret LINKEDIN_TOKEN, without the token ever being printed.
//
// One-time: in the LinkedIn app's Auth tab, add this Authorized redirect URL:
//   http://localhost:8765/callback
//
// Run (from burakkp.com/, with GitHub CLI logged in):
//   read -r  LINKEDIN_CLIENT_ID     && export LINKEDIN_CLIENT_ID
//   read -rs LINKEDIN_CLIENT_SECRET && export LINKEDIN_CLIENT_SECRET
//   npm run linkedin:token
//
// Options: --print prints the token instead of saving it to GitHub.

import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';

const REPO = 'burakkp/my-website-and-blog';
const PORT = 8765;
const REDIRECT = `http://localhost:${PORT}/callback`;
const SCOPE = 'r_dma_portability_self_serve';
const print = process.argv.includes('--print');

const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
if (!clientId || !clientSecret) {
	console.error('Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET first (see the comment at the top of this file).');
	process.exit(1);
}
if (!print && spawnSync('gh', ['auth', 'status'], { stdio: 'ignore' }).status !== 0) {
	console.error('GitHub CLI is not logged in. Run `gh auth login`, or pass --print.');
	process.exit(1);
}

const state = randomBytes(24).toString('hex');
const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
authUrl.search = new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: REDIRECT, state, scope: SCOPE }).toString();

const page = (res, status, msg) => { res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(`<!doctype html><title>LinkedIn token</title><p style="font:18px system-ui;margin:3rem">${msg}</p>`); };

const server = createServer(async (req, res) => {
	const url = new URL(req.url, REDIRECT);
	if (url.pathname !== '/callback') return page(res, 404, 'Not found.');
	const p = url.searchParams;
	if (p.get('error')) { page(res, 400, `LinkedIn returned an error: ${p.get('error_description') || p.get('error')}`); return finish(1, `LinkedIn error: ${p.get('error')} ${p.get('error_description') ?? ''}`); }
	if (p.get('state') !== state) { page(res, 400, 'State mismatch. Close this tab and run the script again.'); return finish(1, 'State mismatch: the sign-in did not come from this run.'); }

	try {
		const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({ grant_type: 'authorization_code', code: p.get('code'), redirect_uri: REDIRECT, client_id: clientId, client_secret: clientSecret }),
		});
		const body = await tokenRes.json();
		if (!tokenRes.ok || !body.access_token) throw new Error(`Token exchange failed (${tokenRes.status}): ${body.error_description || body.error || 'no token returned'}`);

		// Prove the token works for the portability API, without printing any profile data.
		const probe = await fetch('https://api.linkedin.com/rest/memberSnapshotData?q=criteria&domain=PROFILE', { headers: { Authorization: `Bearer ${body.access_token}`, 'LinkedIn-Version': '202312' } });

		const expires = new Date(Date.now() + body.expires_in * 1000);
		const lines = [`Access token valid until ${expires.toISOString().slice(0, 10)} (${Math.round(body.expires_in / 86400)} days).`,
			body.refresh_token ? `Refresh token issued, valid ${Math.round((body.refresh_token_expires_in ?? 0) / 86400)} days.` : 'No refresh token issued: re-run this script before the expiry date.',
			`Portability API check: HTTP ${probe.status}${probe.ok ? ' (OK)' : probe.status === 404 ? ' (no data yet: LinkedIn may still be preparing your snapshot)' : ''}.`];

		if (print) lines.push(`LINKEDIN_TOKEN=${body.access_token}`);
		else {
			setSecret('LINKEDIN_TOKEN', body.access_token);
			setSecret('LINKEDIN_TOKEN_EXPIRES', expires.toISOString());
			if (body.refresh_token) setSecret('LINKEDIN_REFRESH_TOKEN', body.refresh_token);
			lines.push(`Saved to GitHub secrets of ${REPO}.`);
		}
		page(res, 200, 'Done. You can close this tab and return to the terminal.');
		finish(0, lines.join('\n'));
	} catch (error) {
		page(res, 500, 'Something went wrong. Check the terminal.');
		finish(1, error.message);
	}
});

function setSecret(name, value) {
	const r = spawnSync('gh', ['secret', 'set', name, '--repo', REPO], { input: value, stdio: ['pipe', 'ignore', 'inherit'] });
	if (r.status !== 0) throw new Error(`gh secret set ${name} failed`);
}

function finish(code, message) {
	(code ? console.error : console.log)(message);
	server.close();
	process.exitCode = code;
}

server.listen(PORT, '127.0.0.1', () => {
	console.log(`Opening LinkedIn sign-in. If no browser opens, visit:\n\n${authUrl}\n`);
	try { spawn('xdg-open', [authUrl.toString()], { stdio: 'ignore', detached: true }).on('error', () => {}).unref(); } catch {}
});
setTimeout(() => finish(1, 'Timed out after 5 minutes without a sign-in.'), 5 * 60_000).unref();
