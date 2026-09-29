# Brief: ikona Facebooka na każdej stronie i przy Aktualnościach (2026-09-29)

The director asked (mail of 2026-09-29) for a Facebook icon on the site. The żłobek's page:
`https://www.facebook.com/profile.php?id=61593361692060` (strip the trailing `#` the user
pasted). The user's words: icons on all pages and beside Aktualności, linking to that page,
easy to find for parents and usable by people with visual disabilities.

## Where it goes (decision for the planner, keep it to these surfaces)

1. **Footer, every route** (`src/lib/components/Footer.svelte`): the `Informacje` column already
   holds the one external link on the site, the BIP link (lines ~91-103), with the locked
   pattern `target="_blank" rel="noopener noreferrer"` plus a visually-hidden „(otwiera się w
   nowej karcie)" suffix. Add a Facebook row using the same pattern: icon + visible text
   „Profil żłobka na Facebooku" (or similar Polish label; the icon alone is NOT the accessible
   name). `tests/nav.spec.ts:47-70` pins the BIP link and the three internal footer links; add
   the same shape of assertion for Facebook (exact href, target, rel, visible label).
2. **Top bar, every route** (`src/lib/components/TopBar.svelte`): phone left, hours right, white
   on `--color-brand-blue`, 14px/700. An icon-only link here is acceptable ONLY with an
   `aria-label` in Polish and a 44x44 hit area (UI-SPEC §: interactive targets min 44px even if
   the glyph is smaller). Read the comment at the top of the file: the two-column layout was
   built for phone+hours; adding a third item must not break the wrap at 390 px. Screenshot it.
   If the planner judges the top bar too tight, the footer plus the news surfaces satisfy „all
   pages" already (the footer is on every route); say so in the plan.
3. **Beside Aktualności**: the homepage news header (`src/lib/components/NewsPreview.svelte`
   ~line 17-21: `h2#news-heading` + `Cta „Zobacz wszystkie"`) and the `/aktualnosci` page head
   (`src/routes/aktualnosci/+page.svelte` ~line 26-32: `h1` + lead). Add a link with icon and
   visible text such as „Śledź nas na Facebooku" next to the heading or under the lead; do not
   put a link INSIDE the heading element. Keep the heading order the file comments describe
   (`/aktualnosci` h1 then visually-hidden h2; `tests/` assert heading order and the number of
   links in some places, check `tests/aktualnosci*.spec.ts` and `tests/home.spec.ts`).

## Single source of truth

Add the URL once to `contact` in `src/lib/content/site.ts` (e.g. `facebookUrl`), with a
comment naming the date and the director as the source, next to the phone and e-mail. Every
surface reads it; no literal in markup. `tests/forms-copy.unit.ts` keeps a closed set of
permitted addresses for e-mail only; the URL is not an e-mail, but check that no sweep rejects
a new field on `contact`.

## Icon

UI-SPEC: Lucide (`@lucide/svelte` is already a dependency) for utilitarian UI, bespoke duotone
SVGs under `src/lib/icons/` for expressive icons. Lucide ships `Facebook`. Use it, `aria-hidden="true"`,
sized 20 to 24 px, with the accessible name on the link text or `aria-label`. Colours from the
Accessible tier only; on the blue top bar the icon is white; in the footer use the footer link
colour. Focus ring visible (existing `.footer-link` focus styles). No emoji, no em dashes in
copy or comments.

## Accessibility acceptance (the user explicitly asked for this)

- Every Facebook link has a Polish accessible name that says where it goes and that it opens
  in a new tab (visible text or visually-hidden suffix, same as BIP).
- 44x44 minimum target for icon-only variants.
- axe clean on `/`, `/aktualnosci`, `/kontakt` (existing axe suites run on these).
- Screenshots at 390 px and 1280 px of the top bar, the footer and both Aktualności headers.

## Tests and copy that may pin the old state

- `tests/nav.spec.ts` (footer links, nav link count of 6 is the MAIN nav, untouched).
- `tests/home.spec.ts` may count links in the news section or assert the section's link texts.
- `tests/aktualnosci.spec.ts` (if present) heading order / link counts.
- `tests/admin-polski.spec.ts` scans PANEL routes only; public copy is not in scope.
- `docs/instrukcja-cms.md` only if a panel screen changes (none should).

## Constraints

- Verify chain: `npm run check && npm run lint && npm run test:unit && npm run test`; kill a
  stale wrangler on :4173 first; remove `.playwright-mcp/` and root screenshots before lint.
- Commits `type(quick-260929-ips): subject` ≤72 chars, Polish subject without diacritics,
  trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Do not commit `docs/documents/`, `.planning/config.json`, `.claude/settings.local.json`,
  root `logo.png`, `updated-logo.png`, the two design `.zip` files, or
  `.planning/quick/260827-*/260827-bfa-ODPOWIEDZ-2.md`.
