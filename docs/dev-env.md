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
a personal account) so the whole operational surface (the repo, the GitHub App the
editorial panel commits as, and the Pages project) can be handed over intact to a
future maintainer or to the Gmina (D-07). Staff editors are **not** GitHub accounts:
since Phase 04.1 they are e-mail addresses in a Pages secret, so a handover does not
involve inviting anybody to the Org.

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

| Command             | What it does                                                                           |
| ------------------- | -------------------------------------------------------------------------------------- |
| `npm run dev`       | Vite dev server.                                                                       |
| `npm run build`     | `wrangler types --check && vite build` → output **`.svelte-kit/cloudflare`**.          |
| `npm run preview`   | Serves the built Cloudflare output locally via `wrangler pages dev` on `:4173`.        |
| `npm run check`     | `wrangler types --check` + `svelte-kit sync` + `svelte-check` (types + compiler a11y). |
| `npm run lint`      | `prettier --check .` + `eslint .`.                                                     |
| `npm run format`    | `prettier --write .` (source only; `.planning/` is ignored).                           |
| `npm run test:unit` | `node --test` over the `tests/*.unit.ts` files (readers, validators, copy, session).   |
| `npm run test`      | Playwright + `@axe-core/playwright`: the public acceptance/a11y suites and the panel.  |

## Verify-before-commit gate

Always green before committing:

```bash
npm run check && npm run lint && npm run test:unit && npm run test
```

**The pre-commit hook runs only the first two.** It is `svelte-check` plus
`prettier`/`eslint`, so it catches a type error and a formatting drift and nothing
else. Neither test suite is enforced by any hook, and there is no CI workflow, so
both must be run by hand.

`npm run test:unit` is the one most easily forgotten, and it is the one with the
least excuse: the `.unit.ts` suffix deliberately sits outside Playwright's matcher,
so `npm run test` does **not** include it. It is the entire regression proof for the
form rate limiter, the content readers and the panel's session and one-time-code
logic. Two mutations were recorded as passing the other three gates while this suite
was the only thing that would have caught them (04-REVIEW.md).

One structural consequence worth knowing before writing tests: because the hook runs
`svelte-check` over the **whole working tree** rather than the staged index, a test
that imports a module which does not exist yet is a type error, and the hook then
refuses even an unrelated commit while that file sits untracked. A test-driven RED
commit is therefore not possible in this repository. Observe and record RED, then
land the test and its implementation in one commit. Do not reach for `--no-verify`.

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

| Secret                 | Purpose                                                                                                                                                                 | Where it comes from                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `RESEND_API_KEY`       | Authenticates the Resend send call. Sending permission only.                                                                                                            | Resend dashboard, shown once at creation.     |
| `TURNSTILE_SECRET_KEY` | Server-side `siteverify`. Must be the pair of the committed site key.                                                                                                   | Turnstile widget `widget-zlobekstromiec`.     |
| `RATE_LIMIT_SALT`      | Salts the SHA-256 rate-limit key so stored hashes are not reversible. If it is missing or blank the limiter is skipped entirely rather than running with an empty salt. | Freshly generated random value, never reused. |

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

Neither of those two may ever appear in `wrangler pages secret list`. The three
secrets above must all appear, alongside the five panel secrets in the next section:
**eight in total, and nothing else**.

## Editorial panel: secrets and access (CMS-01 / CMS-02, Phase 04.1)

The panel at `/admin` is our own SvelteKit code, not a vendor bundle. Five further
Pages secrets make it work, all set the same way as the form secrets above:

