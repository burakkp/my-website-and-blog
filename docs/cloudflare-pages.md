# Cloudflare Pages setup

Both sites deploy from the GitHub repository `burakkp/my-website-and-blog` as **two separate Pages projects**. Each project builds only its own folder, set through the root directory.

## Decisions

| Item | Value |
| --- | --- |
| Pages project for the blog | `burakkp-dev` (preview at `burakkp-dev.pages.dev`) |
| Pages project for the portfolio | `burakkp-com` (preview at `burakkp-com.pages.dev`) |
| DNS | Both domains are zones in the same Cloudflare account. DNS is already configured. |
| Hostnames | Apex domains only. No `www`. |

## Build settings

Create each project under **Workers & Pages → Create → Pages → Connect to Git**, then pick `burakkp/my-website-and-blog`. Grant the Cloudflare GitHub app access to this repository only.

| Setting | Blog project | Portfolio project |
| --- | --- | --- |
| Production branch | `main` | `main` |
| Framework preset | Astro | Astro |
| Root directory (advanced) | `burakkp.dev` | `burakkp.com` |
| Build command | `npm run check && npm run build` | `npm run check && npm run build` |
| Build output directory | `dist` | `dist` |
| Environment variable (Production and Preview) | `NODE_VERSION` = `22.23.4` | `NODE_VERSION` = `22.23.4` |
| Build watch paths, include (Settings → Builds) | `burakkp.dev/*` | `burakkp.com/*` |

The output directory is relative to the root directory, so `dist` is correct for both.

Build watch paths stop a commit that only touches one site from rebuilding the other. Add them after the first deployment succeeds. If you change shared root files such as this document, neither project rebuilds, which is intended.

No environment secrets, Functions, or server adapter are needed. Both sites are fully static.

## Files Cloudflare reads from each site

These live in each site's `public/` folder and are copied into `dist/` at build time.

| File | Site | Purpose |
| --- | --- | --- |
| `_headers` | both | Security headers, and long-lived caching for fingerprinted `/_astro/*` assets |
| `_redirects` | blog | Hashnode URL redirects. It currently holds **example entries only**. |
| `robots.txt` | both | Points crawlers at the sitemap |

## Custom domains

Do this only after the `*.pages.dev` deployment looks right.

1. In the `burakkp-dev` project, open **Custom domains → Set up a custom domain** and enter `burakkp.dev`.
2. In the `burakkp-com` project, do the same with `burakkp.com`.
3. Both zones are in this account, so Cloudflare creates or updates the DNS record itself. No manual DNS change is needed.

Both domains are live today. If a domain's apex already points somewhere else, Cloudflare asks to replace that record when you add the custom domain. That moment is the switch to the new site, so do it only when you are ready.

Both sites set their canonical URL to the apex domain in `astro.config.mjs`.

## Verify after deploy

```bash
for d in burakkp.dev burakkp.com; do
  curl -sI https://$d/ | head -1
  curl -sI https://$d/sitemap-index.xml | head -1
  curl -sI https://$d/a-page-that-does-not-exist | head -1
  curl -sI https://$d/_astro/ | grep -i cache-control
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

In the Pages project, open **Deployments**, pick the last good deployment, and choose **Rollback to this deployment**. For a code fix, run `git revert <bad-commit>` and push. Do not force-push `main`.
