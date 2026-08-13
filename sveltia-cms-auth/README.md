# sveltia-cms-auth Worker (OAuth proxy for the /admin CMS)

Self-hosted GitHub OAuth proxy for the Sveltia CMS at `/admin`. Deployed as a
standalone Cloudflare Worker, separate from the Pages site. Vendored + pinned
from [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth)
(commit `cc7530f`, fetched 2026-08-13). Do not hot-link upstream; refresh by
re-fetching `src/index.js` at a new pinned commit.

## Why this exists

Cloudflare has no Netlify Git Gateway, so the GitHub OAuth `code -> access_token`
exchange must run server-side on a Worker holding the client secret. The browser
CMS bundle talks to this Worker for login, then commits directly to
`zlobekstromiec/zlobek-gminny-stromiec@main` via the GitHub API (CMS-01/CMS-02).

## One-time deploy (human + Cloudflare/GitHub Org admin)

Run from this directory. Wrangler auth comes from the scoped `CLOUDFLARE_API_TOKEN`
in the repo-root gitignored `.envrc` (see project CLAUDE.md).

1. **Deploy the Worker first** to learn its URL:
   ```sh
   npx wrangler deploy
   ```
   Note the deployed origin, e.g. `https://sveltia-cms-auth.<subdomain>.workers.dev`.

2. **Create the GitHub OAuth App** under the `zlobekstromiec` Org
   (Settings -> Developer settings -> OAuth Apps -> New):
   - **Homepage URL:** `https://zlobek-gminny-stromiec.pages.dev`
   - **Authorization callback URL:** `<worker-origin>/callback`
   - Generate a client secret. Copy the **Client ID** and **Client Secret**.

3. **Set the Worker secrets** (encrypted at rest; never committed):
   ```sh
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```
   Verify with `npx wrangler secret list`.

4. **Finalize the CMS wiring** in the site repo so both point at the exact Worker
   origin from step 1 (they must match byte-for-byte):
   - `static/admin/config.yml` -> `backend.base_url`
   - `_headers` -> `/admin/*` `connect-src` entry

   If the deployed origin equals `https://sveltia-cms-auth.zlobekstromiec.workers.dev`
   (the value already committed), no edit is needed. Otherwise update both, commit,
   and push to `main` (Cloudflare Pages rebuilds automatically).

5. **Invite staff editors** as `zlobekstromiec` Org members with write access to
   the content repo (per-editor accounts for a per-person audit trail, D-19/D-22).

## Access control

`ALLOWED_DOMAINS` (in `wrangler.toml [vars]`, non-secret) restricts which site host
may initiate auth. It is set to the live Pages hostname. Add the custom domain
(comma-separated) once `zlobekstromiec.pl` is live.

## Local development

```sh
cp .dev.vars.example .dev.vars   # fill in from the OAuth App page (gitignored)
npx wrangler dev
```

## Endpoints

- `GET /auth?provider=github&site_id=<host>` starts the flow (CSRF cookie + redirect).
- `GET /callback` completes it (validates CSRF, exchanges the code, posts the token
  back to the CMS window). All other paths return 404.
