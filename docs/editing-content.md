# Editing content

Both sites have a web dashboard. Every save there becomes a commit on `main`, and Cloudflare redeploys the changed site in about a minute.

| Site | Dashboard | What you can edit |
| --- | --- | --- |
| Blog | https://burakkp.dev/admin/ | Posts: create, edit, delete, drafts, images |
| Portfolio | https://burakkp.com/admin/ | Projects, Experience, and Site settings (homepage text, links, GitHub section) |

Layout and design changes are code. Make those in an editor, not in the dashboard.

## One-time setup: sign-in token

The dashboard saves through your GitHub account, using a personal access token.

1. Open GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name it `website dashboard` and pick an expiry, such as one year.
3. Under **Repository access**, choose **Only select repositories** and select `burakkp/my-website-and-blog`.
4. Under **Repository permissions**, set **Contents** to **Read and write**. Leave everything else at its default.
5. Generate the token and copy it.
6. Open either dashboard, choose **Sign In Using Access Token**, and paste it.

The browser remembers the token, so you do this once per browser. Ignore the **Sign In with GitHub** button. It needs an extra OAuth service that this setup does not use. When the token expires, generate a new one the same way.

On a desktop Chromium browser you can also choose **Work with Local Repository**. Select the `MySites` folder to edit files on disk without a token, then commit and push yourself.

## Blog posts

- **New post:** Blog posts → New. The title becomes the address, for example `/blog/my-title/`.
- **Draft:** switch **Draft** on to save without publishing. Drafts never appear on the site or in RSS.
- **Images:** use the image button in the editor. Files go to `burakkp.dev/public/images/blog/`.
- **Delete:** open the post → Delete.

When you replace a Hashnode article, add a line to `burakkp.dev/public/_redirects` for its old address. This file is not editable in the dashboard.

## Portfolio projects

Each project has a card on the homepage and its own page. Use **Position on the page** to order the cards. **Website URL** and **Source code URL** are optional. When set, they appear as buttons on the project page.

## Experience from LinkedIn

LinkedIn does not offer an API for reading your own profile, so the import uses LinkedIn's official data export.

1. LinkedIn → **Settings & Privacy → Data privacy → Get a copy of your data**. Choose **Positions**, or the full archive, and request it. LinkedIn emails a link, usually within minutes.
2. Unzip the download.
3. From the `burakkp.com` folder, run:

   ```bash
   npm run import:linkedin -- ~/Downloads/linkedin-export
   git add src/content/experience && git commit -m "Import experience from LinkedIn" && git push
   ```

The import writes one entry per job. After that, edit them in the dashboard under **Experience**. Running the import again only adds new jobs and never overwrites your edits, unless you add `--overwrite`. The Experience section stays hidden while it has no entries.

## GitHub repositories

The **Open source** section lists your public repositories that carry the GitHub topic `portfolio`. To show a repository, open it on GitHub, click the gear next to **About**, and add the topic `portfolio`. Archived repositories and forks are always skipped.

The list refreshes on every deploy of the portfolio. GitHub-only changes, such as a new description or topic, appear after the next deploy. To refresh without other changes, use **Retry deployment** on the `burakkp-com` Worker. If GitHub is unreachable during a build, the section hides and the deploy still succeeds.

You can change the topic, the maximum count or the username under **Site settings → Profile**.

Builds use GitHub's anonymous API limit, which is plenty for occasional deploys. If a build log shows `GitHub responded 403`, add a build variable `GITHUB_TOKEN` to the `burakkp-com` Worker. Use a fine-grained token with no repository access. Public data needs no permissions.
