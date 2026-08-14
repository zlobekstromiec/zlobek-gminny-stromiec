# Development environment — Publiczny Żłobek w Stromcu

Machine-contract onboarding doc (D-08). Read this first when setting up the
project on a new machine or handing it over to a future maintainer. Global dev
conventions (asdf / direnv / pre-commit) apply as elsewhere; this file records
the project-specific specifics.

## Repository & hosting

| Item              | Value                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| GitHub repository | `zlobekstromiec/zlobek-gminny-stromiec` (dedicated Org, D-06/D-07)                                 |
| Repository URL    | https://github.com/zlobekstromiec/zlobek-gminny-stromiec                                           |
| Default branch    | `main` (push to `main` → Cloudflare Pages auto build+deploy)                                       |
| Hosting           | Cloudflare Pages — free `*.pages.dev` in Phase 1 (D-04/D-05)                                       |
| Pages project     | `zlobek-gminny-stromiec` (account `b34639a1c6eccab5d37ed6a2aa697deb`)                              |
| Live URL          | **https://zlobek-gminny-stromiec.pages.dev** (git-integration; push to `main` → auto build+deploy) |

The repository is owned by the dedicated GitHub Organization `zlobekstromiec` (not
a personal account) so the whole operational surface — repo, CMS OAuth App, staff
editors — can be handed over intact to a future maintainer / the Gmina (D-07).

## Toolchain

| Tool       | Pin / source                                     | Notes                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js    | `.tool-versions` → **nodejs 22.23.2** (even LTS) | Do **not** build on Node 25 (Current/odd). Matches the Cloudflare Pages build runtime.                                                                                                                   |
| npm        | bundled with Node 22                             | Lockfile committed (`package-lock.json`).                                                                                                                                                                |
| asdf       | `.tool-versions`                                 | Run `asdf install` in the repo to match the pinned Node.                                                                                                                                                 |
| direnv     | `.envrc` (gitignored)                            | Loads the scoped `CLOUDFLARE_API_TOKEN` for Wrangler. **Pages + Turnstile scope only**: no Workers KV, no zone DNS. App secrets live in the Pages project, never here. Run `direnv allow` after editing. |
| pre-commit | `.pre-commit-config.yaml`                        | Install with `brew install pre-commit` (or `pipx install pre-commit`), then `pre-commit install`.                                                                                                        |

## First-time setup

```bash
asdf install                 # install pinned Node (22.23.2)
npm install                  # install dependencies
npx playwright install chromium   # browser for the a11y smoke test
pre-commit install           # wire the local commit gate
direnv allow                 # load .envrc (Cloudflare token)
```

## Everyday commands

| Command           | What it does                                                                           |
| ----------------- | -------------------------------------------------------------------------------------- |
| `npm run dev`     | Vite dev server.                                                                       |
| `npm run build`   | `wrangler types --check && vite build` → output **`.svelte-kit/cloudflare`**.          |
| `npm run preview` | Serves the built Cloudflare output locally via `wrangler pages dev` on `:4173`.        |
| `npm run check`   | `wrangler types --check` + `svelte-kit sync` + `svelte-check` (types + compiler a11y). |
| `npm run lint`    | `prettier --check .` + `eslint .`.                                                     |
| `npm run format`  | `prettier --write .` (source only; `.planning/` is ignored).                           |
| `npm run test`    | Playwright + `@axe-core/playwright` homepage acceptance/a11y suite.                    |

## Verify-before-commit gate

Always green before committing (also enforced by the pre-commit hook):

```bash
npm run check && npm run lint && npm run test
```

## Cloudflare Pages build settings (Git integration — D-04/D-05)

Confirmed-live settings on the Pages project (push to `main` → auto build + deploy):

| Setting                | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Framework preset       | SvelteKit                                      |
| Build command          | `npm run build`                                |
| Build output directory | `.svelte-kit/cloudflare`                       |
| Node version           | `NODE_VERSION = 22` (matches `.tool-versions`) |

The free `*.pages.dev` subdomain stays the working origin. The custom domain
`zlobekstromiec.pl` (and `www.`) is **attached** to the Pages project, but the site
stays `noindex` + robots-disallowed on every origin until the Phase 6 launch
hardening removes the placeholder guard.

> **`wrangler.jsonc` is the source of truth for Pages bindings.** While that file
> exists, the equivalent settings are visible but **not editable** in the dashboard.
> Secrets are the one exception: they are never written to `wrangler.jsonc` and are
> set with `wrangler pages secret put`. A secret only reaches deployments created
> **after** it was set, so set secrets before the push that needs them.

## Forms: secrets and local runs (FORM-01 / FORM-02)

Set once against the Pages project, encrypted, never readable back and never in git:

| Secret                 | Purpose                                                               | Where it comes from                           |
| ---------------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| `RESEND_API_KEY`       | Authenticates the Resend send call. Sending permission only.          | Resend dashboard, shown once at creation.     |
| `TURNSTILE_SECRET_KEY` | Server-side `siteverify`. Must be the pair of the committed site key. | Turnstile widget `widget-zlobekstromiec`.     |
| `RATE_LIMIT_SALT`      | Salts the SHA-256 rate-limit key so stored hashes are not reversible. | Freshly generated random value, never reused. |

