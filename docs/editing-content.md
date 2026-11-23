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

Your job positions sync from LinkedIn every day through LinkedIn's Member Data Portability API, which is available to members in the EU, EEA and Switzerland. Change a job on LinkedIn, and the portfolio updates after the next daily run, at about 05:17 UTC. To sync right away, open the repository on GitHub, go to **Actions → LinkedIn sync → Run workflow**.

LinkedIn is the source of truth for Experience. The dashboard shows these entries, but edits there are overwritten by the next sync, and creating or deleting entries is turned off.

LinkedIn serves a periodic snapshot of your data, so an edit on LinkedIn can take a while to reach the API. If LinkedIn returns no data, the sync changes nothing, so the section is never wiped by mistake.

### Renewing the LinkedIn token

The token lasts one year and LinkedIn issues no refresh token. Two weeks before it expires, the daily run starts failing, and GitHub emails you. To renew:

```bash
cd burakkp.com
source ~/.nvm/nvm.sh && nvm use 22.23.5
read -r  LINKEDIN_CLIENT_ID     && export LINKEDIN_CLIENT_ID      # paste the Client ID from the LinkedIn app's Auth tab
read -rs LINKEDIN_CLIENT_SECRET && export LINKEDIN_CLIENT_SECRET  # paste the Primary Client Secret (hidden)
npm run linkedin:token
```

The script opens LinkedIn's consent page, then saves the new token and its expiry date as GitHub secrets. The LinkedIn app's **Auth** tab must list `http://localhost:8765/callback` as an authorized redirect URL.

### One-off import from a LinkedIn export

Without API access, you can import LinkedIn's data export instead. Go to **Settings & Privacy → Data privacy → Get a copy of your data**, unzip the download, and run `npm run import:linkedin -- <folder>`. If the daily sync is on, it replaces whatever the import wrote.

## GitHub repositories

The **Open source** section lists your public repositories that carry the GitHub topic `portfolio`. To show a repository, open it on GitHub, click the gear next to **About**, and add the topic `portfolio`. Archived repositories and forks are always skipped.

The list refreshes on every deploy of the portfolio. GitHub-only changes, such as a new description or topic, appear after the next deploy. To refresh without other changes, use **Retry deployment** on the `burakkp-com` Worker. If GitHub is unreachable during a build, the section hides and the deploy still succeeds.

You can change the topic, the maximum count or the username under **Site settings → Profile**.

Builds use GitHub's anonymous API limit, which is plenty for occasional deploys. If a build log shows `GitHub responded 403`, add a build variable `GITHUB_TOKEN` to the `burakkp-com` Worker. Use a fine-grained token with no repository access. Public data needs no permissions.
