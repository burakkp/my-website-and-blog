# Project Specification: burakkp.com & burakkp.dev

**To the AI/Antigravity Agent:**
You are acting as a Senior Cloud Architect and Frontend Engineer. Your task is to scaffold, configure, and build two separate web projects for the user (Burak) based on the architectural plan below.

Both sites will be deployed to Cloudflare Pages via GitHub.

## 1. Global Tech Stack

* **Framework:** Astro (latest)

* **Styling:** Tailwind CSS v4

* **Content:** Markdown / MDX with Astro Content Collections

* **Hosting:** Cloudflare Pages

* **Package Manager:** npm

## 2. Project A: burakkp.dev (The Technical Blog)

**Description:** A highly performant, minimalist engineering blog focusing on Go, Cloudflare Workers, Linux administration, and parametric modeling.

### Setup Instructions

1. **Scaffold:** Run `npm create astro@latest burakkp.dev` using the official **Blog** template (TypeScript: Strict).

2. **Tailwind Integration:**

   * Install: `npm install tailwindcss @tailwindcss/vite @tailwindcss/typography`

   * Configure Vite in `astro.config.mjs`:

     ```
     import { defineConfig } from "astro/config";
     import tailwindcss from "@tailwindcss/vite";
     export default defineConfig({
       vite: { plugins: [tailwindcss()] }
     });
     
     ```

   * Create `src/styles/global.css`:

     ```
     @import "tailwindcss";
     @plugin "@tailwindcss/typography";
     
     ```

   * Import `global.css` into the main layout/Astro config.

3. **Typography & Styling:**

   * Update the blog post layout wrapper (e.g., `src/layouts/BlogPost.astro`) to use Tailwind typography with dark mode support.

   * Example wrapper: `<article class="prose lg:prose-xl prose-blue dark:prose-invert max-w-none"><slot /></article>`

4. **SEO & Migration (Crucial):**

   * Create a `public/_redirects` file to preserve Hashnode SEO.

   * Populate it with dummy paths for now, following this format:

     ```
     /old-hashnode-slug-1  /blog/new-astro-slug-1  301
     
     ```

## 3. Project B: burakkp.com (The Developer Portfolio)

**Description:** A professional hub showcasing SaaS projects (*BrandstofRadar, SanitiText, TriggerFlow, Last Whisper*), cloud architecture expertise, and 3D printing/OpenSCAD fabrications.
**Aesthetic:** Minimalist, high-impact, potentially incorporating a subtle retro-terminal/CLI vibe (inspired by the user's "Last Whisper" project).

### Setup Instructions

1. **Scaffold:** Run `npm create astro@latest burakkp.com` using the **Empty** template (TypeScript: Strict).

2. **Tailwind Integration:** Apply the same Tailwind v4 setup as Project A (Vite plugin + `global.css`). The typography plugin is optional here unless heavily relying on Markdown for project descriptions.

3. **Architecture:**

   * Create a landing page (`src/pages/index.astro`) featuring a hero section.

   * Create a "Projects" grid component.

   * Ensure the design is responsive, dark-mode ready, and heavily optimized (zero JavaScript shipped to the client unless interactive islands are needed).

## 4. Execution Directives for the Agent

1. Initialize local git repositories for both folders.

2. Provide the complete terminal commands and file contents needed to achieve the states described above.

3. Ensure all code follows Astro best practices and modern Tailwind v4 syntax (no `tailwind.config.js` files).

4. Once the local codebase is ready, outline the steps to push to GitHub (`burakkp-dev` and `burakkp-com` repos) and connect to Cloudflare Pages for deployment.