```bash
# set (value on stdin, so it never lands in shell history or a file)
openssl rand -hex 32 | npx wrangler pages secret put RATE_LIMIT_SALT --project-name zlobek-gminny-stromiec
# confirm: prints NAMES ONLY, never values
npx wrangler pages secret list --project-name zlobek-gminny-stromiec
```

Two further variables are **local-only and must never become Cloudflare Pages
variables**:

| Variable         | Why it must stay out of production                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FORM_DRY_RUN`   | `1` short-circuits the Resend call. Set in production, the site would silently stop delivering enrollment enquiries while still showing success.  |
| `RATE_LIMIT_MAX` | Deliberately loose in tests (the suite shares one IP). Left unset, production uses the strict module defaults: 5/hour/client and 40/day sitewide. |

`wrangler pages secret list` must therefore show **exactly the three secrets above
and neither of these two**.

### Local and CI runs: do NOT create `.dev.vars`

`.dev.vars.example` is a reference document only. Copying it to `.dev.vars` breaks
both `npm run check` and the Pages deploy: `wrangler types` reads `.dev.vars` and
writes every key into the committed `worker-configuration.d.ts` as a **required**
member, which Pages CI (no such file, it is gitignored) cannot reproduce, so
`wrangler types --check` fails with "types are out of date".

Use `npm run preview:test` instead. It is `wrangler pages dev` plus `--binding`
flags carrying the test values, which produce an identical `platform.env` while
`wrangler types` never sees them. `playwright.config.ts` already runs it, so the
endpoint suite needs no setup.

### The dummy Turnstile pair the test suite depends on

Cloudflare publishes an always-passes key pair. These are documented constants, not
credentials:

| Item       | Value                                 |
| ---------- | ------------------------------------- |
| Site key   | `1x00000000000000000000AA`            |
| Secret key | `1x0000000000000000000000000000000AA` |

The whole local suite rests on them. The **live** widget is hostname-scoped to the
Pages origin and the custom domain, so on `localhost` it issues no token at all and
every form success-path test would hang. `TurnstileWidget.svelte` therefore
substitutes the dummy site key on localhost, while `preview:test` supplies the
matching dummy secret. This cannot weaken production: acceptance is decided
server-side by `siteverify` against the live secret, so a dummy token fails closed.

### KV binding

`FORMS_KV` (declared in `wrangler.jsonc`) holds the rate-limit counters: integers
only, under a salted one-way hash of the client IP, with a one-hour TTL. No
submission content and no IP is ever stored. Free tier is 100k reads, 1k writes and
1 GB per day, orders of magnitude above two low-traffic forms capped at 40 sends a
day. If the binding is ever absent the limiter warns and degrades to Turnstile-only
protection rather than throwing.

Creating the namespace needs a token with **Workers KV Storage: Edit**; the scoped
`.envrc` token is Pages + Turnstile only, so `wrangler kv namespace create` fails
with `Authentication error [code: 10000]` until the token is widened.

### Mail path

Mail is sent from the **verified** sending domain `send.zlobekstromiec.pl`
(Resend, **EU region `eu-west-1`**). DNS for `zlobekstromiec.pl` is hosted on
**Cloudflare** (registration remains at home.pl). Because Resend's Return-Path
prefix is itself `send`, SPF and MX sit one level deeper than the sending domain:

| Record | Name                                                                         |
| ------ | ---------------------------------------------------------------------------- |
| SPF    | TXT `send.send.zlobekstromiec.pl`                                            |
| MX     | `send.send.zlobekstromiec.pl` (priority 10)                                  |
| DKIM   | TXT `resend._domainkey.send.zlobekstromiec.pl` (a TXT record, never a CNAME) |
| DMARC  | TXT `_dmarc.zlobekstromiec.pl` (`p=none`)                                    |

The recipient `zlobek@ugstromiec.pl` is hard-coded and **does not exist yet**
(pending Gmina approval), so the `to:` leg bounces and the BCC backup mailbox is
currently the only one that receives submissions.

### Redeploy / handoff gotcha — create a **Pages** project, not a Worker

The current Cloudflare dashboard funnels "Import a repository" into the
**Workers** builder, which deploys via `npx wrangler deploy`. That is the wrong
flavor for this project: our build emits a `pages_build_output_dir`
(`.svelte-kit/cloudflare`) that only the **Pages** pipeline serves — a
git-connected Worker's first deploy fails. If you (re)connect the repo, use the
Pages deep link so you land in the correct flow:

```
https://dash.cloudflare.com/b34639a1c6eccab5d37ed6a2aa697deb/pages/new/provider/github
```

Also: if Cloudflare reports the GitHub App is "already installed", grant the
org-installed `cloudflare-workers-and-pages` app access to this repo
(GitHub → Org `zlobekstromiec` → Settings → GitHub Apps → Configure →
Repository access), since installation was scoped to selected repositories.

## Gotchas (project-specific)

- **adapter-cloudflare:** SvelteKit server routes _are_ the Pages Functions — do
  not hand-author a `/functions` dir. Read secrets via `event.platform.env.*`
  (none consumed in Phase 1), never `import.meta.env`.
- **Tailwind v4:** CSS-first `@theme{}` tokens in `src/app.css` — there is **no**
  `tailwind.config.js`.
- **Fonts:** self-hosted via `@fontsource` (RODO) — never the Google Fonts CDN.
- **Palette:** two-tier tokens (expressive decorative vs accessible text/UI).
  Never put bright yellow/orange on text. Contract: `01-UI-SPEC.md`.
