# burakkp.dev

Technical blog based on the official Astro Blog template.

Astro 7, strict TypeScript, Tailwind CSS v4 through Vite, Markdown/MDX content collections, static output. System fonts, OS-selected light/dark mode, and no browser JavaScript. Dependencies are locked in `package-lock.json`.

## Run locally

Requires Node **22.23.4 or newer**. With nvm installed:

```bash
cd burakkp.dev
nvm install
nvm use
npm ci
npm run check
npm run build
npm run dev -- --background --port 4321
```

Open http://localhost:4321. Manage the server with:

```bash
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

To inspect the production build:

```bash
npm run preview -- --port 4321
```

If your system Node is older, upgrade it or select the version in `.nvmrc`. During initial setup, a temporary Node was installed at `/tmp/mysites-node/node_modules/node/bin/node`; it is not part of the project and may disappear after a restart.

## Source map

- `astro.config.mjs`: canonical domain, static output, MDX, sitemap, Tailwind Vite plugin.
- `src/layouts/SiteLayout.astro`: document metadata, accessible navigation, global styles, footer.
- `src/styles/global.css`: Tailwind v4 imports, typography plugin, responsive layouts and themes.
- `src/content.config.ts`: validated content schema.
- `src/content/blog/`: editable Markdown/MDX content.
- `src/pages/`: routes, home page, and custom 404.
- `public/`: favicon, robots.txt and Hashnode redirect examples.

The complete file contents are in this repository. No Tailwind v3 configuration or Cloudflare server adapter is required.

## Content before launch

The two articles are explicitly labeled starter content, not actual migrated posts. Replace them with your writing. `src/components/PostList.astro` currently labels all entries “Starter article”; remove or make that label conditional when publishing real content.

Use this frontmatter for a new post in `src/content/blog/`:

```yaml
---
title: "Your article title"
description: "A short summary for readers and search engines."
pubDate: 2026-11-20
topic: "Go"
---
```

Markdown and MDX both render through `BlogPost.astro`, using `prose lg:prose-xl prose-blue dark:prose-invert`. Add `updatedDate` when needed. RSS is at `/rss.xml`; the sitemap is at `/sitemap-index.xml`.

Before replacing Hashnode, export the original URL inventory and article contents. Replace every dummy entry in `public/_redirects` with a real old path and the correct new `/blog/<slug>/` path, using status `301`. The included examples target working starter routes. Do not redirect all old articles to the home page. Verify each redirect on a Cloudflare preview deployment; Astro’s local preview does not implement Cloudflare’s `_redirects` rules.

## Deploy

This site lives in the `burakkp.dev/` folder of the GitHub repository `burakkp/my-website-and-blog`. It deploys as its own Cloudflare Pages project with root directory `burakkp.dev`.

Full build settings, custom domain steps, checks and rollback are in [../docs/cloudflare-pages.md](../docs/cloudflare-pages.md).

## Dependency maintenance

The typography plugin pins an older CSS parser. A narrowly scoped npm override selects patched `postcss-selector-parser@6.1.5` for that plugin. Keep the override until the upstream dependency is fixed, then remove it and rerun `npm audit`, `npm run check`, and `npm run build`. Avoid `npm audit fix --force`, which currently suggests a typography downgrade.

## Original scaffold commands

Run these only in a new, empty parent directory; they create the template before the custom source changes in this repository:

```bash
npm create astro@latest burakkp.dev -- --template blog --typescript strict --no-install --no-git --yes
cd burakkp.dev
npm install tailwindcss @tailwindcss/vite @tailwindcss/typography @astrojs/check typescript
```

References: [Astro installation](https://docs.astro.build/en/install-and-setup/), [Cloudflare Pages Astro deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [parser advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