| Secret                       | Purpose                                                                                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN_EMAILS`               | The editor allowlist. Re-checked on **every** request, so removing an address logs that person out on their next request rather than at expiry. |
| `ADMIN_SESSION_SECRET`       | Signs the `__Host-panel_sesja` session cookie (HMAC-SHA256). Rotating it invalidates every existing session immediately.                        |
| `GITHUB_APP_CLIENT_ID`       | Identifies the org-owned GitHub App `Panel redakcyjny zlobka`, which is the panel's write identity.                                             |
| `GITHUB_APP_INSTALLATION_ID` | The App's installation on this one repository.                                                                                                  |
| `GITHUB_APP_PRIVATE_KEY`     | Signs the App JWT. Must be **PKCS#8**: GitHub hands out PKCS#1, and WebCrypto cannot import that form.                                          |

**Adding or removing an editor is two steps, and the second is the one people skip.**
Update `ADMIN_EMAILS`, then trigger a rebuild. A Pages secret only reaches
deployments created **after** it is set, so without the rebuild nothing changes.

`PANEL_DRY_RUN` is the panel's counterpart to `FORM_DRY_RUN`: `1` short-circuits the
commit so a save writes nothing. It is **local-only and must never become a Cloudflare
Pages variable**, for exactly the same reason: staff would see every save succeed
while nothing was ever written. `npm run preview:test` supplies it, along with test
values for all five secrets above, so the local suites need no setup.

Two properties are worth knowing before touching this code:

- **`/admin` must never have a static counterpart.** Cloudflare Pages resolves static
  assets before invoking the Worker, so a file under `static/admin/` would shadow the
  panel and its authentication gate would never run. This is not hypothetical: it is
  what forced the removal of the previous editor a phase earlier than planned.
- **No `/admin` route may import `src/lib/server/dokumenty.ts`.** It carries `node:fs`
  and the panel is the Worker, where only `nodejs_als` is enabled. The panel's own
  reader is `src/lib/server/admin/dokumenty.ts`.

Login codes are stored in the same `FORMS_KV` namespace as the rate-limit counters,
under `adm:kod:` plus a salted digest of the address. Neither the address nor the
code is stored in readable form, and a successful exchange deletes the entry.

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

`FORMS_KV` (declared in `wrangler.jsonc`) holds the rate-limit counters, plus the
pending panel login codes described in the previous section. The counters are
integers only, under two key shapes.

| Key        | Shape                                                                                                          | Example                              |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| per-client | salted one-way SHA-256 of the connection address truncated to 16 hex characters, then the hour-of-epoch bucket | `rl:kontakt:3f2a1c9d84b06e75:487654` |
| site-wide  | `rl:doba:` plus the UTC calendar date                                                                          | `rl:doba:2026-08-14`                 |

The bucket inside the key **is** the window: the hour of epoch for the per-client
ceiling, the UTC date for the daily one. The stored expiration is twice the window
and exists only to sweep buckets nobody writes to any more, so re-writing a key
never moves its boundary. (A KV write overwrites the previous expiration, so a
lifetime equal to the window would be restarted by every accepted request and the
counter would never reset.) No submission content and no IP is ever stored. Free
tier is 100k reads, 1k writes and 1 GB per day, orders of magnitude above two
low-traffic forms capped at 40 sends a day.

The limiter fails **open** on all three degrade paths, warning and falling back to
Turnstile-only protection rather than throwing or rejecting: an absent `FORMS_KV`
binding, a failing KV operation (a present but unusable binding, or a transient
error), and an unset or blank `RATE_LIMIT_SALT`. The last one skips the limiter
entirely on purpose: hashing without a salt would store an enumerable, and therefore
reversible, digest of the visitor's address.

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

The recipient `publicznyzlobek@ugstromiec.pl` is hard-coded. The placówka gave this
address in writing on 2026-08-27; it replaced an earlier address on the same domain
that was never a real mailbox, which is why the old rule forbidding a recipient change
is gone. A hard-coded `cc` copy also goes to the Urząd Gminy clerk who runs the
recruitment casework, and that recipient is disclosed in the klauzula informacyjna, so
the constant and the disclosure may never drift apart. **Delivery to the new mailbox is
not proven yet**, so the BCC backup mailbox stays; proving it is one form submission
after deploy plus a look in the inbox, and needs no deploy of its own.

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
