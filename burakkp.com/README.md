# burakkp.com

Developer portfolio based on the official Astro minimal (empty) template.

Astro 7, strict TypeScript, Tailwind CSS v4 through Vite, Markdown/MDX content collections, static output. System fonts, OS-selected light/dark mode, and no browser JavaScript. Dependencies are locked in `package-lock.json`.

## Run locally

Requires Node **22.23.4 or newer**. With nvm installed:

```bash
cd burakkp.com
nvm install
nvm use
npm ci
npm run check
npm run build
npm run dev -- --background --port 4322
```

Open http://localhost:4322. Manage the server with:

```bash
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

To inspect the production build:

```bash
npm run preview -- --port 4322
```

If your system Node is older, upgrade it or select the version in `.nvmrc`. During initial setup, a temporary Node was installed at `/tmp/mysites-node/node_modules/node/bin/node`; it is not part of the project and may disappear after a restart.

## Source map

- `astro.config.mjs`: canonical domain, static output, MDX, sitemap, Tailwind Vite plugin.
- `src/layouts/SiteLayout.astro`: document metadata, accessible navigation, global styles, footer.
- `src/styles/global.css`: Tailwind v4 imports, typography plugin, responsive layouts and themes.
- `src/content.config.ts`: validated content schema.
- `src/content/projects/`: editable Markdown/MDX content.
- `src/pages/`: routes, home page, and custom 404.
- `public/`: favicon, robots.txt.

The complete file contents are in this repository. No Tailwind v3 configuration or Cloudflare server adapter is required.

## Content before launch

The project names come from the specification. Their detail pages intentionally state that write-ups and links are not yet published; capabilities, results, metrics, and destinations have not been invented. Replace these short entries with real descriptions before launch. The visual monograms are illustrative, not official product logos.

Each project has `title`, `order`, `category`, `summary`, `mark`, and `tone` frontmatter. `tone` accepts `lime`, `blue`, `orange`, or `violet`. The reusable `ProjectsGrid.astro` sorts by `order` and links to generated `/projects/<slug>/` pages. Markdown and MDX are supported.

## Deploy

This site lives in the `burakkp.com/` folder of the GitHub repository `burakkp/my-website-and-blog`. It deploys as its own Cloudflare Worker (`burakkp-com`) with root directory `burakkp.com`, configured by `wrangler.jsonc`.

Full build settings, custom domain steps, checks and rollback are in [../docs/cloudflare-deploy.md](../docs/cloudflare-deploy.md).

## Dependency maintenance

The typography plugin pins an older CSS parser. A narrowly scoped npm override selects patched `postcss-selector-parser@6.1.5` for that plugin. Keep the override until the upstream dependency is fixed, then remove it and rerun `npm audit`, `npm run check`, and `npm run build`. Avoid `npm audit fix --force`, which currently suggests a typography downgrade.

## Original scaffold commands

Run these only in a new, empty parent directory; they create the template before the custom source changes in this repository:

```bash
npm create astro@latest burakkp.com -- --template minimal --typescript strict --no-install --no-git --yes
cd burakkp.com
npm install tailwindcss @tailwindcss/vite @tailwindcss/typography @astrojs/check typescript @astrojs/mdx @astrojs/sitemap
```

References: [Astro installation](https://docs.astro.build/en/install-and-setup/), [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/), [parser advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
