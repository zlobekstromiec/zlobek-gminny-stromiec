---
phase: 02-about-documents-cms
plan: 06
status: complete
gap_closure: true
---

# Summary 02-06: Admin UX gap closure

## What shipped

- **Icons fixed**: Material Symbols variable woff2 vendored to
  `static/admin/fonts/` with a same-family `@font-face` in the new
  `admin.css` (body-linked, wins cascade over the bundle's CSP-blocked
  jsDelivr rule). Ligature test renders `arrow_back` as a single 24px glyph.
- **Polish chrome**: `scripts/cms-sync.mjs` (new `cms:sync`) generates
  `locale-pl.js` from the installed `@sveltia/cms@0.189.0` `locales/pl.json`
  (371 keys incl. the `_sui` chrome strings), version-locked; `preboot.js`
  seeds the `sveltia-cms.locale` cache the bundle checks before its
  CSP-blocked unpkg fetch. Login screen and editor chrome verified Polish
  (Zaloguj się przez GitHub, Zapisz). Upstream translation is incomplete, so
  isolated English strings can remain (instrukcja tabela stays as fallback).
- **Warm light theme**: `preboot.js` seeds `theme: light` / `locale: pl` into
  `sveltia-cms.prefs` (absent fields only; explicit dark choice verified to
  survive reload) and mirrors `data-theme` pre-boot (no dark flash).
  `admin.css` maps the locked site tokens onto `--sui-*`: warm cream surface
  ramp (#fbfaf7 family), ink text ramp, brand-blue accents (#0369a1), focus
  ring #0c4a6e, Nunito (latin + latin-ext) at 16px base.
- **Guidance layer**: Polish collection `description` on all three
  collections (what it edits, where it appears, ~2 min publish delay),
  hints for the previously bare fields (kadra numbers, day-plan time/what,
  dokumenty kategoria), `app_title: Panel redakcyjny Żłobka w Stromcu`.
  Instrukcja section 7 rewritten (Język i wygląd edytora).

## Key constraints honored

- `sveltia-cms.js` byte-identical after `cms:sync` (pinning T-0204-01).
- `/admin/*` CSP untouched; zero successful external requests (update
  checker + GitHub status probe keep failing closed, cosmetic console noise).
- Stock dark theme retained for users who explicitly choose it.

## Verification evidence

Local `wrangler pages dev` (real `_headers`): icon ligature collapses to one
glyph; `document.fonts` shows CDN face `error` + local face `loaded`; chrome
Polish; `html[data-theme=light]` from first paint; explicit dark respected;
`npm run check` 0 errors, lint clean, Playwright 43/43.

## Remaining (belongs to 02-05 closeout)

Live login -> edit -> commit -> rebuild -> live loop on *.pages.dev with the
restyled editor, plus instrukcja screenshots (PLACEHOLDER markers).
