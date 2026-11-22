import { profile } from './profile';

export interface Repo { name: string; description: string | null; url: string; homepage: string | null; language: string | null; stars: number; pushedAt: string; }

/**
 * Public repos tagged with the profile's topic (default "portfolio"), fetched once per build.
 * Set GITHUB_TOKEN in the build environment to avoid GitHub's anonymous rate limit.
 * Any failure returns [] so a GitHub outage never breaks a deploy; the section just hides.
 */
export async function getPortfolioRepos(): Promise<Repo[]> {
	const { username, topic, limit } = profile.github;
	if (!username) return [];
	const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-site-build' };
	if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	try {
		const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`, { headers, signal: AbortSignal.timeout(10_000) });
		if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
		const repos = (await res.json()) as Array<Record<string, any>>;
		return repos
			.filter(r => !r.fork && !r.archived && !r.private && (r.topics ?? []).includes(topic))
			.slice(0, limit)
			.map(r => ({ name: r.name, description: r.description, url: r.html_url, homepage: r.homepage || null, language: r.language, stars: r.stargazers_count, pushedAt: r.pushed_at }));
	} catch (error) {
		console.warn(`[github] Skipping open source section: ${(error as Error).message}`);
		return [];
	}
}
