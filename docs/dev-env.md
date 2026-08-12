# Development environment — Żłobek Gminny Stromiec

Machine-contract onboarding doc (D-08). Read this first when setting up the
project on a new machine or handing it over to a future maintainer. Global dev
conventions (asdf / direnv / pre-commit) apply as elsewhere; this file records
the project-specific specifics.

## Toolchain

| Tool       | Pin / source                                     | Notes                                                                                                                                                     |
| ---------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js    | `.tool-versions` → **nodejs 22.23.2** (even LTS) | Do **not** build on Node 25 (Current/odd). Matches the Cloudflare Pages build runtime.                                                                    |
| npm        | bundled with Node 22                             | Lockfile committed (`package-lock.json`).                                                                                                                 |
| asdf       | `.tool-versions`                                 | Run `asdf install` in the repo to match the pinned Node.                                                                                                  |
| direnv     | `.envrc` (gitignored)                            | Loads the scoped `CLOUDFLARE_API_TOKEN` for Wrangler. No real app secrets in Phase 1 (Resend/Turnstile arrive Phase 4). Run `direnv allow` after editing. |
| pre-commit | `.pre-commit-config.yaml`                        | Install with `brew install pre-commit` (or `pipx install pre-commit`), then `pre-commit install`.                                                         |

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

Configure the Pages project (push to `main` → auto build + deploy):

| Setting                | Value                                          |
| ---------------------- | ---------------------------------------------- |
| Framework preset       | SvelteKit (or None)                            |
| Build command          | `npm run build`                                |
| Build output directory | `.svelte-kit/cloudflare`                       |
| Node version           | `NODE_VERSION = 22` (matches `.tool-versions`) |

Phase 1 ships to the free `*.pages.dev` subdomain; the custom domain
`zlobekstromiec.pl` is added at launch (Phase 6).

## Gotchas (project-specific)

- **adapter-cloudflare:** SvelteKit server routes _are_ the Pages Functions — do
  not hand-author a `/functions` dir. Read secrets via `event.platform.env.*`
  (none consumed in Phase 1), never `import.meta.env`.
- **Tailwind v4:** CSS-first `@theme{}` tokens in `src/app.css` — there is **no**
  `tailwind.config.js`.
- **Fonts:** self-hosted via `@fontsource` (RODO) — never the Google Fonts CDN.
- **Palette:** two-tier tokens (expressive decorative vs accessible text/UI).
  Never put bright yellow/orange on text. Contract: `01-UI-SPEC.md`.
