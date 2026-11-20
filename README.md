# my-website-and-blog

Source for two static Astro sites, each deployed as its own Cloudflare Pages project from this repository.

| Folder | Site | Purpose |
| --- | --- | --- |
| [`burakkp.dev/`](burakkp.dev/README.md) | https://burakkp.dev | Technical blog (Markdown/MDX, RSS, Hashnode redirects) |
| [`burakkp.com/`](burakkp.com/README.md) | https://burakkp.com | Developer portfolio and project pages |

Each folder is an independent npm project with its own `package.json` and lockfile. There is no shared workspace tooling.

## Run locally

Both sites need Node **22.23.4 or newer**.

```bash
source ~/.nvm/nvm.sh && nvm use 22.23.5   # or any installed version >= 22.23.4
npm --prefix burakkp.dev ci
npm --prefix burakkp.com ci
npm --prefix burakkp.dev run dev -- --port 4321
npm --prefix burakkp.com run dev -- --port 4322
```

## Deploy

Deployment setup for Cloudflare Pages is in [docs/cloudflare-pages.md](docs/cloudflare-pages.md).

Other docs:

- [docs/implementation-plan.md](docs/implementation-plan.md): what was built and how it was verified.
- [agent_build_instructions.md](agent_build_instructions.md): the original project specification.
