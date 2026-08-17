# Phase 5: Gallery & Fees - Research

**Researched:** 2026-08-17
**Domain:** SvelteKit 2 / Svelte 5 runes on Cloudflare Pages — one hydrated island on a prerendered content route, three panel screens on an existing in-house CMS, and a hand-rolled currency formatter
**Confidence:** HIGH (every load-bearing claim below was executed or read in this working tree; no external documentation was needed except one type-shape check inside `node_modules/`)

---

## Summary

`05-CONTEXT.md` (refreshed 2026-08-17, eleven-agent verified) and `05-UI-SPEC.md` (approved 6/6) already settle the *what*. This document does not restate them. It answers the six questions they leave open or flag as unresolved, and it corrects **four** claims those documents make about the code.

The phase's real difficulty is not the gallery and it is not the fees page. It is that **almost every property this phase adds is invisible to the only gate that actually runs.** `npm run test` (Playwright + axe) is the sole behavioural gate; `npm run test:unit` runs in no gate at all (AG-3); pre-commit is `check` + `lint` only; there is no CI. This phase adds at least four new `.unit.ts` suites and — more dangerously — leans on two *existing* unit suites (`admin-copy.unit.ts`'s `EKSPORTY` length assertion and `instrukcja.unit.ts`) that `05-UI-SPEC.md` Contract 12 describes as failing "loud". They do not fail loud. They fail only when a human types `npm run test:unit`. Of the seven enumeration surfaces a new panel screen must touch, exactly **one** (`TRASY` in `admin-polski.spec.ts`) fails inside an automated gate.

Second: the lightbox is the project's **first** open-overlay axe scan and its **first** proven focus trap. `AxeBuilder` is called in twelve spec files and every single call runs against a page in a load-time state. `nav.spec.ts:87-108` tests `MobileNav`'s dialog role, first focus, Escape and focus restore — but runs **no axe scan while the drawer is open** and asserts **no Tab cycling**. The "MobileNav is the correctness precedent" framing is right about the *implementation* and wrong about the *evidence*: there is no test to copy.

**Primary recommendation:** plan four MVP vertical slices in this order — (1) cennik store → `OPLATY` → `/cennik` → `/admin/cennik`; (2) `PowtarzalnaGrupa` reorder + cap, proven on the two existing mounts before any new screen uses it; (3) gallery store → `/o-nas` section → lightbox island → `/admin/galeria`; (4) `w-skrocie` store → KeyFacts → `/admin/w-skrocie` → panel shell, staff manual and the LOCKED-contract amendments. Add one new enforced gate in slice 1 that no phase has had before: a Playwright test that enumerates `src/routes/admin/**/+page.svelte` and asserts every route appears in `TRASY`, `SCIEZKI`, `SEKCJE` and the pulpit. That single test converts this phase's three genuinely silent failure modes into permanently loud ones, and it costs one file.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

`05-CONTEXT.md` is authoritative and is not reproduced here in full. Its structure maps onto this research as follows.

### Locked Decisions

D-01 to D-37 of `.planning/phases/05-gallery-fees/05-CONTEXT.md` §Implementation Decisions, in force verbatim. The ones this research touches directly:

- **D-37 (risk posture):** the phase is BUILT against its open risks. Nothing in the phase's own acceptance evidence may require real photography. The HEIC decode path (04.1 UAT row B2) and the stale-save conflict panel (row B4) stay isolated and named, and are carried to the Phase 6 launch gate. **The phase's own verification must state plainly which properties are proven and which are deferred.** This obligation is discharged by the `## Validation Architecture` section below.
- **D-35 (amount formatter):** must NOT be plain `Intl`; must live in `$lib`, never `$lib/server`.
- **D-32 (keyFacts to JSON):** fixed arity, no editor-writable icon key, runtime fallback, re-key the each block by index.
- **D-22 (reorder):** move-up / move-down as named form actions, keyboard operable, working with scripting disabled.
- **D-19 / D-20 (gallery on `/o-nas`, replacing "Nasze miejsce"):** requires a formal amendment to a LOCKED contract **before** the change.
- **D-02 (stale fee figures):** the strike was never applied and must be, in `DESIGN-BANK.md` *and* in `01-UI-SPEC.md:457` and `:471`.
- **D-36:** this phase does NOT tick CMS-01, CMS-02 or CMS-03.

### Claude's Discretion

All seven discretion areas of `05-CONTEXT.md` were **already resolved by `05-UI-SPEC.md` §Discretion Decisions Recorded** (gallery filename prefix `galeria-`, heading `Galeria: nasze miejsce`, anchor attributes, lightbox trigger and scope, `/cennik` structure, formatter location `src/lib/kwoty.ts` hand-rolled with ASCII space, per-tile placeholder boolean, hours unified via `src/lib/godziny.ts`, basename idiom extracted, move-button end state `disabled`). The planner implements those; it does not re-decide them. This research supplies the evidence that two of them are not merely preferences (§Amount Formatter, §Amendment Mechanics).

### Deferred Ideas (OUT OF SCOPE)

Per `05-CONTEXT.md` §Deferred Ideas: lightbox photo-to-photo navigation; a `treść zastępcza` boolean on the new content files beyond the per-tile one; a "Pełny cennik" link from `FeeBox`; contact-detail editing; the drag-to-position cropper; editor-defined extra fee rows; unifying the hours *if* D-33 excluded them (it did not — `05-UI-SPEC` Contract 7 unifies them); retiring B2 and B4 (Phase 6); AG-3 as a whole; `/dojazd` as a standalone page; correcting the "18 panel URLs" figure.

</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **GALLERY-01** | A visitor can view a photo gallery of the żłobek | §Lightbox Island (island shape, `Picture.img.src` as the no-JS href, open-state axe); §Validation Architecture rows GAL-1..GAL-6. Closable in this phase: `05-CONTEXT.md` D-10 REVERSED, D-19 puts the gallery on `/o-nas`, and neither requirement names a URL |
| **GALLERY-02** | Staff can add and remove gallery photos via the CMS | §`PowtarzalnaGrupa` Reorder (the shared-component regression surface, corrected); §Slice 3; §Validation Architecture rows GAL-7..GAL-10. The panel exists and is live (`STATE.md:40` is stale) |
| **FEES-01** | A visitor can read a fees page (opłaty, stawki), editable via the CMS | §Amount Formatter (verified); §keyFacts JSON Round Trip (the `OPLATY` cycle and the atoms rule); §Slice 1; §Validation Architecture rows FEE-1..FEE-9 |

**Not in scope and not ticked:** CMS-01, CMS-02, CMS-03 (`05-CONTEXT.md` D-36). They close on the Phase 04.1 UAT.

</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

Extracted from `./.claude/CLAUDE.md`. The planner must verify compliance; none of these is negotiable inside this phase.

| # | Directive | Consequence for this phase |
|---|-----------|---------------------------|
| 1 | **Polish only**, visitor-facing AND the whole panel, including validation and empty states | Three new panel URLs MUST join `TRASY` in `tests/admin-polski.spec.ts` or they carry ZERO Polish coverage. See §Validation Architecture / the enumeration gate |
| 2 | **WCAG 2.1 AA**, legally required, certified in Phase 6 | Lightbox open-state axe, focus trap, `prefers-reduced-motion`, 44×44 targets, the 2.4.4 link disambiguation |
| 3 | **RODO / wizerunek** | `02-UI-SPEC.md:115` D-04 (zero identifiable people) governs over `DESIGN-BANK.md:37`; no child's face ships |
| 4 | **Near-zero cost** | Zero new npm packages (`05-UI-SPEC` §Registry Safety). Every save is a Pages build against 500/month |
| 5 | **adapter-cloudflare:** SvelteKit server routes ARE the Pages Functions; secrets via `event.platform.env.*` | No `/functions` dir; no `import.meta.env` in server code |
| 6 | **Tailwind v4 CSS-first `@theme`; there is no `tailwind.config.js`** | Every new value must already exist in `src/app.css`. `05-UI-SPEC` introduces zero new tokens |
| 7 | **`/admin` is SvelteKit routes, never `static/admin/`** | Static assets resolve before the Worker and would bypass the auth gate outright |
| 8 | **Content is read at BUILD time; a save takes ~2 min** | Bounds UAT design, not just editor behaviour |
| 9 | **Do NOT create a root `.dev.vars`** | `wrangler types --check` bakes its keys into `worker-configuration.d.ts` and fails every Pages deploy |
| 10 | **Verify before commit:** `npm run check && npm run lint && npm run test:unit && npm run test`. Pre-commit runs only the first two; **nothing automated runs `test:unit`** | This is the AG-3 gap and it is the spine of §Validation Architecture |
| 11 | **Copy rules (user memory, hard):** no emoji, no em dashes anywhere in shipped copy, code comments, test names or commit messages; en dash only in numeric ranges; bespoke SVG icons | Applies to every string the phase writes |
| 12 | **Route file-changing work through GSD** | No direct edits outside a plan |

**Project skills:** neither `.claude/skills/` nor `.agents/skills/` exists in this repository (checked 2026-08-17). No project skill patterns apply.

---

## Corrections to `05-CONTEXT.md` and `05-UI-SPEC.md`

Four claims those documents make about the code are wrong or incomplete. Each was executed or read in the working tree. **Prefer these over the upstream text.**

### C-1. `PowtarzalnaGrupa` is mounted by TWO screens at THREE sites, not "four existing screens"

`05-CONTEXT.md` D-22 says "mounted by four existing screens". `05-UI-SPEC.md` Contract 9 enumerates them as "o nas wartości, o nas photos, plan dnia rows, and the o nas value group" — which double-counts the wartości group. Verified:

```
src/routes/admin/o-nas/+page.svelte:254      <PowtarzalnaGrupa   (wartości)
src/routes/admin/o-nas/+page.svelte:359      <PowtarzalnaGrupa   (zdjęcia, wlasnaRamka)
src/routes/admin/plan-dnia/+page.svelte:161  <PowtarzalnaGrupa   (wiersze)
```

`grep -rl PowtarzalnaGrupa src` returns exactly two files. **The regression surface is three mount sites across two routes.** [VERIFIED: grep of working tree]

This matters concretely: **`wlasnaRamka` is `true` at exactly one of the three** (`PowtarzalnaGrupa.svelte:143`), and that branch renders a `<div class="element">` instead of a `<fieldset class="element">`. The move buttons must be added to **both** branches of that `{#if}`, and the gallery — the screen that actually needs reordering — is the `wlasnaRamka` branch. A plan that adds the buttons to the visible `{:else}` fieldset branch only would ship a gallery with no reorder controls and two other screens that gained controls they were never meant to have.

### C-2. `useGrouping: 'always'` does NOT produce the shipped bytes — it emits NBSP

`05-CONTEXT.md` D-35 offers two remedies: "Pin `useGrouping: 'always'` **or** hand-roll the grouping". The first is refuted. Executed on this machine, Node v25.9.0:

```
new Intl.NumberFormat('pl-PL').format(1500)                      -> "1500"
new Intl.NumberFormat('pl-PL').format(2337)                      -> "2337"
new Intl.NumberFormat('pl-PL').format(9999)                      -> "9999"
new Intl.NumberFormat('pl-PL').format(10000)                     -> "10 000"
new Intl.NumberFormat('pl-PL',{useGrouping:'always'}).format(1500)
  -> "1 500"  codepoints: 31 a0 35 30 30      <-- U+00A0, NBSP
```

And the shipped bytes, read out of the file rather than retyped:

```
OPLATY.kwota = "1 500 zł miesięcznie"
codepoints:    31 20 35 30 30 20 7a 142 ...   <-- U+0020, ASCII space
```

[VERIFIED: `node -e` on the installed runtime + `fs.readFileSync` of `src/lib/content/rekrutacja.ts`]

So `useGrouping: 'always'` silently swaps an ASCII space for a NBSP. That is invisible on screen, invisible in a diff viewer, and it breaks `tests/home.spec.ts:112` (`await expect(facts.getByText('1 500 zł')).toBeVisible();`) with a failure message that shows two strings that look identical. **Hand-rolled grouping, the choice `05-UI-SPEC` Contract 5 already records, is now the only correct option and it has evidence rather than taste behind it.**

Two further facts the planner should carry into the unit test:
- The grouping suppression is exactly the four-digit band (`minimumGroupingDigits=2` in CLDR `pl`). `999` needs no separator, `1000` is the first value that does, `9999` is the last four-digit value, `10000` groups even under plain `Intl`. Those are the interesting cases.
- `liczbaWZakresie` at `src/lib/server/admin/walidacja/pola.ts:101-115` gates on `/^[0-9]{1,4}$/`, so the store can never hold five digits without widening that validator. D-28's "whole złoty, four digits maximum" is enforced by the existing code, not merely by convention. [VERIFIED: read of `pola.ts`]

