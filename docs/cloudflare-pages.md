# Cloudflare Pages setup

Both sites deploy from the GitHub repository `burakkp/my-website-and-blog` as **two separate Pages projects**. Each project builds only its own folder, set through the root directory.

## Values to fill in

These come from your Cloudflare account. Fill them in before connecting.

| Item | Value |
| --- | --- |
| Cloudflare account | _TBD_ |
| Pages project name for the blog | _TBD_ (suggested: `burakkp-dev`) |
| Pages project name for the portfolio | _TBD_ (suggested: `burakkp-com`) |
| Is `burakkp.dev` a zone in this account? | _TBD_ |
| Is `burakkp.com` a zone in this account? | _TBD_ |
| Use `www.` subdomains too? | _TBD_ |
| Current DNS records to replace (record them before switching) | _TBD_ |

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

1. In each Pages project, open **Custom domains → Set up a custom domain**.
2. Add `burakkp.dev` to the blog project and `burakkp.com` to the portfolio project.
3. If the domain is a zone in the same Cloudflare account, Cloudflare creates the DNS record for you. Otherwise, add the CNAME it shows at your DNS provider.
4. For a `www.` host, add it as a second custom domain. Then add a Bulk Redirect or Redirect Rule from `www` to the apex domain.

Both sites set their canonical URL to the apex domain in `astro.config.mjs`. Change the `site` value there if you choose `www` as primary.

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
