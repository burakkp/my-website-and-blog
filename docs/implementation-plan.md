# Personal sites implementation plan

Reference: `agent_build_instructions.md`. Build locally; provide GitHub and Cloudflare Pages deployment instructions.

## Architecture and design

Two independent npm projects and Git repositories. Both render static HTML using Astro, strict TypeScript, and Tailwind v4 through Vite. No runtime adapter or client JavaScript is needed. Use system fonts and OS-selected light/dark themes.

- `burakkp.dev`: official blog template, MDX content collection, article list, reading layout, RSS, sitemap, and sample Hashnode redirects. Restrained blue accents, generous reading space, and explicit starter content.
- `burakkp.com`: official empty template, shared layout, reusable project grid, project details from Markdown/MDX content collections, cloud and fabrication sections. Ink/green terminal accents, large typography, responsive borders and grids. Project capabilities and URLs are not known; do not invent them.

## Steps

- [x] Scaffold official templates and install Tailwind, typography, and Astro checking dependencies. Verify the resolved Astro engine requirement against local Node.
- [x] Configure static output, canonical domains, strict typing, styles, metadata, favicons, and Git ignores.
- [x] Build the blog index/post layouts and sample content; add example migration redirects that resolve to real routes.
- [x] Build portfolio home, reusable project grid, and collection-backed detail pages for the four named projects.
- [x] Add per-project README files with exact setup, development, build, GitHub, Cloudflare Pages, and rollback commands. Source files contain the complete implementation.
- [x] Run `npm run check` and `npm run build` in each project; inspect generated HTML, links, redirects, RSS, sitemap, responsive CSS, and absence of client scripts.
- [x] Initialize both repositories on `main`, review all changes and whitespace, and report remaining content/deployment limitations.

## Acceptance checks

Both builds must succeed and produce `dist/index.html` and a custom 404 page. Blog articles must render through the typography layout and appear in RSS. Both projects must have Tailwind v4 with no legacy config. Portfolio links must lead to existing local detail pages. No invented metrics, project URLs, contact details, or client scripts. Deployment remains a documented user step as specified in the reference.

## Verification results

Validated on 2026-11-20 with temporary Node 22.23.4. Astro check: zero errors, warnings, or hints in both repositories. Production builds: six HTML pages per site, with RSS for the blog and sitemaps for both. npm installation audit after the scoped parser override: zero vulnerabilities in each project. Sixteen Chromium checks covered home/detail pages at 375px and 1440px in light/dark modes, including overflow, metadata, absent client scripts, and keyboard focus. Local links and fragments were checked across all generated pages.

Remaining launch work: replace starter blog articles, populate real project write-ups and URLs, map the actual Hashnode slugs, push to GitHub, and connect Cloudflare Pages. Cloudflare redirect execution and DNS cannot be validated until deployment. No remote repositories or deployments were created.