### C-3. Writing `05-UI-SPEC.md` does not amend `01-UI-SPEC.md`. Two amendment idioms exist and one of them leaves no trace.

This is the mechanism by which the stale `400 zł` survived, and it is about to repeat. Verified by reading `01-UI-SPEC.md` (548 lines) and grepping every phase UI-SPEC:

| Amendment | Where it physically lives | Discoverable from `01-UI-SPEC.md`? |
|---|---|---|
| v1.1 | appended **inside** `01-UI-SPEC.md:344` | yes |
| v1.2 | appended **inside** `01-UI-SPEC.md:419` | yes |
| v1.3 | appended **inside** `01-UI-SPEC.md:475` | yes |
| **v1.4** | `04-UI-SPEC.md` frontmatter `amendment: v1.4` only | **no** |
| **v1.5** | `04.1-UI-SPEC.md:20` blockquote only | **no** |
| v1.6 | appended **inside** `01-UI-SPEC.md:496` | yes |

`grep -n "v1\.4\|v1\.5" 01-UI-SPEC.md` returns two incidental prose mentions (`:502` inside the v1.6 blockquote, `:533`) and no pointer section. [VERIFIED: grep]

**Consequence.** An agent told "`01-UI-SPEC.md` is LOCKED, follow it" reads `:457` and `:471`, finds `400 zł` and `14 zł/dzień`, and has no way to learn they are stale. Producing `05-UI-SPEC.md` does not change that. The amendment must be a **physical edit to `01-UI-SPEC.md`**: append `## Amendment v1.7 (2026-08-__): Galeria i Cennik` with the project's blockquote form (see the four in-file precedents for the exact shape — blockquote naming what stays in force and what is superseded, then numbered `### n.` sections), and strike the two stale lines **in place** so a reader of `:457` and `:471` cannot miss it.

