# Cloudflare deployment

Both sites deploy from the GitHub repository `burakkp/my-website-and-blog` as **two separate Cloudflare Worker projects** using static assets. Each project builds only its own folder, set through the root directory. There is no server code: Cloudflare serves each site's `dist/` folder as files.

Each site has a `wrangler.jsonc` that tells `wrangler deploy` what to upload. Without it, Wrangler tries to convert the site into a server-rendered Astro app, which fails.

## Decisions

| Item | Value |
| --- | --- |
| Worker for the blog | `burakkp-dev` |
| Worker for the portfolio | `burakkp-com` |
| DNS | Both domains are zones in the same Cloudflare account. DNS is already configured. |
| Hostnames | Apex domains only. No `www`. |

The `name` in each `wrangler.jsonc` must match the Worker name in the dashboard. If you rename a Worker, change it there too.

## Build settings

Create each project under **Workers & Pages → Create → Import a repository**, then pick `burakkp/my-website-and-blog`. Grant the Cloudflare GitHub app access to this repository only.

| Setting | Blog | Portfolio |
| --- | --- | --- |
| Project name | `burakkp-dev` | `burakkp-com` |
| Production branch | `main` | `main` |
| Root directory (path) | `burakkp.dev` | `burakkp.com` |
| Build command | `npm run check && npm run build` | `npm run check && npm run build` |
| Deploy command | `npx wrangler deploy` | `npx wrangler deploy` |
| Build variable | `NODE_VERSION` = `22.23.4` | `NODE_VERSION` = `22.23.4` |
| Build watch paths, include (Settings → Build) | `burakkp.dev/*` | `burakkp.com/*` |

Build watch paths stop a commit that only touches one site from rebuilding the other. Add them after the first deployment succeeds.

No secrets, bindings or server adapter are needed.

## Files Cloudflare reads from each site

| File | Site | Purpose |
| --- | --- | --- |
| `wrangler.jsonc` | both | Worker name and the static assets folder. Missing pages use the site's `404.html`. |
| `public/_headers` | both | Security headers, and long-lived caching for fingerprinted `/_astro/*` assets |
| `public/_redirects` | blog | Hashnode URL redirects. It currently holds **example entries only**. |
| `public/robots.txt` | both | Points crawlers at the sitemap |

Files in `public/` are copied into `dist/` at build time.

## Check locally before pushing

With a supported Node active, from either site folder:

```bash
npm run build
npx wrangler deploy --dry-run   # validates config without deploying
npx wrangler dev --port 8787    # serves dist/ the way Cloudflare will, including _redirects and _headers
```

## Custom domains

Do this only after the `*.workers.dev` deployment looks right.

1. In the `burakkp-dev` Worker, open **Settings → Domains & Routes → Add → Custom domain** and enter `burakkp.dev`.
2. In the `burakkp-com` Worker, do the same with `burakkp.com`.
3. Both zones are in this account, so Cloudflare creates or updates the DNS record itself.

Both domains are live today. If a domain's apex already points somewhere else, Cloudflare asks to replace that record when you add the custom domain. That moment is the switch to the new site, so do it only when you are ready.

Both sites set their canonical URL to the apex domain in `astro.config.mjs`.

## Verify after deploy

```bash
for d in burakkp.dev burakkp.com; do
  curl -sI https://$d/ | head -1
  curl -sI https://$d/sitemap-index.xml | head -1
  curl -sI https://$d/a-page-that-does-not-exist | head -1
done
curl -sI https://burakkp.dev/rss.xml | head -1
curl -sI https://burakkp.dev/old-hashnode-slug-1 | grep -iE '^(HTTP|location)'
```

Expect `200` for real pages, `404` for the missing page, and `301` with the right `Location` for each redirect.

## Before going live

- Replace the starter blog posts in `burakkp.dev/src/content/blog/`.
- Replace the example lines in `burakkp.dev/public/_redirects` with your real Hashnode slugs.
- Fill in real project write-ups and links in `burakkp.com/src/content/projects/`.

## Rollback

In the Worker, open **Deployments**, pick the last good version, and choose **Rollback**. For a code fix, run `git revert <bad-commit>` and push. Do not force-push `main`.