**Acceptance gate shape.** The gate is a grep **on `01-UI-SPEC.md` itself**, not on the existence of `05-UI-SPEC.md`:
```bash
grep -c '400 zł' .planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md   # must be 0, or only inside the strike marker
grep -c '## Amendment v1.7' .planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md  # must be 1
```
The same applies to `DESIGN-BANK.md:31-32` (`grep -n "STRUCK\|struck\|skreśl"` still returns nothing there, confirming D-02's third correction). And note D-02's refuted carve-out: `DESIGN-BANK.md:32` carries `do 400 zł miesięcznie` **inside** the ZUS explainer, so the strike covers the explainer too. [VERIFIED: read of `DESIGN-BANK.md:25-40`]

### C-4. The `KNOWN_FUTURE_ROUTES` comment convention contradicts itself inside one comment block

`05-CONTEXT.md` D-18 calls the convention "a FICTION". Confirmed, and the contradiction is sharper than described. `svelte.config.js:19-23` states:

> `// All three paths are written WITHOUT the surrounding quotes on purpose: the`
> `// acceptance gate for each plan greps for the quoted form...`

while lines `:10-14` and `:27-28` of the same comment block name `'/aktualnosci'`, `'/aktualnosci/[slug]'`, `'/dokumenty'`, `'/deklaracja-dostepnosci'` and `'/polityka-prywatnosci'` **with** quotes. [VERIFIED: read of `svelte.config.js:1-30`]

**Reliable gate instead of a grep.** Two enforced checks, both real:
1. The prerender crawler. Once `'/cennik'` leaves the array, a broken link to it fails `vite build` — and `npm run build` runs inside `playwright.config.ts`'s `webServer` and inside every Pages deploy. This is genuinely enforced.
2. A build-adjacent assertion: `node -e "import('./svelte.config.js').then(m => process.exit(0))"` is not enough; instead assert the array is empty by importing the module and reading it, or simply delete the constant and its handler branch entirely, which is the honest end state once all three paths resolve.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gallery photo rendering | **CDN / Static** (prerendered HTML + `enhanced-img` assets) | Browser (lazy loading) | `prerender = true` is inherited from `src/routes/+layout.ts`; the grid is plain HTML with no runtime fetch |
| Lightbox open/close, focus, Escape | **Browser / Client** (hydrated island) | — | The only client-side state in this phase's public half. `<a href>` is the tier-free fallback |
| `/cennik` composition and arithmetic | **Build-time (SSR/prerender)** | — | `stawka - obnizka` is computed at build, never at runtime. The reader is the last place a bad number can be caught |
| Amount formatting | **Shared `$lib`** (build-time AND Worker) | — | The prerendered page and the panel's read-only echo line both need it. `src/lib/server/` is refused in client bundles — the constraint is recorded three times (`zdjecia.ts:1-18`, `stan-naboru.ts:1-28`, `pola-strony.ts:1-30`) |
| Panel form actions (add / remove / **move** / save) | **API / Backend** (SvelteKit server actions = Pages Functions) | — | Server round trips by design (`PowtarzalnaGrupa.svelte:1-40`), which is what makes them work with scripting disabled |
| Save-time validation | **API / Backend** (`src/lib/server/admin/walidacja/`) | Build-time reader (second guard) | Closed allowlists, absent field is a refusal (`walidacja/nabor.ts:36-42`) |
| Content persistence | **External (GitHub Git Data API)** | — | One atomic commit per save via the `Panel redakcyjny zlobka` App. Head-SHA conflict refusal already exists (04.1 D-10); do not build a second mechanism |
| Publication | **CI/CD (Cloudflare Pages git integration)** | — | ~2 min per save, 500 builds/month free ceiling |
| Wire vocabulary (control names) | **Shared `$lib`** (`pola-strony.ts`) | — | Both the rendering page and the reading action need the identical names; a half-landed rename refuses a field the editor already filled in |

**Tier misassignment this phase is most at risk of:** putting the reorder in the Browser tier (client state / drag) instead of the Backend tier. D-22 forbids it, and `PowtarzalnaGrupa.svelte:5-12` explains why in the component's own header: "A row added by client code exists only in a browser that ran it."

---

## Standard Stack

### Core

**This phase installs zero packages.** Everything below is already in `package.json` and already in use.

| Library | Installed version | Purpose | Why standard here |
|---------|-------------------|---------|-------------------|
| `svelte` | `^5.56.1` | Runes (`$state`, `$derived`, `$effect`, `$props`) | The lightbox island is `MobileNav.svelte` transposed; every rune it needs is already used there |
| `@sveltejs/kit` | `^2.63.0` | Named form actions, `prerender = true`, `fail()`/`redirect()` | The move actions are ordinary named actions; the singleton screen template is `admin/nabor/+page.server.ts` (129 lines) |
| `@sveltejs/adapter-cloudflare` | `^7.2.8` | Server routes ARE the Pages Functions | Unchanged by this phase |
| `@sveltejs/enhanced-img` | `0.11.0` (pinned exact) | `<enhanced:img>`, `Picture` objects, no CLS | Supplies the `href` for the no-JS lightbox path (see below) |
| `@lucide/svelte` | `^1.31.0` | `x`, `arrow-up`, `arrow-down`, `images` | Already the utilitarian icon source; import form is `@lucide/svelte/icons/<name>` (see `MobileNav.svelte:10-11`) |
| `tailwindcss` + `@tailwindcss/vite` | `^4.3.0` | CSS-first `@theme` in `src/app.css` | No `tailwind.config.js` exists and none may be created |
| `@playwright/test` | `^1.62.1` | The only behavioural gate | Supports `browser.newContext({ javaScriptEnabled: false })` — already used in five panel specs — and `emulateMedia({ reducedMotion })`, used nowhere yet |
| `@axe-core/playwright` | `^4.13.0` | WCAG 2.1 AA scans | Twelve spec files call `AxeBuilder`; none scans an open overlay |
| `node:test` (built in) | Node v25.9.0 | `npm run test:unit` | Runs in **no** gate (AG-3) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled grouping in `src/lib/kwoty.ts` | `Intl.NumberFormat('pl-PL', { useGrouping: 'always' })` | **Rejected with evidence (C-2):** emits U+00A0, not the shipped U+0020. Also ties output to the ICU data version of whatever runtime built the page — Node locally, workerd on Pages |
| `<a href>` tile intercepted by an island | `<button>` that opens the dialog | **Rejected (`05-UI-SPEC` Contract 2):** a button does nothing with scripting off. The `<a>` is a real affordance and the interception is narrow (plain unmodified primary click only) |
| Move-up / move-down named actions | Drag-and-drop, or client-side array reorder | **Rejected (D-22):** drag has its own accessibility bar and no no-JS path; client reorder violates the component's own no-scripting contract |
| Photos stored in `o-nas.json` | Their own `galeria.json` | Chosen (D-26). Removing `obiekt_zdjecia` is a **breaking** change: `/o-nas/+page.svelte:38-40` reads it with no guard (`onas.obiekt_zdjecia.map(...)`), so its absence is a `svelte-check` type error **and** an `undefined.map` at prerender. Reader and file change in one commit |
| New `galeria-` filename prefix | Reuse `obiekt-` | Chosen new (`05-UI-SPEC` §Discretion). Verified: `PREFIKS_O_NAS = 'obiekt-'` is declared at `uploads.ts:158` but **no `obiekt-` prefixed file exists on disk** — the two seeds are `sala-zabaw.jpg` and `plac-zabaw.jpg`, hand-placed. Migration cost of the new prefix is genuinely zero |

**Installation:** none.

---

## Package Legitimacy Audit

**Not applicable.** This phase installs no external packages. `05-UI-SPEC.md` §Registry Safety records the same: "This phase installs **zero** new npm packages, adds no external CDN and adds no third-party embed. Its net supply-chain movement is nil." No `package.json` diff is expected; a plan that produces one has drifted from the contract and should be stopped.

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

---

## Architecture Patterns

### System Architecture Diagram

```
                          ┌──────────────── EDITOR (phone or desktop) ───────────────┐
                          │                                                          │
                          v                                                          │
   /admin/galeria    /admin/cennik    /admin/w-skrocie          (session cookie gate) │
   /admin/o-nas      /admin/plan-dnia ...                        src/hooks.server.ts  │
        │                  │                  │                                      │
        │  named actions: ?/dodaj  ?/usun  ?/wGore  ?/wDol   <-- NO git, NO build ────┘
        │                  │                  │                    (re-render only)
        └────────┬─────────┴──────────────────┘
                 │  ?/zapisz  (the ONE action that writes)
                 v
        walidacja/<screen>.ts ──refusal──> Polish field errors + every typed value echoed back
                 │ ok
                 v
        serializujJson(dane)  =  JSON.stringify(x, null, '\t') + '\n'
                 │
                 v
        zapiszTresc({ pliki, usun, oczekiwanySha })
                 │                    │
                 │                    └── head SHA mismatch ──> 409 Polish conflict panel (04.1 D-10)
                 v
        GitHub Git Data API  ──  ONE atomic commit  ──>  zlobekstromiec/<repo> main
                 │
                 v
        Cloudflare Pages git integration  ──  vite build (~2 min, 500/month ceiling)
                 │
    ┌────────────┴───────────────────────────────────────────────────┐
    │  BUILD TIME                                                     │
    │  src/lib/content/{galeria,cennik,w-skrocie}.json                │
    │        │                                                        │
    │        ├─> readers in $lib (unknown-typed, guard-before-access, │
    │        │   warn-and-skip; postFromEntry precedent)              │
    │        │        │                                               │
    │        │        ├─> src/lib/kwoty.ts  (hand-rolled grouping)    │
    │        │        ├─> src/lib/godziny.ts (hours composer)         │
    │        │        │                                               │
    │        │        ├─> OPLATY (rekrutacja.ts)  -> FeeBox on /rekrutacja
    │        │        ├─> keyFacts values         -> KeyFacts on /
    │        │        ├─> /cennik page            -> panels + dl>div>dt/dd
    │        │        └─> /o-nas #galeria section -> <ul> of <a><enhanced:img>
    │        │                                                        │
    │        └─> enhanced-img processes src/lib/assets/uploads/*      │
    │            emitting Picture { img:{src,w,h}, sources:{...} }    │
    └────────────┬────────────────────────────────────────────────────┘
                 v
        PRERENDERED HTML on *.pages.dev / zlobekstromiec.pl
                 │
    ┌────────────┴────────────────────────────────────────────────────┐
    │  VISITOR                                                        │
    │                                                                 │
    │  scripting OFF ──> tile <a href={pic.img.src}> opens the photo  │
    │  scripting ON  ──> lightbox island intercepts a plain click     │
    │                    -> role=dialog aria-modal, close btn first,  │
    │                       bounded Tab trap, Escape, focus restored, │
    │                       body scroll locked, opacity fade honouring │
    │                       prefers-reduced-motion                     │
    └─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
src/lib/
├── kwoty.ts                     # NEW. Hand-rolled PLN grouping. $lib, never $lib/server
├── godziny.ts                   # NEW. Hours composer (4 atoms -> 4 surface strings)
├── zdjecia-nazwy.ts             # NEW (optional). The basename idiom, extracted per §Discretion
├── pola-strony.ts               # EXTEND. AKCJA_W_GORE / AKCJA_W_DOL, gallery + cennik + w-skrócie echo shapes
├── content/
│   ├── galeria.json             # NEW. Panel-written, tab-indented, trailing newline
│   ├── cennik.json              # NEW. stawka, obnizka, naglowek, kwotaOpis, zus, wyzywienie, nieobecnosc, placeholder
│   ├── cennik.ts                # NEW. /cennik prose that restates NO amount (D-04)
│   ├── w-skrocie.json           # NEW. Hours atoms + liczba miejsc + per-tile placeholder booleans
│   ├── rekrutacja.ts            # EDIT. OPLATY becomes a typed read; header at :8-13 rewritten
│   ├── site.ts                  # EDIT. keyFacts re-sourced; contact.hours derived
│   ├── o-nas.json               # EDIT. obiekt_zdjecia REMOVED (same commit as its reader)
│   └── panel.ts                 # EXTEND. New copy exports + NAWIGACJA 7 -> 9
├── components/
│   ├── Lightbox.svelte          # NEW. The fourth island
│   ├── KeyFacts.svelte          # EDIT. Re-key by index; icon/tint as a code-authored slot table
│   ├── Footer.svelte            # EDIT. Three links resolved/repointed; hours literal derived
│   └── admin/
│       └── PowtarzalnaGrupa.svelte   # EDIT. Opt-in `limit` + move props
├── server/admin/
│   ├── uploads.ts               # EXTEND. PREFIKS_GALERII, nazwaZdjeciaGalerii, zdjecieGaleriiDoUsuniecia
│   └── walidacja/
│       ├── galeria.ts           # NEW (~250 lines; reproduces the two-pass name reservation)
│       ├── cennik.ts            # NEW (cross-field invariant + conditional-zero rule)
│       └── w-skrocie.ts         # NEW (fixed arity)
src/routes/
├── cennik/+page.svelte          # NEW public route
├── o-nas/+page.svelte           # EDIT. Section 6 replaced; header comment :2-5 rewritten
├── kontakt/+page.svelte         # EDIT. Add id="dojazd" (see Pitfall 4)
└── admin/
    ├── galeria/                 # NEW
    ├── cennik/                  # NEW
    └── w-skrocie/               # NEW
tests/
├── kwoty.unit.ts                # NEW
├── cennik.spec.ts               # NEW (Playwright: the ONLY enforced fee gate)
├── galeria.spec.ts              # NEW (Playwright: gallery + lightbox + open-state axe)
├── admin-enumeracja.spec.ts     # NEW, RECOMMENDED. The route-enumeration gate (see §Validation)
├── admin-walidacja-{galeria,cennik,w-skrocie}.unit.ts  # NEW (unrun tier)
└── responsive.spec.ts           # EDIT. /cennik + a 768px and 1024px nav assertion
```

### Pattern 1: The hydrated island on a prerendered route

**What:** a component whose interactive behaviour is added on top of markup that already works. **When:** the lightbox, and nothing else in this phase.

The concrete shape, transposed from `MobileNav.svelte` which is the only working precedent in the repository:

```svelte
<script lang="ts">
  // Source: src/lib/components/MobileNav.svelte (verified working precedent)
  import X from '@lucide/svelte/icons/x';

  let { podpis, opis, zrodlo }: { podpis: string; opis: string; zrodlo: string } = $props();

  let otwarte = $state(false);
  let wyzwalacz: HTMLAnchorElement | undefined = $state();
  let przyciskZamkniecia: HTMLButtonElement | undefined = $state();
  let dialogEl: HTMLElement | undefined = $state();

  // MobileNav.svelte:30-33 verbatim: duration 0 under reduce, so the transition
  // itself is neutralised in JS as well as in the component's own @media guard.
  function czasRuchu(): number {
    if (typeof window === 'undefined') return 0;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 150;
  }

  // MobileNav.svelte:44-53 verbatim shape: lock scroll + move focus on open,
  // release + RESTORE focus in the effect's cleanup. The cleanup is what makes
  // "focus returns to the tile that opened it" true without a second code path.
  $effect(() => {
    if (!otwarte) return;
    const poprzedni = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    przyciskZamkniecia?.focus();
    return () => {
      document.body.style.overflow = poprzedni;
      wyzwalacz?.focus();
    };
  });

  // 05-UI-SPEC Contract 2: interception is NARROW. Modifier keys and middle-click
  // fall through so "open image in a new tab" keeps working.
  function klik(event: MouseEvent) {
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    otwarte = true;
  }

  // MobileNav.svelte:55-80 verbatim: Escape closes; Tab cycles within the bounded set.
  function klawisz(event: KeyboardEvent) { /* ...identical to MobileNav... */ }
</script>

<a bind:this={wyzwalacz} href={zrodlo} class="kafelek" onclick={klik}>
  <span class="visually-hidden">Powiększ zdjęcie: </span>
  <!-- <enhanced:img> lives in the PAGE, passed in as a snippet, so the island
       carries no image-processing concern -->
</a>

{#if otwarte}
  <div class="scrim" onclick={() => (otwarte = false)}></div>
  <div bind:this={dialogEl} role="dialog" aria-modal="true"
       aria-labelledby="lightbox-podpis" tabindex="-1" onkeydown={klawisz}>
    <button bind:this={przyciskZamkniecia} type="button" aria-label="Zamknij podgląd">
      <X size={24} aria-hidden="true" />
    </button>
    ...
  </div>
{/if}
```

Four properties of that shape that are load-bearing and easy to lose:

1. **The `$effect` cleanup is the focus-restore.** `MobileNav.svelte:49-52` restores focus in the teardown, not in an `onclick`. Doing it in the click handler means Escape and scrim-click each need their own restore, and one of them will be forgotten.
2. **`role="dialog"` + `aria-modal="true"` + `tabindex="-1"` on the dialog element**, with the keydown handler on the *dialog*, not on `window`. `MobileNav.svelte:103-113`.
3. **`transition:fade` duration comes from a function**, so `prefers-reduced-motion` is honoured in JS as well as in the CSS `@media` block. Both layers, exactly as `MobileNav.svelte:230-237` does.
4. **The scrim's static-element click handler needs the two `svelte-ignore` comments** (`MobileNav.svelte:99-100`) or `npm run check` fails on `a11y_click_events_have_key_events` and `a11y_no_static_element_interactions`. This will otherwise be discovered at commit time.

**The `/o-nas` header comment at `:2-5` must be rewritten in the same commit.** It currently reads "Prerendered, zero-JS (inherits prerender = true from +layout.ts): NO +server.ts, NO extra `<main>`...". The `prerender = true` half stays true; the zero-JS half stops being true. [VERIFIED: read of `src/routes/o-nas/+page.svelte:1-16`]

### Pattern 2: The no-JS href, and where it comes from

`05-UI-SPEC` Contract 2 says the tile is `<a href="{pełny obraz}">` but does not say what expression produces that URL. Verified from the installed package source:

```js
// node_modules/@sveltejs/enhanced-img/src/vite-plugin.js:338, 390-394
src: to_value(image.img.src),
{#each Object.entries(${src_var_name}.sources) as [format, srcset]}
src: `{${src_var_name}.img.src}`,
```

So a `Picture` is `{ img: { src, w, h }, sources: Record<format, srcset> }`, and `pic.img.src` is the **fallback** `<img src>` — a real, statically-known, hashed asset URL present in the prerendered HTML. [VERIFIED: read of `node_modules/@sveltejs/enhanced-img/src/vite-plugin.js`]

Two caveats for the plan to state rather than discover:
- `pic.img.src` is the widest *processed* variant in the original format, **not** the original upload. "Pełny obraz" in the contract should be read as "the largest variant the build produced", which is what the lightbox displays anyway.
- The existing page already resolves pictures by basename through an `import.meta.glob` map (`/o-nas/+page.svelte:26-36`), and `istniejaceNazwy()` in `uploads.ts:89-101` does the same glob server-side. That idiom is duplicated verbatim in three files today and this phase would make it four — `05-UI-SPEC` §Discretion says extract it. Note it is `import.meta.glob`, not `node:fs`, which is exactly why the panel (a Cloudflare Worker) can call it at all.

### Pattern 3: Extending `PowtarzalnaGrupa` without regressing three mounts

Both additions are opt-in props whose defaults render today's markup byte-identically (`05-UI-SPEC` Contract 9). The concrete extension shape:

```svelte
let {
  ...,
  limit,                          // number | undefined. Unset = today's behaviour
  akcjaWGore, akcjaWDol,          // string | undefined. Both unset = no move buttons
  etykietaWGore, etykietaWDol,    // Polish labels from panel.ts
  komunikatLimitu                 // Polish cap message replacing the add button
} = $props();
```

Four traps, three of them already recorded in `STATE.md` from 04.1-09 and confirmed in the working tree:

1. **Named actions only, never mixed with a default action.** `pola-strony.ts:76-79` states it: "SvelteKit forbids mixing the two on one page, so the save is named here as well." `?/wGore` and `?/wDol` join `AKCJA_ZAPISU`, `AKCJA_DODANIA_*`, `AKCJA_USUNIECIA_*` as exported constants so the `formaction` and the action table cannot drift.
2. **`use:enhance` must call `update({ reset: false })`.** Confirmed at `src/routes/admin/o-nas/+page.svelte:206-210` and `plan-dnia/+page.svelte:139-143`. Without it, the hydrated path wipes every typed value on a move — which is the same class of bug the add and remove actions were built to avoid.
3. **Svelte honours `autofocus` only at element creation.** `PowtarzalnaGrupa.svelte:28-35` documents this at length and the existing `$effect` at `:118-132` works from the *request* (`ZadanieFokusu`) rather than by querying for the attribute. The move actions must return a **fresh `ZadanieFokusu` object per response** (`pola-strony.ts:263-273` explains why: "A FRESH OBJECT PER RESPONSE, which is what lets the group component tell one answer from the next").
4. **New, not previously recorded:** `ZadanieFokusu` today is `{ cel: 'element'; indeks } | { cel: 'dodaj' }` and the effect focuses the item's **first form control** (`WYBIERALNE = 'input:not([type="hidden"]), select, textarea'` at `:116`). `05-UI-SPEC` Contract 9 requires focus to land on **the move button at the item's new position**, which is a `<button>` and is excluded by that selector by construction. So the union needs a third variant — something like `{ cel: 'przenies'; indeks: number; kierunek: 'gora' | 'dol' }` — and the effect needs a matching branch. Reusing `{ cel: 'element' }` would silently focus the caption input instead of the move button, and repeated clicks would then stop working, which is precisely the failure the contract's focus rule exists to prevent.

**Server-side move action shape** (mirroring `usunWartosc` at `o-nas/+page.server.ts:148-165`):

```ts
przeniesWGore: async ({ request }) => {
  const dane = await request.formData();
  const wartosci = wartosciGalerii(dane);
  const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.zdjecia.length);
  if (indeks === null || indeks === 0) {
    return { wartosci, pola: {}, sha: shaZFormularza(dane) };
  }
  const [element] = wartosci.zdjecia.splice(indeks, 1);
  wartosci.zdjecia.splice(indeks - 1, 0, element);
  return {
    wartosci, pola: {},
    status: przeniesionoZdjecie(indeks + 1, indeks),
    zadanie: { cel: 'przenies', indeks: indeks - 1, kierunek: 'gora' },
    sha: shaZFormularza(dane)
  };
}
```

`indeksZadania` (`pola-strony.ts:256-261`) is reused unchanged: it bounds the submitted index against the set that actually arrived, which is threat T-04.1-34's existing mitigation.

### Pattern 4: The reader that cannot take the site down

`src/lib/server/aktualnosci.ts` (`postFromEntry`) is the matured precedent and `05-CONTEXT.md` names it: entry typed `unknown`, container guarded before any property access, result built key by key and never by spreading, a malformed entry warns and returns `null` so one bad JSON cannot abort the whole-site prerender.

For this phase that discipline has a specific consequence per store:
- **`galeria.json`:** an entry whose `plik` is not in the `enhanced-img` glob is **dropped** at build. That is what makes `05-UI-SPEC` Contract 2's "the lightbox can never open onto nothing" true. The existing `/o-nas/+page.svelte:38-40` already does this with `.filter((item): item is {...} => Boolean(item.pic))` — copy that filter, do not re-derive it.
- **`cennik.json`:** the reader refuses to render a **negative** payable amount and falls back to hiding the breakdown (`05-UI-SPEC` Contract 4b). The `0 zł` regex does not match `-837 zł`, so the reader is genuinely the last catch.
- **`w-skrocie.json`:** the reader falls back to code-authored defaults with a build warning when the shape is wrong. Because `05-UI-SPEC` Contract 7 keeps the icon and tint **in code** as a fixed four-slot table zipped with the stored strings, the "editor typo takes the prerendered homepage down" hazard is deleted structurally rather than guarded. D-32's third constraint (a runtime icon fallback) becomes unnecessary — and the plan should say so explicitly rather than build a fallback for an input that cannot exist.

### Anti-Patterns to Avoid

- **A `<table>` on `/cennik`.** Splits an amount from its condition across cells; at mobile width they land on different visual rows, which is exactly what `dane-bip` §10 item 1 forbids. `dl > div > dt/dd` with the wrapper divs (bare `<dl>` and `<table>` have both already cost this project an axe failure).
- **Routing the homepage fee tile through `OPLATY`.** `rekrutacja.ts:23` already does `import { urzad } from '$lib/content/site'`, so the tile reading `OPLATY` would close a cycle. The tile reads the store or a shared composer, never `OPLATY` (D-03).
- **Treating `OPLATY` as atoms.** `kwota` is `'1 500 zł miesięcznie'`; the tile needs `'1 500 zł'`. Store the atoms; compose both.
- **Keying an `{#each}` by an editor-writable value.** `KeyFacts.svelte:20` is `{#each keyFacts as fact (fact.label)}`. A duplicated key throws in production. The repository has fixed this exact bug twice already — `/o-nas/+page.svelte:77-81` and `DayPlan.svelte:30-34` both key by position. Follow those.
- **A space-indented seed JSON.** `serializuj.ts:33-35` emits `JSON.stringify(dane, null, '\t') + '\n'` and `src/lib/content/` is deliberately **not** in `.prettierignore`, so the first panel save would reformat the file and block every local commit through `npm run lint`.
- **A `disabled` input for a read-only tile.** It looks typeable and is skipped by keyboard navigation with no explanation. Text plus a hint plus a link to the screen that owns the value (`05-UI-SPEC` Contract 11).
- **A grep-for-the-quoted-form acceptance criterion on `svelte.config.js`.** Permanent false positive (C-4).
- **Assuming `05-UI-SPEC.md` amends `01-UI-SPEC.md`.** It does not (C-3).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stale-save detection | A second conflict mechanism, a version counter, a timestamp | The existing head-SHA refusal, `zapiszTresc({ oczekiwanySha })` + the 409 conflict panel (04.1 D-10) | D-37 names this as one of two untested legs that must stay isolated. Two mechanisms means the untested one can never be retired cleanly |
| Atomic multi-file save | Two commits, or a commit-then-upload | `zapiszTresc` with one `pliki[]` array | Two commits are two builds (~4 min) and a window in which the page lists a photo nobody can load (`o-nas/+page.server.ts:12-14`) |
| Photo file naming and ownership | An editor-typed filename, a UUID, a timestamp | `nazwaZdjeciaONas`'s two-pass reservation (`uploads.ts:188-220`) reproduced for `galeria-`, plus the four-condition `zdjecieONasDoUsuniecia` (`:222-237`) | Staff never type a filename (D-14/P-25). The four conditions are what stop the panel deleting hand-placed files that other pages reference |
| Repeated-group add / remove / focus | Client-side array state | `PowtarzalnaGrupa` + named actions + `ZadanieFokusu` | Documented at length in the component's own 44-line header. No-scripting is a hard requirement |
| Image resize and crop | A server-side image pipeline, `sharp` in the Worker | The existing browser-side `ZdjecieIsland` (553 lines) at `PROPORCJA_O_NAS` | D-24 chose 4:3 precisely so the ratio prop is used unchanged. The server passes base64 through without decoding (`obraz.ts` header) |
| Responsive images | Manual `srcset`, a CDN transform | `<enhanced:img>` with a literal `src` and `w=` widths | The `?enhanced` import form emits density descriptors and browsers then ignore `sizes` (04-02, recorded in `05-UI-SPEC` §Inheritance Ledger) |
| Polish plural agreement (e.g. „Liczba zdjęć") | An inline ternary | `odmienRzeczownik` in `src/lib/liczebniki.ts` | Three forms are required in Polish; `liczebniki.ts:1-18` also records why `Intl.PluralRules` is rejected — it returns category names, not words |
| Number grouping | `Intl.NumberFormat` in any configuration | Hand-rolled in `src/lib/kwoty.ts` | See C-2. `Intl` is wrong twice: no separator by default, NBSP with `useGrouping: 'always'` |
| JSON serialization | `JSON.stringify(x, null, 2)`, prettier at write time | `serializujJson` | Byte-for-byte pinned by `tests/admin-walidacja-nabor.unit.ts:172-190`; every new store owes the same pin |
| Session / auth on the new panel routes | Anything | `src/routes/admin/+layout.server.ts` + `src/hooks.server.ts` | A new route under `/admin` is gated by inheritance. `admin/+layout.ts:12` also opts it out of prerender. No wiring needed |

**Key insight:** the plumbing for a new panel screen is free — `admin/nabor/+page.server.ts` is 129 lines and is a complete template. The real cost of a new screen is the **validator** (`walidacja/o-nas.ts` is 369 lines, of which roughly a hundred are the two-pass name reservation the gallery must reproduce rather than reference), the **copy exports**, the **wire vocabulary**, and the **seven enumeration surfaces** that must all be edited together. Size the plans against those, not against the route file.

---

## Runtime State Inventory

This is a feature phase, not a rename or migration, but two of its changes move data between files and one moves a repository path. The five categories, answered explicitly.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| **Stored data** | `src/lib/content/o-nas.json:27-30` holds `obiekt_zdjecia` as two one-line objects (`sala-zabaw.jpg`, `plac-zabaw.jpg`). D-26 moves them to `galeria.json`. `serializuj.ts:24-32` documents that the one-line formatting expands on the first panel save regardless | **Data migration + code edit in ONE commit.** Removing the key without changing `/o-nas/+page.svelte:38-40` is a `svelte-check` type error and an `undefined.map` at prerender |
| | The two image **files** stay on disk and are NOT deleted: `sala-zabaw.jpg` is also the cover of `2026-08-01-wielkie-otwarcie-zlobka.json`, and `zdjecieONasDoUsuniecia` (`uploads.ts:222-237`) refuses by construction to delete a name the panel did not generate | None. Explicitly a no-op; a later plan must not "fix" it |
| **Live service config** | The panel is **already deployed and staff-reachable** (04.1 UAT rows A0/A1/A2/B1/C1 passed live). `STATE.md:40` claiming otherwise is stale. Two panel saves exist in git history (`40329c0`, `dddfcd6`), both authored by `panel-redakcyjny-zlobka[bot]` | Do NOT schedule a redundant "push first" step. Assume panel work ships onto a live panel |
| | The orphaned `sveltia-cms-auth` Worker is still live (`/auth` and `/callback` answer 200). 04.1 teardown rows F1-F4 are outstanding | Not this phase's work. **Do not run teardown concurrently with live save testing** — F1 against the wrong object destroys the panel's write identity |
| **OS-registered state** | None. Verified: no scheduler, no pm2, no launchd, no systemd in this project. Deployment is Cloudflare Pages git integration only | None |
| **Secrets / env vars** | Eight Pages secrets exist and are correct (04.1 UAT row F5 passed 2026-08-17). This phase adds **no** secret. `preview:test` in `package.json` binds all of them with `-b` flags | None. **Do not create a root `.dev.vars`** (`wrangler types --check` would bake its keys into the committed `worker-configuration.d.ts` and fail every deploy) |
| **Build artifacts / installed packages** | `.svelte-kit/cloudflare` is regenerated per build. `enhanced-img` variants are content-hashed and regenerate from `src/lib/assets/uploads/`. No egg-info, no global install, no registry image tag | None |

**Two additional non-code artefacts this phase makes false and must rewrite:**
- `docs/instrukcja-cms.md` (411 lines, the single printable staff manual rendered by `/admin/pomoc`) — §2 says six pulpit tiles, §5 says photos are added on the O nas screen, §7 describes the facility photos. All three become false, and `tests/instrukcja.unit.ts:115-138, 158-238` pins required headings and verbatim copy quotes.
- `src/lib/assets/uploads/README.md` names `o-nas.json` as the home of the facility alt text.

---

## Common Pitfalls

### Pitfall 1: The reorder buttons ship on the wrong branch of `PowtarzalnaGrupa`

**What goes wrong:** move-up / move-down appear on the wartości and plan-dnia lists (which do not need them) and are absent from the gallery (which does).
**Why it happens:** `PowtarzalnaGrupa.svelte:143` branches on `wlasnaRamka`. The photo group is the `{#if}` branch (a `<div class="element">`, because the image island supplies its own fieldset+legend); the other two are the `{:else}` branch. A developer reading top-down edits the visually obvious `<fieldset class="element">` branch and stops.
**How to avoid:** add the button row to **both** branches, and write the acceptance criterion against the gallery screen (`wlasnaRamka` path) specifically, not against "a repeated group".
**Warning signs:** the button row renders on `/admin/plan-dnia` but not on `/admin/galeria`; or the o-nas photo group gains buttons it was never meant to have because the props were made non-optional.

### Pitfall 2: `ZadanieFokusu` cannot express "focus the move button"

**What goes wrong:** after a move, focus lands on the caption input instead of the button that performed the move, so repeated clicks stop working — the exact failure `05-UI-SPEC` Contract 9's focus rule exists to prevent.
**Why it happens:** the effect at `PowtarzalnaGrupa.svelte:118-132` focuses `karty[indeks].querySelector(WYBIERALNE)`, and `WYBIERALNE` (`:116`) is `'input:not([type="hidden"]), select, textarea'` — buttons are excluded **by construction**, deliberately, so an add never focuses a hidden field.
**How to avoid:** add a third `ZadanieFokusu` variant carrying the direction, and a matching effect branch that targets the button. Return a fresh object per response (`pola-strony.ts:263-273`).
**Warning signs:** a Playwright test that clicks „Przenieś wyżej" twice and finds the second click did nothing.

### Pitfall 3: `useGrouping: 'always'` looks correct and is not

Covered in full at C-2. **Warning sign:** a `toBeVisible()` failure whose expected and actual strings are visually identical.

### Pitfall 4: `#dojazd` does not exist on `/kontakt`

**What goes wrong:** the footer's „Dojazd" link is repointed from a 404 to `/kontakt#dojazd`, which lands at the top of `/kontakt` — worse than the 404 it replaced, because it looks like it worked.
**Why it happens:** `05-CONTEXT.md` D-17 treats the repoint as done and only `05-UI-SPEC` Contract 6 flags the prerequisite. Verified in the tree: `/kontakt/+page.svelte:101` is `<h2 id="mapa-heading">Mapa dojazdu</h2>` and `ContactAndMap.svelte:18` is `<h2 id="contact-heading">Kontakt i dojazd</h2>`. **There is no `id="dojazd"` anywhere in the repository.** [VERIFIED: grep]
**How to avoid:** add the anchor with the same treatment `#galeria` gets — `id`, `tabindex="-1"`, `scroll-margin-top: 96px` — and assert both fragments resolve in `tests/nav.spec.ts`.
**Warning signs:** none automatic. A fragment that resolves nowhere fails no test in this repository today.

### Pitfall 5: A new panel screen with zero Polish coverage

**What goes wrong:** `/admin/galeria` ships with an English string and nothing notices.
**Why it happens:** `tests/admin-polski.spec.ts:76-91` sweeps a hand-maintained `TRASY` array. **Verified: it holds fourteen routes**, not the eighteen stated in `.claude/CLAUDE.md:10`, `REQUIREMENTS.md:67`, `STATE.md:209` and `04.1-11-SUMMARY.md:115`. Nothing asserts that `TRASY` covers every `/admin/**` route.
**How to avoid:** the enumeration gate recommended in §Validation Architecture. It is one file and it retires this pitfall permanently.
**Warning signs:** none. This is the phase's most dangerous silent failure.

### Pitfall 6: The "loud" enumeration failures are in the unrun tier

**What goes wrong:** `05-UI-SPEC` Contract 12's failure-mode table marks three of seven surfaces as failing "loud" — `EKSPORTY` in `admin-copy.unit.ts`, the nav-order assertion, and the `instrukcja.unit.ts` manual gate. Verified: `admin-copy.unit.ts:212-215` is `assert.equal(EKSPORTY.length, Object.keys(panel).length)` and `:217-222` asserts the seven-label nav order — both real and both in `tests/*.unit.ts`, which `npm run test:unit` runs and **no gate invokes**.
**How to avoid:** treat only `TRASY` (Playwright) as enforced. Either run `npm run test:unit` by hand at every wave merge as an explicit plan step, or promote these three assertions into a `.spec.ts` file so `npm run test` picks them up.
**Warning signs:** a green `npm run test` on a build whose panel copy module has an unswept export.

### Pitfall 7: The seed JSON blocks every local commit on the first save

**What goes wrong:** the panel's first save to a new store reformats the file, and `npm run lint` (prettier `--check .`, part of pre-commit) then fails on an unrelated commit.
**Why it happens:** `serializuj.ts:33-35` emits tab indentation with a trailing newline; `src/lib/content/` is deliberately **not** in `.prettierignore`.
**How to avoid:** hand-author every new seed tab-indented with a trailing newline.

### Pitfall 8: The lightbox scrim fails `npm run check`

**What goes wrong:** pre-commit fails on `a11y_click_events_have_key_events` and `a11y_no_static_element_interactions`.
**Why it happens:** a scrim `<div>` with `onclick` and no keyboard handler. This is correct — keyboard users close with Escape or the close button — but the compiler cannot know that.
**How to avoid:** the two `svelte-ignore` comments verbatim from `MobileNav.svelte:99-100`, with the same explanatory comment above them.

### Pitfall 9: `obiekt_zdjecia` removed without its reader

**What goes wrong:** `svelte-check` type error, then `undefined.map` during prerender.
**Why it happens:** `/o-nas/+page.svelte:38-40` reads `onas.obiekt_zdjecia.map(...)` with no guard.
**How to avoid:** one commit for the file and its reader. Also update `tests/admin-strony.spec.ts` (eight anchors on the o-nas photos, including a hardcoded `zdjecie[2].dane`) and `tests/admin-walidacja-strony.unit.ts` (which uses the committed `o-nas.json` as an oracle and asserts the validator's output key set **and key order**) in the same commit.

### Pitfall 10: The nav breakpoint change is invisible to the suite

**What goes wrong:** moving the desktop nav from 768px to 1024px ships with no test either asserting or forbidding it, and a tablet regression goes unnoticed.
**Why it happens:** verified — `responsive.spec.ts:76-84` asserts the hamburger only at **375px**, `:88-99` asserts inline links only at **1280px**, and 768px appears only inside the no-horizontal-overflow loop over `/`. The change passes the current suite unchanged in either direction.
**How to avoid:** add explicit assertions at 768px (hamburger visible, inline links hidden) and 1024px (inline links visible, hamburger hidden), plus `/cennik` to `ROUTES` at `:32`.

---

## Code Examples

### Hand-rolled PLN grouping (`src/lib/kwoty.ts`)

```ts
// Source: derived from the verified Intl behaviour in this repository (Node v25.9.0)
// and the shipped bytes of OPLATY.kwota. NOT Intl: the default suppresses grouping in
// the four-digit band (CLDR pl minimumGroupingDigits=2) and useGrouping:'always'
// emits U+00A0 where the shipped string carries U+0020.
//
// $lib, never $lib/server: the prerendered page AND the panel (a Cloudflare Worker)
// both import it. Same boundary recorded at src/lib/zdjecia.ts:1-18,
// src/lib/stan-naboru.ts:1-28 and src/lib/pola-strony.ts:1-30.

/** ASCII space, U+0020. Byte-identical to the separator inside OPLATY.kwota. */
const SEPARATOR = ' ';

/** Whole złoty with a thousands separator, no currency suffix. */
export function grupujTysiace(kwota: number): string {
  const calkowita = Math.trunc(Math.abs(kwota));
  const cyfry = String(calkowita);
  let wynik = '';
  for (let i = cyfry.length; i > 0; i -= 3) {
    const kawalek = cyfry.slice(Math.max(0, i - 3), i);
    wynik = wynik === '' ? kawalek : kawalek + SEPARATOR + wynik;
  }
  return kwota < 0 ? '-' + wynik : wynik;
}

/** The rendered amount, for example „1 500 zł". */
export function zlote(kwota: number): string {
  return `${grupujTysiace(kwota)} zł`;
}
```

### The unit test that pins it to the shipped bytes (`tests/kwoty.unit.ts`)

```ts
// Source: the byte-identity discipline of tests/admin-walidacja-nabor.unit.ts:172-190.
// The last case is the one that matters: it reads the shipped string rather than
// retyping it, so a NBSP regression cannot pass by looking right.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zlote, grupujTysiace } from '../src/lib/kwoty.ts';
import { OPLATY } from '../src/lib/content/rekrutacja.ts';

test('grupowanie wlacza sie dopiero od czterech cyfr', () => {
  assert.equal(grupujTysiace(0), '0');
  assert.equal(grupujTysiace(1), '1');
  assert.equal(grupujTysiace(999), '999');
  assert.equal(grupujTysiace(1000), '1 000');
  assert.equal(grupujTysiace(1500), '1 500');
  assert.equal(grupujTysiace(2337), '2 337');
  assert.equal(grupujTysiace(9999), '9 999');
});

test('separator to spacja ASCII, nie NBSP', () => {
  assert.equal(zlote(1500).codePointAt(1), 0x20);
  assert.notEqual(zlote(1500).codePointAt(1), 0x00a0);
});

test('kwota jest bajt w bajt taka sama jak wysylana dzis na strone', () => {
  assert.ok(OPLATY.kwota.startsWith(zlote(1500)), OPLATY.kwota);
});
```

### The arithmetic assertion that cannot go red on an ordinary save (`tests/cennik.spec.ts`)

```ts
// Source: the interpolate-don't-retype discipline of this repository, applied to a
// surface an editor now owns. It reads the three RENDERED numbers and does the
// subtraction in the test, so it proves the page cannot contradict its own
// arithmetic without pinning any particular amount.
test('rozbicie kwoty zgadza sie z tym, co strona sama pokazuje', async ({ page }) => {
  await page.goto('/cennik');
  const wiersze = page.locator('.rozbicie dl > div');
  const liczba = async (i: number) =>
    Number((await wiersze.nth(i).locator('dd').innerText()).replace(/[^0-9-]/g, ''));
  const [stawka, obnizka, placi] = [await liczba(0), await liczba(1), await liczba(2)];
  expect(placi).toBe(stawka - obnizka);
  expect(obnizka).toBeGreaterThanOrEqual(0);
  expect(obnizka).toBeLessThan(stawka);
});
```

### The scoped conditional-zero pair (`tests/cennik.spec.ts`)

```ts
// 05-UI-SPEC Contract 4c: tests/rekrutacja.spec.ts:183 is NOT reusable here, because
// it forbids ANY zero inside .fee-box and /cennik deliberately renders one. The gate
// is a pair: every zero falls inside the ZUS block, and the page WITHOUT that block
// still satisfies the original regex.
const ZERO = /(^|[^0-9])0(,00)?\s*zł/;

test('kwota zero pojawia sie wylacznie razem ze swoim warunkiem', async ({ page }) => {
  await page.goto('/cennik');
  const blokZus = page.locator('#zus-blok');
  expect(await blokZus.innerText()).toMatch(/Aktywnie w żłobku/);
  expect(await blokZus.innerText()).toMatch(ZERO);

  const bezZus = await page.evaluate(() => {
    const main = document.querySelector('main')!.cloneNode(true) as HTMLElement;
    main.querySelector('#zus-blok')?.remove();
    return main.innerText;
  });
  expect(bezZus).not.toMatch(ZERO);
});
```

### Open-state axe and the bounded focus trap (`tests/galeria.spec.ts`)

```ts
// The project's FIRST open-overlay axe scan and FIRST focus-trap assertion.
// nav.spec.ts:87-108 proves the drawer's dialog role, first focus, Escape and focus
// restore, but runs no axe scan while open and never presses Tab. There is no
// precedent to copy; this is it.
test('powiekszenie zdjecia nie narusza WCAG 2.1 AA i domyka fokus', async ({ page }) => {
  await page.goto('/o-nas');
  const kafelek = page.locator('#galeria .kafelek').first();
  await kafelek.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  const zamknij = dialog.getByRole('button', { name: 'Zamknij podgląd' });
  await expect(zamknij).toBeFocused();

  // Bounded trap: Shift+Tab from the first focusable must not escape the dialog.
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

  const wynik = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(wynik.violations).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(kafelek).toBeFocused();
});

test('bez JavaScriptu kafelek jest zwyklym odnosnikiem do zdjecia', async ({ browser }) => {
  // Established pattern: browser.newContext({ javaScriptEnabled: false }) is used in
  // five panel specs already (admin-strony:105, admin-zdjecia:318, admin-nabor:240,
  // admin-dokumenty:372, admin-aktualnosci:576).
  const kontekst = await browser.newContext({ javaScriptEnabled: false });
  const strona = await kontekst.newPage();
  await strona.goto('/o-nas');
  const href = await strona.locator('#galeria .kafelek').first().getAttribute('href');
  expect(href).toMatch(/\.(jpe?g|png|webp)$/);
  await kontekst.close();
});
```

### The enumeration gate (`tests/admin-enumeracja.spec.ts`) — RECOMMENDED, new

```ts
// The single highest-leverage new gate in this phase. It converts the three genuinely
// silent enumeration failures (TRASY omission, SCIEZKI index misalignment, SEKCJE
// omission) into loud ones, permanently, and it runs inside npm run test.
import { readdirSync } from 'node:fs';
import { NAWIGACJA } from '../src/lib/content/panel';

test('kazdy ekran panelu jest objety polska zamiataczka', async () => {
  const ekrany = /* enumerate src/routes/admin/** /+page.svelte -> URL paths */;
  for (const sciezka of ekrany) {
    expect(TRASY.map((t) => t.sciezka), `brak ${sciezka} w TRASY`).toContainEqual(
      expect.stringContaining(sciezka)
    );
  }
});

test('SCIEZKI i NAWIGACJA maja te sama dlugosc i kazdy adres odpowiada', async ({ page }) => {
  expect(SCIEZKI.length).toBe(NAWIGACJA.length);
  for (const sciezka of SCIEZKI) {
    const odpowiedz = await page.goto(sciezka);
    expect(odpowiedz?.status(), sciezka).toBe(200);
  }
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact on this phase |
|--------------|------------------|--------------|----------------------|
| Sveltia CMS + `static/admin/` + `sveltia-cms-auth` Worker | In-house Polish panel: SvelteKit routes under `/admin`, e-mail one-time-code login, GitHub App write path | Phase 04.1 (2026-08-16) | `05-CONTEXT.md` D-08 is moot, D-11 is CLOSED. Phase 5 must not re-derive a write path |
| `/o-nas` "Nasze miejsce" facility grid, 1→2 columns | Gallery section `#galeria`, 1→2→3 columns, own store, own screen, lightbox | This phase (D-19, D-20, D-12) | Requires a formal amendment to a LOCKED contract before the change |
| Fee amounts as prose in `rekrutacja.ts` `OPLATY` | Atoms in `cennik.json`; `OPLATY`, the KeyFacts tile and `/cennik` all composed from them | This phase (D-03, D-28) | `rekrutacja.ts:8-13`'s "code-authored only" header must be rewritten in the same commit |
| `keyFacts` as a code array in `site.ts` | Stored strings zipped with a code-authored icon/tint slot table | This phase (D-32) | Reverses 04.1 D-16's "Ustawienia strony" deferral |
| Free MailChannels | Resend from a verified sending domain | Phase 4 | Untouched here |
| `svelte-check` + prettier as pre-commit; Playwright as the only behavioural gate | Unchanged | — | **This is the constraint, not a legacy.** AG-3 has been inherited by three phases and this is the fourth |

**Deprecated / outdated in the project's own documents:**
- `01-UI-SPEC.md:457` and `:471` — `400 zł` / `14 zł/dzień`, stale draft figures, never struck. Superseded by this phase.
- `.planning/DESIGN-BANK.md:31-32` §Cennik — struck by D-02, **including** the `do 400 zł miesięcznie` inside the ZUS explainer.
- `STATE.md:40` — claims the editing screens are not live. They are.
- The "18 panel URLs" figure in `.claude/CLAUDE.md:10`, `REQUIREMENTS.md:67`, `STATE.md:209`, `04.1-11-SUMMARY.md:115`. The real count is **14**.
- `svelte.config.js:19-23` — the "without quotes on purpose" convention, contradicted within the same comment block.
- `docs/instrukcja-cms.md` §2, §5, §7 and `src/lib/assets/uploads/README.md` — become false this phase.

---

## Slice Boundaries and Plan Count

MVP mode: vertical slices, each shippable and each ending green. Every panel save is one commit and one ~2-minute Pages build against a 500/month free ceiling, so **live** verification is the scarce resource, not build time.

**Recommendation: four plans.** Three would force the shared-component work to ride inside the gallery slice, where a regression on `/admin/plan-dnia` would be discovered late; five would split the fee store from its page for no benefit.

### Slice 1 — Fees, end to end (FEES-01)
`src/lib/kwoty.ts` + `tests/kwoty.unit.ts` → `cennik.json` seed + reader → `OPLATY` becomes a typed read (header at `rekrutacja.ts:8-13` rewritten) → `src/lib/content/cennik.ts` prose → `/cennik` page → `/cennik` leaves `KNOWN_FUTURE_ROUTES` → nav sixth item + footer repoints + `#dojazd` on `/kontakt` → `/admin/cennik` → `tests/cennik.spec.ts` + `responsive.spec.ts` additions.
**Why first:** it is the only slice with no dependency on the shared component or on the island, it establishes `kwoty.ts` which slice 4's KeyFacts needs, and it carries the nav change that everything else renders inside. It also lands the recommended `tests/admin-enumeracja.spec.ts` gate, so slices 3 and 4 inherit it.
**Ends green with:** `/cennik` live, an editor able to change a fee, the arithmetic and conditional-zero gates enforced.

### Slice 2 — `PowtarzalnaGrupa` reorder and cap (no new screen)
Opt-in `limit` and move props; both branches of `wlasnaRamka`; the third `ZadanieFokusu` variant; `?/wGore` / `?/wDol` wired on **the two existing screens** so the regression surface is proven before anything new depends on it; Polish copy exports; `use:enhance` `update({ reset: false })` verified on both.
**Why separate:** three mount sites, two of them screens this phase otherwise does not touch. Proving byte-identical defaults here is cheap; discovering a regression inside the gallery slice is not.
**Ends green with:** `/admin/o-nas` and `/admin/plan-dnia` rendering byte-identically without the new props, and reordering demonstrably working with scripting disabled.

### Slice 3 — Gallery, end to end (GALLERY-01, GALLERY-02)
`galeria.json` seed + reader → `obiekt_zdjecia` leaves `o-nas.json` **with** its reader → `/o-nas` section 6 replaced, `#galeria` anchor, three-column tier, header comment `:2-5` rewritten → `Lightbox.svelte` island → `PREFIKS_GALERII` + naming + ownership in `uploads.ts` → `walidacja/galeria.ts` → `/admin/galeria` with the twelve cap → `tests/galeria.spec.ts` (including the open-state axe, the trap and the no-JS path) → `tests/o-nas.spec.ts`, `admin-strony.spec.ts`, `admin-walidacja-strony.unit.ts` updated in lockstep.
**Largest slice.** If it needs splitting, the seam is: public half (store, reader, section, lightbox) then panel half (uploads, validator, screen). The public half is demonstrable with the two existing seed photos and needs no editor.

### Slice 4 — W skrócie, hours unification, and the contract amendments
`w-skrocie.json` + `src/lib/godziny.ts` → `keyFacts` re-sourced with the code-authored slot table and the index re-key → `contact.hours` derived, `Footer.svelte:78-80` literal removed → `/admin/w-skrocie` reached from a pulpit tile → panel nav 7→9, pulpit 6→9, `SEKCJE`, `EKSPORTY` → `docs/instrukcja-cms.md` rewrite + `uploads/README.md` → **the amendments**: `## Amendment v1.7` appended inside `01-UI-SPEC.md` with the `:457`/`:471` strike, and the `DESIGN-BANK.md:31-32` strike → `tests/home.spec.ts` lockstep.
**Why last:** it depends on `kwoty.ts` (slice 1) for the computed fee tile and it is the natural home for the documentation and contract sweep, which should reflect the finished shape rather than an intermediate one.

**Build economy for the live UAT:** the minimum honest evidence for the third ROADMAP success criterion is **three saves** — one on `/admin/cennik`, one on `/admin/galeria` (add and remove in the same sitting, which D-21's one-Zapisz shape makes one commit), one on `/admin/w-skrocie` — plus one wait for the rebuild. Roughly six minutes of wall clock and three of the 500 monthly builds. Do not schedule per-field saves.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build, `node --test`, `Intl` behaviour | ✓ | v25.9.0 | — |
| npm packages (all) | everything | ✓ | installed, `node_modules` present | — |
| Playwright + Chromium | the only behavioural gate | ✓ | `@playwright/test` ^1.62.1 | — |
| `@axe-core/playwright` | WCAG gate | ✓ | ^4.13.0 | — |
| `wrangler` | `npm run build` (`wrangler types --check`), `preview:test` | ✓ | ^4.97.0 | — |
| Cloudflare Pages project + 8 secrets | live save loop | ✓ | verified live 2026-08-17 (04.1 UAT F5) | — |
| GitHub App `Panel redakcyjny zlobka` | the panel's write identity | ✓ | App ID 4609238, two real commits in history | — |
| A live editor mailbox on `ADMIN_EMAILS` | live panel testing | ✓ | proven by 04.1 UAT A0/A1 | — |
| **Real żłobek photography** | retiring 04.1 UAT row B2 (HEIC) | **✗** | — | **Placeholder images on jpeg/png/webp, per D-37. Carried to the Phase 6 gate** |
| **A second concurrent editor session** | retiring 04.1 UAT row B4 (stale save) | **✗** | — | **Reuse the existing head-SHA refusal unchanged; carried to Phase 6** |
| **CI** | running any gate automatically | **✗** | — | **None. Human discipline is the only fallback. This is AG-3** |

**Missing dependencies with no fallback:** none that block this phase. CI is absent and cannot be fixed here; it is the constraint §Validation Architecture is designed around.

**Missing dependencies with fallback:** real photography and a second editor session — both are D-37's named, tracked deferrals, both carried to the Phase 6 launch gate where the real consented photo set lands anyway.

---

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`. D-37 additionally obliges this phase to "state plainly which properties are proven and which are deferred". This section is the discharge of that obligation and is the source `05-VALIDATION.md` is built from.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright 1.62 + `@axe-core/playwright` 4.13 (E2E/a11y); `node:test` via `node --test` (unit) |
| Config file | `playwright.config.ts` (`testDir: 'tests'`, `webServer: 'npm run build && npm run preview:test'`, chromium only, `baseURL http://localhost:4173`) |
| Quick run command | `npm run check` (~seconds; the only fast check that runs in a gate) |
| Unit command | `npm run test:unit` = `node --test tests/*.unit.ts` — **runs in NO gate** |
| Full suite command | `npm run check && npm run lint && npm run test:unit && npm run test` |
| Estimated runtime | full suite dominated by the `npm run build` inside Playwright's `webServer` |

### The five classes of evidence available in this repository

Naming them explicitly, because "add a test" is not a specification here — half the classes do not run.

| # | Class | Command / mechanism | Runs automatically? | What it can prove |
|---|-------|--------------------|--------------------|-------------------|
| **E1** | Type + a11y compile check | `npm run check` (`wrangler types --check` + `svelte-check`) | **YES — pre-commit** | Shape errors (a removed JSON key, a widened union), Svelte a11y compile rules, missing `svelte-ignore` |
| **E2** | Format check | `npm run lint` (`prettier --check .` + eslint) | **YES — pre-commit** | Seed JSON indentation; the panel's own output round-tripping cleanly |
| **E3** | Build / prerender failure | `vite build` — inside Playwright's `webServer` **and** inside every Pages deploy | **YES — implicitly** | A broken internal link once the path leaves `KNOWN_FUTURE_ROUTES`; an `undefined.map` in a reader; a route that fails to prerender |
| **E4** | Browser + axe | `npm run test` (Playwright) | **only when a human runs it — no CI** | Rendered output, WCAG AA, keyboard, focus, `javaScriptEnabled: false`, the authenticated panel via the signed-cookie fixture, `emulateMedia({ reducedMotion })` |
| **E5** | Unit | `npm run test:unit` (`node:test`) | **NO — AG-3, no gate at all** | Pure functions, validators, serialization, copy sweeps |

**The rule this phase must follow:** every property that matters and is only covered by **E5** needs a second check in **E1, E3 or E4**. This is the same rule `04.1-VALIDATION.md:27` imposed, and it applies harder here because `05-UI-SPEC` Contract 12 mistakenly treats two E5 assertions (`EKSPORTY`, `instrukcja.unit.ts`) as loud failures.

### Phase Requirements → Test Map

| Req | ID | Behavior | Evidence class | Automated command | File |
|-----|----|----------|----------------|-------------------|------|
| FEES-01 | FEE-1 | `/cennik` resolves, one `<h1>`, Polish SEO, `noindex` | E3 + E4 | `npx playwright test tests/cennik.spec.ts` | Wave 0 |
| FEES-01 | FEE-2 | The rendered breakdown satisfies `placi === stawka - obnizka` | E4 | same file | Wave 0 |
| FEES-01 | FEE-3 | A zero amount occurs **only** inside the ZUS block; the no-zero regex holds for the page with that block removed | E4 | same file | Wave 0 |
| FEES-01 | FEE-4 | `obnizka === 0` hides the whole breakdown block | **E5 only** (reader unit) — needs an E4 twin, see below | `node --test tests/cennik-reader.unit.ts` | Wave 0 |
| FEES-01 | FEE-5 | The formatter groups from four digits and uses U+0020 | E5 + **E4 twin already exists** (`tests/home.spec.ts:112` retypes `'1 500 zł'`) | `node --test tests/kwoty.unit.ts` | Wave 0 |
| FEES-01 | FEE-6 | `/rekrutacja`'s existing `.fee-box` no-zero gate still passes | E4 | `npx playwright test tests/rekrutacja.spec.ts` | exists |
| FEES-01 | FEE-7 | `/admin/cennik` refuses an empty `zus`, refuses `obnizka >= stawka`, refuses an unconditioned zero | E5 + E4 | `node --test tests/admin-walidacja-cennik.unit.ts`; `npx playwright test tests/admin-cennik.spec.ts` | Wave 0 |
| FEES-01 | FEE-8 | `/admin/cennik` output is byte-for-byte the pinned serialization | **E5 only** + E2 twin (prettier would reject a drift) | `node --test tests/admin-walidacja-cennik.unit.ts` | Wave 0 |
| FEES-01 | FEE-9 | An editor's fee change appears publicly | **live only** | not automatable | UAT |
| GALLERY-01 | GAL-1 | `#galeria` section always renders (heading + id), zero photos included | E4 | `npx playwright test tests/galeria.spec.ts` | Wave 0 |
| GALLERY-01 | GAL-2 | Every tile carries a non-empty Polish `alt` and a disambiguated link name | E4 | same file | Wave 0 |
| GALLERY-01 | GAL-3 | axe AA clean on `/o-nas` populated, `/o-nas` empty, **and lightbox open** | E4 | same file | Wave 0 |
| GALLERY-01 | GAL-4 | Lightbox: Escape closes, focus restores to the tile, Tab is bounded | E4 | same file | Wave 0 |
| GALLERY-01 | GAL-5 | With scripting off, the tile is an `<a href>` to a real image asset | E4 (`javaScriptEnabled: false`) | same file | Wave 0 |
| GALLERY-01 | GAL-6 | Under `prefers-reduced-motion: reduce` neither motion animates | E4 (`emulateMedia`) | same file | Wave 0 |
| GALLERY-02 | GAL-7 | Add, remove and **reorder** work on `/admin/galeria` with scripting disabled | E4 | `npx playwright test tests/admin-galeria.spec.ts` | Wave 0 |
| GALLERY-02 | GAL-8 | The twelve cap: the add button disappears **and** an over-cap save is refused server-side | E5 + E4 | `node --test tests/admin-walidacja-galeria.unit.ts`; the spec above | Wave 0 |
| GALLERY-02 | GAL-9 | A required alt and caption are enforced on the server | E5 + E4 | same pair | Wave 0 |
| GALLERY-02 | GAL-10 | Hand-placed `sala-zabaw.jpg` / `plac-zabaw.jpg` are never deleted | **E5 only** — the four-condition ownership rule | `node --test tests/admin-walidacja-galeria.unit.ts` | Wave 0 |
| GALLERY-02 | GAL-11 | An editor's photo add/remove appears publicly | **live only** | not automatable | UAT |
| all | ENUM-1 | Every `/admin/**` route is in `TRASY`, `SCIEZKI`, `SEKCJE` and the pulpit | E4 | `npx playwright test tests/admin-enumeracja.spec.ts` | **Wave 0, RECOMMENDED NEW** |
| all | ENUM-2 | Panel copy sweep covers every export of `panel.ts` | **E5 only** — treat as unenforced | `node --test tests/admin-copy.unit.ts` | exists |
| all | ENUM-3 | Polish-only across all seventeen panel URLs | E4 | `npx playwright test tests/admin-polski.spec.ts` | exists (extend `TRASY`) |
| all | REG-1 | `PowtarzalnaGrupa` without the new props renders today's markup | E4 | `npx playwright test tests/admin-strony.spec.ts tests/admin-nabor.spec.ts` | exists |
| all | REG-2 | No horizontal overflow on `/cennik`; nav hamburger at 768px, inline at 1024px | E4 | `npx playwright test tests/responsive.spec.ts` | exists (extend) |
| all | REG-3 | `obiekt_zdjecia` removal does not break the type graph or the prerender | E1 + E3 | `npm run check && npm run build` | — |
| all | REG-4 | New seed JSON survives prettier and the first panel save | E2 | `npm run lint` | — |
| all | AMD-1 | `01-UI-SPEC.md` physically carries Amendment v1.7 and no live `400 zł` | grep gate | `grep -c '## Amendment v1.7' …/01-UI-SPEC.md` = 1 | plan gate |
| all | AMD-2 | `DESIGN-BANK.md` §Cennik carries the strike marker, explainer included | grep gate | `grep -c 'STRUCK' .planning/DESIGN-BANK.md` ≥ 1 | plan gate |
| all | AMD-3 | `KNOWN_FUTURE_ROUTES` is empty and every former path resolves | E3 (prerender crawler) — **never a grep** | `npm run build` | — |

### Sampling Rate

- **Per task commit:** `npm run check` (E1, enforced by pre-commit) **plus** `npm run test:unit` typed by hand (E5, not enforced — this is an explicit plan step, not an assumption).
- **Per wave merge:** `npm run check && npm run lint && npm run test:unit && npm run test`.
- **Phase gate:** full suite green, all grep gates returning their expected counts, before `/gsd-verify-work`.
- **Max feedback latency:** seconds for E1/E5; a full build for E3/E4.

### Wave 0 Gaps

- [ ] `tests/kwoty.unit.ts` — FEE-5, including the byte-identity pin against `OPLATY.kwota`
- [ ] `tests/cennik.spec.ts` — FEE-1..FEE-3, FEE-6 lockstep, the arithmetic assertion and the scoped conditional-zero pair
- [ ] `tests/cennik-reader.unit.ts` — FEE-4, plus the negative-amount reader refusal
- [ ] `tests/admin-walidacja-cennik.unit.ts` — FEE-7, FEE-8; the serialization pin in the shape of `admin-walidacja-nabor.unit.ts:172-190`
- [ ] `tests/admin-cennik.spec.ts` — FEE-7 browser half, axe clean and with `aria-invalid` rendered
- [ ] `tests/galeria.spec.ts` — GAL-1..GAL-6. **The project's first open-overlay axe scan, first focus-trap assertion and first `emulateMedia({ reducedMotion })` usage**
- [ ] `tests/admin-galeria.spec.ts` — GAL-7..GAL-9, including the `javaScriptEnabled: false` context (pattern already used in five panel specs)
- [ ] `tests/admin-walidacja-galeria.unit.ts` — GAL-8..GAL-10
- [ ] `tests/admin-walidacja-w-skrocie.unit.ts` — fixed arity, hours atoms, liczba miejsc
- [ ] `tests/admin-w-skrocie.spec.ts` — read-only tiles render as text not `disabled` inputs; axe clean
- [ ] **`tests/admin-enumeracja.spec.ts` — RECOMMENDED NEW.** ENUM-1. One file that permanently retires the three silent enumeration failures
- [ ] Extend `tests/admin-polski.spec.ts` `TRASY` from **14** to **17** routes
- [ ] Extend `tests/responsive.spec.ts` `ROUTES` with `/cennik`; add explicit nav assertions at 768px and 1024px
- [ ] Lockstep edits: `tests/o-nas.spec.ts`, `tests/nav.spec.ts`, `tests/home.spec.ts`, `tests/admin-strony.spec.ts`, `tests/admin-walidacja-strony.unit.ts`, `tests/admin-pulpit.spec.ts`, `tests/admin-copy.unit.ts`, `tests/instrukcja.unit.ts`

*No framework install needed — both runners already exist.*

### Not Inferable From Unit Tests

These properties cannot be established by a unit test written against the same mental model that wrote the code. Each names the class of evidence that can actually establish it, in this repository's gate structure.

| # | Property | Why a unit test cannot establish it | Required check | Class |
|---|----------|-------------------------------------|----------------|-------|
| 1 | **The lightbox's bounded focus trap** | A trap is a property of the live accessibility tree and the browser's own tab order. No unit test has a tab order. There is **no precedent in this repository** — `nav.spec.ts:87-108` proves Escape and focus restore for `MobileNav` but never presses Tab | Playwright: open the dialog, `Shift+Tab` from the first focusable, assert `document.activeElement` is still inside the dialog; `Tab` from the last, same | E4 |
| 2 | **axe AA with the lightbox OPEN** | axe evaluates a rendered DOM in a state. All twelve existing `AxeBuilder` call sites scan a page in a load-time state; none scans an overlay. Contrast against a translucent scrim, `aria-modal` semantics and the hidden background are only computable live | Playwright + `AxeBuilder` after the click that opens the dialog. **First of its kind in the project** | E4 |
| 3 | **The no-JavaScript tile affordance** | The whole claim is "what a browser does when the island never runs". A unit test cannot not-run an island | `browser.newContext({ javaScriptEnabled: false })` — an established pattern here (`admin-strony:105`, `admin-zdjecia:318`, `admin-nabor:240`, `admin-dokumenty:372`, `admin-aktualnosci:576`) — assert the tile's `href` resolves to an image asset | E4 |
| 4 | **`prefers-reduced-motion` is honoured** | It is a media-query-conditioned rendering behaviour. Nothing in this repository uses `emulateMedia` or `reducedMotion` today | `page.emulateMedia({ reducedMotion: 'reduce' })`, then assert the transition duration resolves to 0 / no transform is applied. **New capability for this project** | E4 |
| 5 | **Reordering works with scripting disabled** | Named form actions are a server round trip; the property is that the *browser* posts them without help | `javaScriptEnabled: false` context **plus** the authenticated cookie fixture (`tests/fixtures/admin.ts`), click „Przenieś wyżej", assert the re-rendered order | E4 |
| 6 | **Focus lands on the move button at its new position, and repeated clicks keep working** | The bug is a selector mismatch (`WYBIERALNE` excludes buttons) that a unit test of the action's return value cannot see — the action's payload is correct; the effect's target is not | Playwright: click „Przenieś wyżej" twice, assert both moves happened and the button is focused after each | E4 |
| 7 | **The amount formatter's byte identity with the shipped string** | A unit test *can* assert it — but it lives in the unrun tier. The genuine risk (NBSP vs ASCII space) is invisible in a diff and in a test failure message | E5 unit test **plus** the E4 twin that already exists for free: `tests/home.spec.ts:112` retypes `'1 500 zł'` and runs inside `npm run test` | E5 + E4 |
| 8 | **The page cannot contradict its own arithmetic** | A unit test of `stawka - obnizka` proves the function, not that the page renders all three from one source. The bug this guards is a template that re-reads a stale value | Playwright: read the three **rendered** numbers, do the subtraction in the test. Blind to the stored values, so an ordinary editor save cannot turn it red | E4 |
| 9 | **The conditional-zero rule on `/cennik`** | The rule is about *co-location in the rendered DOM*, and `tests/rekrutacja.spec.ts:183` is not reusable — it forbids **any** zero inside `.fee-box` while `/cennik` deliberately renders one. Note also the recorded unsatisfiable-gate trap: a literal `0 zł` grep matches `1 500 zł` (04-06) | The scoped pair: every zero falls inside the ZUS block, **and** the page text with that block removed still satisfies the boundary-anchored regex | E4 |
| 10 | **Removing `obiekt_zdjecia` does not break anything** | Not a behaviour; a shape property of the whole type graph and of the prerender | `npm run check` (type error) **and** `npm run build` (`undefined.map` at prerender). Both are enforced | E1 + E3 |
| 11 | **A new panel screen is covered by the Polish sweep** | `TRASY` is hand-maintained and nothing asserts it is complete. A unit test of the sweep function proves the sweep, not the list | The recommended `tests/admin-enumeracja.spec.ts`: enumerate `src/routes/admin/**/+page.svelte` and assert membership in `TRASY`, `SCIEZKI`, `SEKCJE` and the pulpit | E4 |
| 12 | **`SCIEZKI` stays index-aligned with `NAWIGACJA`** | A misalignment yields an `undefined` href, which is a rendered attribute, not a function return. `PanelNawigacja.svelte:19-22` computes `NAWIGACJA.map((e, i) => ({ href: SCIEZKI[i] }))` with no length check | Same file: assert equal lengths and that every path returns 200 under the authenticated fixture | E4 |
| 13 | **`KNOWN_FUTURE_ROUTES` is genuinely empty and every path resolves** | A grep is unusable (C-4: quoted forms appear inside comments) | The prerender crawler itself: once a path leaves the array, a broken link fails `vite build`, which runs inside Playwright's `webServer` and inside every Pages deploy | E3 |
| 14 | **`01-UI-SPEC.md` actually carries the amendment** | No test reads planning documents. And producing `05-UI-SPEC.md` does **not** amend `01-UI-SPEC.md` (C-3: v1.4 and v1.5 left no trace there, which is how the stale figures survived) | Grep gates in the plan's acceptance criteria, run **against `01-UI-SPEC.md` and `DESIGN-BANK.md` themselves** | grep gate |
| 15 | **New seed JSON survives the first panel save** | The failure is a formatting round trip between `serializujJson` and prettier, discovered at a later unrelated commit | `npm run lint` on the hand-authored seed, and again on the panel's own output. Enforced by pre-commit | E2 |
| 16 | **An editor's save reaches the public site** (ROADMAP success criterion 3; the closing half of GALLERY-02 and FEES-01) | Requires a real commit, a real Pages build and a real ~2-minute wait. Nothing in the harness can produce one | **Live UAT.** Three saves and one rebuild wait (see §Slice Boundaries) | live |
| 17 | **HEIC decode from a real phone photo** (04.1 UAT row B2) | Real-device decoder behaviour. HEIC is deliberately not in `TYPY_ZDJECIA`; it works only because the browser decodes before upload (04.1 D-12) | **DEFERRED by D-37** to the Phase 6 launch gate, where the real consented photo set lands. Nothing in this phase's acceptance evidence may depend on it | deferred |
| 18 | **The stale-save conflict panel** (04.1 UAT row B4) | The interesting case is the race between the SHA check and `update-ref`, which no test reliably reproduces, and it needs two concurrent human sessions | **DEFERRED by D-37** to Phase 6. Reuse the existing head-SHA refusal unchanged; build no gallery behaviour that depends on this leg behaving a particular way | deferred |

### Properties proven vs deferred (the D-37 statement)

**Proven inside this phase, by an enforced gate:** everything in the requirement map above except rows FEE-9 and GAL-11.

**Proven inside this phase, but only when a human runs `npm run test`:** all E4 rows. There is no CI. This is AG-3 and it is not this phase's to fix, but this phase **enlarges** it and says so.

**Proven only in the unrun tier (E5) with no second check, and therefore honestly unproven:** GAL-10 (hand-placed file protection) and FEE-8 (byte-for-byte serialization) are the two the planner should look hardest at. Both are cheap to promote: GAL-10 can be asserted in `tests/admin-galeria.spec.ts` by removing a seed photo through the panel and asserting the file is still present in the build's glob; FEE-8's twin already exists in `npm run lint` (E2), since a serialization drift would fail prettier.

**Deferred to the Phase 6 launch gate, tracked, not descoped:** rows 17 (HEIC / 04.1 UAT B2) and 18 (stale-save / 04.1 UAT B4). Both must appear in `05-VERIFICATION.md` in the style the project already uses for FORM-01 and FORM-02, and must be recorded at the Phase 6 gate rather than allowed to dissolve.

**Not this phase's to close and explicitly not claimed:** CMS-01, CMS-02, CMS-03 (D-36). The phase proceeds against a formally open dependency by user decision (D-37) and says so.

---

## Security Domain

`workflow.security_enforcement` is `true`, `security_asvs_level: 1`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard control in this codebase |
|---------------|---------|-----------------------------------|
| V2 Authentication | **inherited, unchanged** | E-mail one-time code, `ADMIN_EMAILS` re-checked on **every** request in `src/hooks.server.ts`. This phase adds no auth surface; a new route under `/admin` is gated by layout inheritance |
| V3 Session Management | **inherited, unchanged** | Signed cookie (`src/lib/server/admin/sesja.ts`). No change |
| V4 Access Control | **yes** | Three new `/admin` routes and their actions. The gate covers pages **and** POSTs by inheritance, but a plan must not introduce a `+server.ts` under `/admin` that bypasses the layout |
| V5 Input Validation | **yes** | Every new field goes through `src/lib/server/admin/walidacja/`. Closed allowlists; an absent field is a refusal, never a default (`walidacja/nabor.ts:36-42`). `liczbaWZakresie` (`pola.ts:101-115`) checks the digit shape **before** the parse, because `parseInt('12abc')` returns 12 |
| V6 Cryptography | no | Nothing new. Never hand-roll |
| V12 File Upload | **yes** | Gallery photos. `TYPY_ZDJECIA` is an allowlist (jpeg, png, webp — **not** avif, **not** HEIC); size cap 15 MB; the filename is **generated**, never editor-supplied; base64 is passed through without server-side decoding (`obraz.ts` header) |
| V14 Configuration | **yes** | No new secret. Do not create a root `.dev.vars`. `wrangler.jsonc` remains the source of truth for bindings |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard mitigation, already present |
|---------|--------|--------------------------------------|
| Path traversal via an editor-controlled filename | Tampering | Names are generated by `nazwaZdjeciaONas` / its `galeria-` twin from the alt text, against a reserved set. Staff never type a filename (D-14/P-25) |
| Deleting a file another page references | Tampering / DoS | The four-condition `zdjecieONasDoUsuniecia` (`uploads.ts:222-237`). Reproduce it for `galeria-`, do not reference it |
| Index injection into a repeated group (**T-04.1-34**) | Tampering | `zbierzIndeksowane` builds a **dense** array and `indeksZadania` bounds the index against the set that arrived. **The two new move actions must reuse both** — an unbounded move index is the same threat in a new action |
| Stale-save overwrite | Tampering | Head-SHA refusal + 409 panel. Do not invent a second mechanism |
| Stored XSS through editor prose | Tampering | `renderInline` from `$lib/markdown` (raw HTML escaped, unsafe protocols dropped) plus CSP `script-src 'self'` as the second layer. The gallery caption and alt are **plain text**, not markdown — render them as text, not `{@html}` |
| Publishing an unconditioned `0 zł` | Information disclosure / regulatory | `dane-bip` §10 item 1. Enforced at save time (`/admin/cennik` rule 3) **and** at render time (the scoped pair gate) |
| Publishing a child's image without consent | Information disclosure / RODO | `02-UI-SPEC.md:115` D-04 governs over `DESIGN-BANK.md:37`. Zero identifiable people; alt text never names or identifies a child |
| CSP widening for the island | Elevation | **None needed.** Same-origin island; inline scripts already carry the per-response nonce from `kit.csp`. Do not widen it |
| Logging content or editor identity | Information disclosure | Nothing in the panel logs. Keep it that way (`o-nas/+page.server.ts:33-34`) |

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | `emulateMedia({ reducedMotion: 'reduce' })` is available and behaves as documented in `@playwright/test` ^1.62.1 | Validation / Not Inferable #4 | Low. The API is long-standing; if it misbehaves, the fallback is asserting the CSS `@media` block's presence via `getComputedStyle`, which is weaker but real. No usage exists in this repo to copy |
| A2 | axe-core 4.13 reports no false positive on an `aria-modal="true"` overlay whose background siblings are neither `inert` nor `aria-hidden` | Validation / Not Inferable #2 | Medium. If it does flag one, the remedy is `inert` on the page wrapper while the dialog is open — a real improvement, but it is a change `05-UI-SPEC` Contract 2 does not specify and would need recording. Discoverable in minutes on first run |
| A3 | `pic.img.src` in the prerendered HTML is a stable, directly-fetchable asset URL (not a data URI, not a build-only placeholder) | Pattern 2 | Low. Verified from the plugin source that it is emitted as the `<img src>`, and the current `/o-nas` already renders those images |
| A4 | Three new panel screens push `TRASY` from 14 to 17 and the copy-sweep export count up by a similar amount without any other list needing a length change | Enumeration | Low. Mechanical; the failure is loud in `EKSPORTY` (though in the unrun tier) |
| A5 | The staff manual rewrite is a copy task, not a restructure — `tests/instrukcja.unit.ts`'s required-headings assertion accepts new sections without a schema change | Slice 4 | Low-medium. If the gate pins an exact heading **set** rather than a required subset, adding three sections turns it red and the plan needs a lockstep edit. Cheap to check before planning |

Everything else in this document is `[VERIFIED]` by execution or by reading the working tree, or `[CITED]` to a file and line.

---

## Open Questions

1. **Does `tests/instrukcja.unit.ts` pin an exact heading set or a required subset?**
   - What we know: it asserts required manual headings and verbatim copy quotes at `:115-138, 158-238`, including `POLA_O_NAS.zdjeciaLegenda` at `:228` — which becomes false when the photos leave the O nas screen.
   - What's unclear: whether adding three new sections is additive or a red gate.
   - Recommendation: the executor greps the assertion shape before writing the manual. Either way the `zdjeciaLegenda` quote is a lockstep edit, so the file is being touched regardless.

2. **Where does the `w-skrocie` per-tile placeholder boolean meet the Phase 6 sweep?**
   - What we know: `05-UI-SPEC` Contract 11 makes it a named deliverable — the sweep must be extended to the boolean **in this phase**, because a JSON boolean is not the greppable `PLACEHOLDER` token the Phase 6 sweep hunts.
   - What's unclear: whether the Phase 6 sweep is a documented procedure or an ad-hoc grep. If ad-hoc, "extend the sweep" has no artefact to extend.
   - Recommendation: have slice 4 write the extension as an executable check (a unit test or a grep gate asserting no `"placeholder": true` remains in `src/lib/content/`), so it is a thing that exists rather than an instruction to a future phase.

3. **Does `/admin/o-nas` keep or lose its `zdjecia` echo shape once the photos leave?**
   - What we know: `obiekt_opis` stays on `/admin/o-nas` as the gallery's introductory prose (D-20); `wartosciONas` in `pola-strony.ts:213-252` currently carries a `zdjecia: ZdjecieEcha[]` member, and `tests/admin-walidacja-strony.unit.ts` asserts the validator's output key set **and key order**.
   - What's unclear: whether the gallery's echo shape should be a new type or `ZdjecieEcha` reused with a `podpis` field added — the latter would change the o-nas shape too.
   - Recommendation: a **separate** `ZdjecieGaleriiEcha` with `podpis`, leaving `ZdjecieEcha` untouched, then delete the `zdjecia` member from `WartosciONas` in the same commit as the JSON key. Two independent shapes are cheaper than one shared shape that has to satisfy two screens' validators and two key-order oracles.

4. **Is the `admin-enumeracja.spec.ts` gate in scope?**
   - It is a recommendation, not a contract requirement. It is the single highest-leverage new gate available to this phase (it retires Pitfall 5 and Not-Inferable rows 11 and 12 permanently, in one file, inside the enforced `npm run test`).
   - Recommendation: land it in slice 1 so slices 3 and 4 inherit it. If the planner descopes it, that must be an explicit checkpoint, because the alternative is that this phase adds three panel screens guarded only by a hand-maintained list that nothing checks.

---

## Sources

### Primary (HIGH confidence) — executed or read in this working tree, 2026-08-17

- `node -e` on the installed Node v25.9.0: `Intl.NumberFormat('pl-PL')` behaviour at 1500 / 2337 / 9999 / 10000, and the `useGrouping: 'always'` codepoint dump
- `fs.readFileSync` codepoint dump of `src/lib/content/rekrutacja.ts` `OPLATY.kwota`
- `src/lib/components/MobileNav.svelte` (239 lines, read in full) — the island precedent
- `src/lib/components/admin/PowtarzalnaGrupa.svelte` (311 lines, read in full) — props, `wlasnaRamka` branching, the focus effect, `WYBIERALNE`
- `src/lib/pola-strony.ts` (274 lines, read in full) — wire vocabulary, `zbierzIndeksowane`, `indeksZadania`, `ZadanieFokusu`
- `src/routes/admin/o-nas/+page.server.ts` (290 lines, read in full) — the five-action template, the file-list/one-commit shape, `zdjecieONasDoUsuniecia` usage
- `src/routes/o-nas/+page.svelte` (`:1-50`, `:110-145`, `:205-225`, `:355-385`) — the zero-JS header comment, the glob, the `obiekt_zdjecia` read, the grid CSS
- `src/lib/components/KeyFacts.svelte:1-40`, `src/lib/content/site.ts` `keyFacts`, `src/lib/liczebniki.ts:1-30`
- `src/lib/server/admin/walidacja/pola.ts:95-120` (`liczbaWZakresie`), `src/lib/server/admin/uploads.ts` (exports + `istniejaceNazwy`), `src/lib/content/panel.ts:1-60`, `src/lib/components/admin/PanelNawigacja.svelte:15-45`, `src/routes/admin/+layout.server.ts:1-30`, `src/lib/nav.ts`, `svelte.config.js:1-40`, `src/lib/content/o-nas.json`
- `tests/`: `o-nas.spec.ts`, `nav.spec.ts`, `responsive.spec.ts`, `home.spec.ts:95-130`, `admin-a11y.spec.ts`, `admin-copy.unit.ts:95-225`, `admin-polski.spec.ts:70-95`, `fixtures/admin.ts`; plus `grep -rn AxeBuilder tests/` and `grep -rn "javaScriptEnabled|reducedMotion|emulateMedia" tests/`
- `package.json`, `playwright.config.ts`, `.planning/config.json`
- `node_modules/@sveltejs/enhanced-img/src/vite-plugin.js:333-394` and `types/index.d.ts` — the `Picture` shape
- `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md` — amendment headings at `:344, :419, :475, :496`; the stale figures at `:457, :471`; KeyFacts v3 at `:521`
- `.planning/phases/04.1-.../04.1-UAT.md` (rows A1-A3, B1-B8, C1-C4, F1-F5, summary block) and `04.1-VALIDATION.md`
- `.planning/DESIGN-BANK.md:25-40`, `.planning/REQUIREMENTS.md:50-70, 138-148`, `.planning/STATE.md:1-60`
- `.planning/phases/05-gallery-fees/05-CONTEXT.md` and `05-UI-SPEC.md` (both read in full)

### Secondary (MEDIUM confidence)

- None. No web search or external documentation was needed; every question this phase raised was answerable from the working tree.

### Tertiary (LOW confidence)

- None.

---

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| Standard stack | **HIGH** | Zero new packages; every version read from the installed `package.json` |
| Amount formatter | **HIGH** | Executed on the target runtime; both the default and the `useGrouping` variant measured at codepoint level against the shipped bytes |
| `PowtarzalnaGrupa` regression surface | **HIGH** | Enumerated by grep; the `wlasnaRamka` and `WYBIERALNE` traps read directly from the component |
| Lightbox implementation shape | **HIGH** | Transposed line-for-line from a working island in the same repository |
| Lightbox **evidence** shape | **MEDIUM-HIGH** | No precedent exists for open-state axe or `emulateMedia`; the approach is standard but unexercised here (A1, A2) |
| Amendment mechanics | **HIGH** | Both idioms enumerated across all six amendments; the v1.4/v1.5 traceability gap confirmed by grep |
| Validation architecture | **HIGH** | Gate structure read from `package.json`, `playwright.config.ts` and pre-commit; the AG-3 consequence for `EKSPORTY` and `instrukcja.unit.ts` verified rather than assumed |
| Pitfalls | **HIGH** | Each one located at a file and line, or executed |
| Slice boundaries | **MEDIUM** | Judgement, grounded in the verified dependency order (`kwoty.ts` before KeyFacts; shared component before the gallery) and the build ceiling |

**Research date:** 2026-08-17
**Valid until:** 2026-09-16 (30 days). Shorter if Phase 04.1's UAT closes rows B2 or B4, which would retire two of this phase's carried risks and change the D-37 statement.
