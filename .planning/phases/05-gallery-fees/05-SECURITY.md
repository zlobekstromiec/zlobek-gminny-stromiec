---
phase: 5
slug: gallery-fees
status: draft
# threats_open = count of OPEN threats at or above workflow.security_block_on (high)
threats_open: 3
asvs_level: 1
created: 2026-08-18
---

# Phase 5 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Register source: the `<threat_model>` block of all nine `05-0N-PLAN.md` files (64 rows).
> Method: one auditor per plan verified every row against the implementation, then an
> independent adversarial reviewer was asked to REFUTE every claimed closure. Six closures
> were overturned that way, and two of them are real code defects rather than paperwork gaps.

**Verdict: BLOCKED. 3 high-severity threats are open.** Phase 5 does not advance until they
are closed or accepted in writing.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| editor browser -> panel save action | Fee amounts, fee prose, captions, alt text, hours atoms, the places count and every submitted row index are untrusted input even though the editor is authenticated | Public fee figures, editor prose, image bytes |
| editor-saved JSON -> build-time reader | `cennik.json`, `galeria.json` and `w-skrocie.json` are panel-writable; from plan 05-04 on they are untrusted input to every reader | Structured content store |
| build-time reader -> prerendered public HTML | Whatever survives the reader is published to parents and cannot be recalled without a two-minute rebuild | Public page text and images |
| editor-supplied caption -> generated filename | The caption decides a path inside the repository | Repository path |
| filename prefix -> the right to delete | The prefix is the ownership marker protecting hand-placed files other pages render | File ownership |
| panel -> GitHub Git Data API | One atomic commit per save, as the org-owned GitHub App | Repository write |
| prerendered HTML -> browser-executed island | The lightbox is the first client-side state on a content route | Already-public DOM content |
| planning document -> executor agent | A locked contract read as an instruction by a later agent; a stale figure is untrusted input | Design and fee contracts |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation reference | Status |
|-----------|----------|-----------|----------|-------------|----------------------|--------|
| T-05-01-01 | Tampering (integrity of the contract set) | `01-UI-SPEC.md:457`, `:471` | high | mitigate | `.planning/phases/01-live-homepage-design-foundation/01-UI-SPEC.md`, `.pre-commit-config.yaml` | closed |
| T-05-01-02 | Information disclosure (regulatory) | `DESIGN-BANK.md:32` dofinansowanie explainer | high | mitigate | `.planning/DESIGN-BANK.md`, `src/lib/content/cennik.ts` | closed |
| T-05-01-03 | Information disclosure (RODO / wizerunek) | consent rule conflict between `02-UI-SPEC.md:115` and `DESIGN-BANK.md:37` | high | mitigate | `.planning/phases/02-about-documents-cms/02-UI-SPEC.md`, `.planning/DESIGN-BANK.md`, `src/lib/content/galeria.json` | closed |
| T-05-01-04 | Repudiation | `05-UI-SPEC.md` approval state | low | mitigate | `.planning/phases/05-gallery-fees/05-UI-SPEC.md` | closed |
| T-05-05-SC | Tampering (supply chain) | npm installs | high | mitigate | `package.json`, `package-lock.json` | closed |
| T-05-02-01 | Information disclosure (regulatory, `dane-bip` §10 item 1) | /cennik rendered text | high | mitigate | `src/lib/content/cennik.ts`, `src/routes/cennik/+page.svelte`, `tests/cennik.spec.ts` +3 | **open** |
| T-05-02-02 | Tampering (arithmetic integrity) | cennikZWpisu breakdown | high | mitigate | `src/lib/cennik.ts`, `src/lib/content/cennik.json`, `src/lib/kwoty.ts` +2 | closed |
| T-05-02-03 | Denial of service (availability of the prerendered site) | module-scope throw in `src/lib/cennik.ts` | medium | accept | `src/lib/cennik.ts`, `src/routes/+layout.ts`, `src/routes/cennik/+page.svelte` +3 | closed |
| T-05-02-04 | Tampering (stored XSS through editor prose) | the five fee strings | medium | mitigate | `src/routes/cennik/+page.svelte`, `src/lib/content/cennik.ts`, `src/lib/cennik.ts` +5 | closed |
| T-05-02-05 | Spoofing (silent formatting drift) | `src/lib/kwoty.ts` separator | medium | mitigate | `tests/home.spec.ts`, `tests/kwoty.unit.ts`, `src/lib/kwoty.ts` +3 | open — below high threshold (non-blocking) |
| T-05-02-SC | Tampering (supply chain) | npm installs | high | mitigate | `package.json`, `package-lock.json`, `src/lib/kwoty.ts` +3 | closed |
| T-05-03-01 | Denial of service (a visitor cannot reach the information) | footer fragment shortcuts | medium | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/tests/nav.spec.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/components/Footer.svelte`, `/Users/devopsdom/src/client-zlobekstromiec/src/routes/kontakt/+page.svelte` +1 | closed |
| T-05-03-02 | Tampering (silent regression in the prerender gate) | KNOWN_FUTURE_ROUTES | medium | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/svelte.config.js`, `/Users/devopsdom/src/client-zlobekstromiec/playwright.config.ts`, `/Users/devopsdom/src/client-zlobekstromiec/package.json` +1 | closed |
| T-05-03-03 | Denial of service (keyboard and small-screen access) | Header breakpoint move 768px to 1024px | medium | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/tests/responsive.spec.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/components/Header.svelte`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/nav.ts` +2 | open — below high threshold (non-blocking) |
| T-05-03-04 | Information disclosure | none introduced | low | accept | `/Users/devopsdom/src/client-zlobekstromiec/.planning/phases/05-gallery-fees/05-03-PLAN.md`, `/Users/devopsdom/src/client-zlobekstromiec/.planning/phases/05-gallery-fees/05-03-SUMMARY.md`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/nav.ts` +1 | closed |
| T-05-03-SC | Tampering (supply chain) | npm installs | high | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/package.json`, `/Users/devopsdom/src/client-zlobekstromiec/package-lock.json` | closed |
| T-05-04-01 | Tampering (index injection into a repeated group; T-04.1-34 in a new action) | the two move actions | high | mitigate | `src/lib/pola-strony.ts`, `src/routes/admin/plan-dnia/+page.server.ts`, `src/routes/admin/galeria/+page.server.ts` +1 | closed |
| T-05-04-02 | Tampering (stale-save baseline drift) | head SHA on a move round trip | high | mitigate | `src/routes/admin/plan-dnia/+page.server.ts`, `src/routes/admin/galeria/+page.server.ts`, `src/routes/admin/plan-dnia/+page.svelte` +1 | closed |
| T-05-04-03 | Denial of service (keyboard operability regression) | focus effect branch | medium | mitigate | `src/lib/components/admin/PowtarzalnaGrupa.svelte`, `tests/admin-strony.spec.ts`, `tests/admin-galeria.spec.ts` | closed |
| T-05-04-04 | Tampering (silent regression on unrelated screens) | PowtarzalnaGrupa shared markup | high | mitigate | `src/lib/components/admin/PowtarzalnaGrupa.svelte`, `src/lib/components/admin/Przycisk.svelte`, `src/routes/admin/o-nas/+page.svelte` +1 | closed |
| T-05-04-05 | Elevation of privilege | new panel actions | low | accept | `src/hooks.server.ts`, `src/routes/admin/plan-dnia/+page.server.ts`, `src/routes/admin/galeria/+page.server.ts` +2 | closed |
| T-05-04-SC | Tampering (supply chain) | npm installs | high | mitigate | `package.json`, `package-lock.json`, `src/lib/components/admin/PowtarzalnaGrupa.svelte` | closed |
| T-05-05-01 | Information disclosure (regulatory, `dane-bip` §10 item 1) | `walidujCennik` conditional-zero rule | high | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/src/lib/server/admin/walidacja/cennik.ts`, `/Users/devopsdom/src/client-zlobekstromiec/tests/admin-walidacja-cennik.unit.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/cennik.ts` +1 | **open** |
| T-05-05-02 | Tampering (arithmetic integrity) | cross-field invariant | high | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/src/lib/server/admin/walidacja/cennik.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/cennik.ts`, `/Users/devopsdom/src/client-zlobekstromiec/tests/admin-walidacja-cennik.unit.ts` | closed |
| T-05-05-03 | Tampering (input validation) | the two amount controls | high | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/src/lib/server/admin/walidacja/pola.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/server/admin/walidacja/cennik.ts` | closed |
| T-05-05-04 | Tampering (stored XSS through editor prose) | the five fee strings | medium | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/src/routes/admin/cennik/+page.svelte`, `/Users/devopsdom/src/client-zlobekstromiec/src/routes/cennik/+page.svelte`, `/Users/devopsdom/src/client-zlobekstromiec/svelte.config.js` | closed |
| T-05-05-05 | Tampering (stale-save overwrite) | `zapiszTresc` head-SHA refusal | high | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/src/routes/admin/cennik/+page.server.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/routes/admin/cennik/+page.svelte`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/server/admin/zapis.ts` +2 | closed |
| T-05-05-06 | Elevation of privilege (auth bypass) | the new `/admin/cennik` route | high | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/src/hooks.server.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/routes/admin/+layout.server.ts`, `/Users/devopsdom/src/client-zlobekstromiec/tests/admin-cennik.spec.ts` +1 | closed |
| T-05-05-07 | Repudiation / information disclosure | logging | medium | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/src/routes/admin/cennik/+page.server.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/server/admin/walidacja/cennik.ts`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/server/admin/zapis.ts` | closed |
| T-05-05-08 | Denial of service (build ceiling) | one save equals one Pages build | medium | accept | `/Users/devopsdom/src/client-zlobekstromiec/src/routes/admin/cennik/+page.svelte`, `/Users/devopsdom/src/client-zlobekstromiec/src/lib/components/admin/RzedZapisu.svelte`, `/Users/devopsdom/src/client-zlobekstromiec/src/routes/admin/cennik/+page.server.ts` +1 | closed |
| T-05-05-SC | Tampering (supply chain) | npm installs | high | mitigate | `/Users/devopsdom/src/client-zlobekstromiec/package.json`, `/Users/devopsdom/src/client-zlobekstromiec/package-lock.json` | closed |
| T-05-06-01 | Tampering (path traversal via an editor-controlled filename) | nazwaZdjeciaGalerii | high | mitigate | `src/lib/server/admin/uploads.ts`, `src/lib/server/admin/slug.ts`, `src/lib/server/admin/walidacja/galeria.ts` +2 | closed |
| T-05-06-02 | Tampering / denial of service (deleting a file another page renders) | zdjecieGaleriiDoUsuniecia | high | mitigate | `src/lib/server/admin/uploads.ts`, `src/routes/admin/galeria/+page.server.ts`, `src/lib/content/galeria.json` +4 | closed |
| T-05-06-03 | Tampering (index injection into a repeated group; T-04.1-34) | add, remove and the two move actions | high | mitigate | `src/lib/pola-strony.ts`, `src/routes/admin/galeria/+page.server.ts`, `src/lib/server/admin/walidacja/galeria.ts` | closed |
| T-05-06-04 | Tampering (stale-save overwrite) | zapiszTresc head-SHA refusal | high | mitigate | `src/lib/server/admin/commit.ts`, `src/lib/server/admin/zapis.ts`, `src/routes/admin/galeria/+page.server.ts` +1 | closed |
| T-05-06-05 | Tampering (stored XSS through editor prose) | caption and alt on the public page | medium | mitigate | `src/routes/admin/galeria/+page.svelte`, `src/routes/o-nas/+page.svelte`, `src/lib/galeria.ts` +1 | closed |
| T-05-06-06 | Denial of service (upload abuse) | file type and size | medium | mitigate | `src/lib/server/admin/obraz.ts`, `src/lib/zdjecia.ts`, `src/lib/components/admin/ZdjecieIsland.svelte` +3 | closed |
| T-05-06-07 | Elevation of privilege (auth bypass) | the new /admin/galeria route | high | mitigate | `src/hooks.server.ts`, `src/routes/admin/galeria/+page.server.ts`, `tests/admin-galeria.spec.ts` | closed |
| T-05-06-08 | Information disclosure (RODO / wizerunek) | seeded and uploaded photos | high | mitigate | `src/lib/content/galeria.json`, `src/routes/admin/galeria/+page.svelte`, `src/lib/server/admin/walidacja/galeria.ts` +2 | closed |
| T-05-06-09 | Denial of service (build ceiling) | one save equals one build | medium | accept | `src/routes/admin/galeria/+page.server.ts`, `src/routes/admin/galeria/+page.svelte`, `src/lib/components/admin/RzedZapisu.svelte` +1 | closed |
| T-05-06-SC | Tampering (supply chain) | npm installs | high | mitigate | `package.json`, `package-lock.json` | closed |
| T-05-07-01 | Tampering (stored XSS through editor prose) | caption and alt on `/o-nas` | medium | mitigate | `src/routes/o-nas/+page.svelte`, `src/lib/components/Lightbox.svelte`, `src/lib/markdown.ts` +1 | closed |
| T-05-07-02 | Denial of service (whole-site prerender aborted by one bad entry) | the gallery reader on `/o-nas` | high | mitigate | `src/lib/galeria.ts`, `src/routes/o-nas/+page.svelte`, `src/lib/zdjecia-nazwy.ts` | **open** |
| T-05-07-03 | Denial of service (duplicate-key exception in production) | the gallery each block | high | mitigate | `src/routes/o-nas/+page.svelte`, `src/routes/admin/galeria/+page.svelte` | closed |
| T-05-07-04 | Tampering (destructive migration) | `obiekt_zdjecia` removal | high | mitigate | `src/lib/content/o-nas.json`, `src/routes/o-nas/+page.svelte`, `src/routes/admin/o-nas/+page.server.ts` +7 | closed |
| T-05-07-05 | Information disclosure (RODO / wizerunek) | the shipped photo set | high | mitigate | `src/lib/content/galeria.json`, `src/lib/assets/uploads/sala-zabaw.jpg`, `src/lib/assets/uploads/plac-zabaw.jpg` +1 | closed |
| T-05-07-06 | Denial of service (a visitor cannot reach the gallery) | the footer fragment | medium | mitigate | `src/routes/o-nas/+page.svelte`, `src/lib/components/Footer.svelte`, `tests/nav.spec.ts` | closed |
| T-05-07-07 | Denial of service (build fails on a link nobody noticed) | empty `KNOWN_FUTURE_ROUTES` | medium | accept | `svelte.config.js`, `.planning/phases/05-gallery-fees/05-07-PLAN.md`, `.planning/phases/05-gallery-fees/05-07-SUMMARY.md` | closed |
| T-05-07-SC | Tampering (supply chain) | npm installs | high | mitigate | `package.json`, `package-lock.json` | closed |
| T-05-08-01 | Elevation of privilege (CSP widening) | the island's inline script | high | mitigate | `svelte.config.js`, `src/lib/components/Lightbox.svelte`, `src/routes/o-nas/+page.svelte` +1 | closed |
| T-05-08-02 | Denial of service (keyboard user trapped or lost) | focus trap and restore | high | mitigate | `src/lib/components/Lightbox.svelte`, `tests/galeria.spec.ts`, `.pre-commit-config.yaml` | closed |
| T-05-08-03 | Denial of service (visitor cannot enlarge or cannot leave) | reliance on scripting | medium | mitigate | `src/lib/components/Lightbox.svelte`, `src/routes/o-nas/+page.svelte`, `tests/galeria.spec.ts` +1 | closed |
| T-05-08-04 | Tampering (accessibility regression invisible to the suite) | open-state rendering | high | mitigate | `tests/galeria.spec.ts`, `tests/o-nas.spec.ts`, `.pre-commit-config.yaml` +1 | closed |
| T-05-08-05 | Information disclosure | none introduced | low | accept | `src/lib/components/Lightbox.svelte`, `src/routes/o-nas/+page.svelte`, `.planning/phases/05-gallery-fees/05-08-PLAN.md` +2 | closed |
| T-05-08-SC | Tampering (supply chain) | npm installs | high | mitigate | `package.json`, `package-lock.json`, `src/lib/components/Lightbox.svelte` | closed |
| T-05-09-01 | Denial of service (an editor typo takes the prerendered site down at BUILD time) | the fact reader and `KeyFacts.svelte` | high | mitigate | `src/lib/w-skrocie.ts`, `src/lib/content/w-skrocie.json`, `src/lib/components/KeyFacts.svelte` +1 | closed |
| T-05-09-02 | Denial of service (duplicate-key exception in production) | the fact each block | high | mitigate | `src/lib/components/KeyFacts.svelte`, `src/lib/components/DayPlan.svelte`, `src/routes/o-nas/+page.svelte` | closed |
| T-05-09-03 | Information disclosure (regulatory) | the fee tile's suffix | high | mitigate | `src/lib/w-skrocie.ts`, `src/lib/server/admin/walidacja/w-skrocie.ts`, `src/routes/admin/w-skrocie/+page.svelte` +1 | closed |
| T-05-09-04 | Tampering (input validation) | the places count and the hours atoms | high | mitigate | `src/lib/server/admin/walidacja/w-skrocie.ts`, `src/lib/server/admin/walidacja/pola.ts`, `src/lib/server/forms/sanitize.ts` | closed |
| T-05-09-05 | Tampering (silent loss of a launch-gate marker) | the two placeholder line comments | medium | mitigate | `src/lib/content/w-skrocie.json`, `src/lib/content/site.ts`, `tests/zastepcze.unit.ts` +1 | open — below high threshold (non-blocking) |
| T-05-09-06 | Tampering (stored XSS through editor prose) | the hours and places strings | medium | mitigate | `src/lib/components/KeyFacts.svelte`, `src/lib/components/Footer.svelte`, `src/lib/components/TopBar.svelte` +4 | closed |
| T-05-09-07 | Elevation of privilege (auth bypass) | the new `/admin/w-skrocie` route | high | mitigate | `src/hooks.server.ts`, `src/routes/admin/+layout.server.ts`, `src/routes/admin/w-skrocie/+page.server.ts` +1 | closed |
| T-05-09-08 | Tampering (stale-save overwrite) | head-SHA refusal | high | mitigate | `src/routes/admin/w-skrocie/+page.server.ts`, `src/routes/admin/w-skrocie/+page.svelte`, `src/lib/server/admin/zapis.ts` +2 | closed |
| T-05-09-SC | Tampering (supply chain) | npm installs | high | mitigate | `package.json`, `package-lock.json` | closed |

*Status: closed · open · open — below high threshold (non-blocking)*
*Only open threats at or above `workflow.security_block_on` (high) count toward `threats_open`.*

---

## Open Threats

### T-05-02-01 — Information disclosure (regulatory, `dane-bip` §10 item 1)

| | |
|---|---|
| Component | /cennik rendered text |
| Severity | high (blocking) |
| Plan | `05-02-PLAN.md` |
| Auditor verdict | CLOSED, overturned on adversarial review |

**What the register promised.** Zero-and-condition are one indivisible string: src/lib/content/cennik.ts:67-74 returns "...pokrywa całą tę opłatę, więc rodzic dopłaca 0 zł..." from przykladZus(), rendered as a single <p> at src/routes/cennik/+page.svelte:122 inside <div class="blok-zus" id="zus-blok"> (opened :120, closed :124). Scoped test PAIR located: tests/cennik.spec.ts:74-81 asserts #zus-blok exists, matches /Aktywnie w żłobku/ and matches ZERO; tests/cennik.spec.ts:83-91 clones <main>, removes #zus-blok and asserts the remainder does NOT match ZERO. The regex is declared independently at tests/cennik.spec.ts:27 (/(^\|[^0-9])0(,00)?\s*zł/), and /rekrutacja's gate is genuinely NOT reused - tests/rekrutacja.spec.ts:183 still carries its own copy scoped to .fee-box. Static check of the store confirms no other field can match: src/lib/content/cennik.json wyzywienie says "20 zł" (digit precedes the 0) and nieobecnosc says "8:00" (no zł). Editor-save boundary additionally guarded downstream by WZORZEC_ZERA + zeroBezWarunku at src/lib/server/admin/walidacja/cennik.ts:107,151,218. CAVEAT: the test pair runs only under `npm run test` (Playwright), which nothing runs automatically - .pre-commit-config.yaml runs only `npm run check` and `npm run lint`, and .github/workflows does not exist.

**Why it does not close.** I ran both patterns: the save-time guard WZORZEC_ZERA (/(?<!\d)0(?!\d)\s*zł/u, walidacja/cennik.ts:107, used by zeroBezWarunku at :151) returns false for "Za nieobecność płacisz 0,00 zł." while the acceptance regex at tests/cennik.spec.ts:27 returns true — so an editor can save an unconditioned grosze-form zero (the exact "...,00 zł" format kwoty.ts:46-48 says the uchwała uses) into CENNIK.nieobecnosc/wyzywienie/kwotaOpis and publish it to /cennik and, via OPLATY (rekrutacja.ts:153-158) into .fee-box on /rekrutacja. The claim's "static check of the store confirms no other field can match" is only a point-in-time reading of a store the admin panel rewrites, and the test pair that would catch it lives in `npm run test`, which per the auditor's own caveat nothing runs (no .github/workflows, pre-commit runs check+lint only).

---

### T-05-05-01 — Information disclosure (regulatory, `dane-bip` §10 item 1)

| | |
|---|---|
| Component | `walidujCennik` conditional-zero rule |
| Severity | high (blocking) |
| Plan | `05-05-PLAN.md` |
| Auditor verdict | CLOSED, overturned on adversarial review |

**What the register promised.** Save-time rule present and boundary-anchored as declared. cennik.ts:107 `export const WZORZEC_ZERA = /(?<!\d)0(?!\d)\s*zł/u;` — a lookbehind AND a lookahead, so "1 500 zł" / "20 zł" / "1 000 zł" cannot match; cennik.ts:117 `export const MARKER_ZUS = 'Aktywnie w żłobku'`; cennik.ts:151-154 `zeroBezWarunku()` returns true only when the pattern matches AND the same field's own text lacks the marker (case-folded with toLocaleLowerCase('pl') on both sides). Applied to ALL FIVE text fields, not just the fee sentences, at cennik.ts:210-219 (loop over POLE_NAGLOWKA, POLE_KWOTY_OPIS, POLE_ZUS, POLE_WYZYWIENIA, POLE_NIEOBECNOSCI -> KOPIA_WALIDACJA.kwotaZeroBezWarunku). Both constants are genuinely exported and genuinely imported by the suite rather than retyped: tests/admin-walidacja-cennik.unit.ts:49-53 imports MARKER_ZUS/WZORZEC_ZERA/zeroBezWarunku, and drives them at :298-318 including the explicit four-digit non-trip case. Literal-substring gate confirmed absent (no `.includes('0 zł')` anywhere in the validator). Second layer verified too: build-time reader src/lib/cennik.ts:167 sets `pokazRozbicie: obnizka > 0` so a zero reduction removes the breakdown block rather than rendering "Obniżka 0 zł", and the render-time pair is tests/cennik.spec.ts:74 and :83. CAVEAT: both test tiers (node:test and Playwright) are manual — .pre-commit-config.yaml runs only check+lint and there is no CI — but the mitigation itself is unconditional production code.

**Why it does not close.** Everything cited is literally there, but the save-time rule does not close the threat for the grosze spelling: WZORZEC_ZERA=/(?<!\d)0(?!\d)\s*zł/u cannot match "płacisz 0,00 zł" (the pre-comma 0 is not followed by \s*zł, the two post-comma zeros fail the lookbehind/lookahead), so walidujCennik accepts and publishes an unconditioned zero amount. The project itself knows this spelling exists — the render-time regex at tests/cennik.spec.ts:27 is /(^\|[^0-9])0(,00)?\s*zł/ with an explicit `(,00)?` branch — and that second layer is a manual Playwright tier with no CI and no pre-commit hook (.pre-commit-config.yaml runs only check+lint, no .github/ exists), so nothing automatic catches it.

---

### T-05-07-02 — Denial of service (whole-site prerender aborted by one bad entry)

| | |
|---|---|
| Component | the gallery reader on `/o-nas` |
| Severity | high (blocking) |
| Plan | `05-07-PLAN.md` |
| Auditor verdict | CLOSED, overturned on adversarial review |

**What the register promised.** Drop-and-warn, never throw, located in production code. src/lib/galeria.ts:74-77 `if (typeof dane !== 'object' \|\| dane === null \|\| Array.isArray(dane)) { console.warn('galeria: pomijam store (nie jest obiektem JSON)'); return []; }` and :79-82 the same for a missing/non-array `zdjecia` list. Per-entry: :55 `if (typeof wpis !== 'object' \|\| wpis === null \|\| Array.isArray(wpis)) return null;` guards the container BEFORE any property access, :57-60 every field passes the single narrowing primitive `czytajTekst` (:39-41) and a missing one returns null, :62 the result is built key-by-key from guarded locals and never spread. :84-87 the loop skips nulls. The file-missing drop is src/lib/galeria.ts:110-111 `const obraz = wedlugNazwy[bazowaNazwa(zdjecie.plik)]; if (obraz === undefined) continue;`. There is no `throw` anywhere in the module (read in full, 115 lines). The page adds no second filter: src/routes/o-nas/+page.svelte:53 is the single call `galeriaZObrazami(czytajGalerie(galeriaStore), wedlugBazowejNazwy(uploads))`, with the reason stated at :51-52. Traced the one remaining downstream dereference for an L3 bypass: :178 `zrodlo={zdjecie.obraz.img.src}` is reachable only for entries `galeriaZObrazami` admitted, i.e. `obraz` is a defined Picture. `bazowaNazwa` (src/lib/zdjecia-nazwy.ts:38-40) is total on any string (`split('/').pop() ?? wartosc`).

**Why it does not close.** The claim's load-bearing inference is false: `galeriaZObrazami` (src/lib/galeria.ts:110-111) admits an entry whenever `wedlugNazwy[bazowaNazwa(plik)] !== undefined`, but `wedlugBazowejNazwy` (src/lib/zdjecia-nazwy.ts:48-49) returns a plain `{}` literal, so a stored `plik` of `constructor`, `__proto__`, `toString` or `valueOf` resolves off Object.prototype (I confirmed this in node: all four return non-undefined) and is admitted with `obraz` not a Picture, whereupon o-nas/+page.svelte:178 `zdjecie.obraz.img.src` throws a TypeError during prerender — exactly the "one bad entry aborts the whole-site prerender" threat, reachable via the hand-edited galeria.json that the module header at galeria.ts:4-5 itself puts in scope (the /admin path is safe only because uploads.ts:54 WZORZEC_NAZWY forces an image extension).

---

### T-05-02-05 — Spoofing (silent formatting drift)

| | |
|---|---|
| Component | `src/lib/kwoty.ts` separator |
| Severity | medium (below the `high` threshold, non-blocking) |
| Plan | `05-02-PLAN.md` |
| Auditor verdict | OPEN |

**What the register promised.** The register declares a TWO-layer mitigation. Layer 1 is present; layer 2 is gone at HEAD, so the row cannot be closed as written. LAYER 1 (found): src/lib/kwoty.ts:41 `const SEPARATOR = ' ';` and the codepoint pin at tests/kwoty.unit.ts:45-46 (`assert.equal(zlote(1500).codePointAt(1), 0x20)` and `assert.notEqual(..., 0x00a0)`), plus the byte-for-byte retype at tests/kwoty.unit.ts:50-52 (`assert.equal(OPLATY.kwota, '1 500 zł miesięcznie')`). LAYER 2 (ABSENT): the register names "the pre-existing E4 twin at tests/home.spec.ts:112 which retypes the shipped string and runs inside npm run test". `git show e649336:tests/home.spec.ts` (plan 05-02's own final commit) line 112 was `await expect(facts.getByText('1 500 zł')).toBeVisible();`. `git log --oneline e649336..HEAD -- tests/home.spec.ts` returns fe8bcc6 (plan 05-09), which replaced it: tests/home.spec.ts:146 now reads `await expect(kafelki.nth(2).locator('.fact-value')).toHaveText(CENNIK.placiTekst)` - an interpolation that asserts the rendered string equals its own source and is structurally blind to an ASCII-to-NBSP separator swap. The one string still retyped in that file (tests/home.spec.ts:152) carries only '20 zł/dzień' and '0 zł', neither of which has a thousands separator. Across the whole Playwright tier the literal '1 500' now survives only inside comments (tests/cennik.spec.ts:26, tests/rekrutacja.spec.ts:182); tests/rekrutacja.spec.ts:174 also compares against OPLATY.kwota, itself derived from CENNIK. CONSEQUENCE: the entire separator mitigation now lives in ONE file, tests/kwoty.unit.ts, run only by `npm run test:unit` - a tier nothing runs automatically (.pre-commit-config.yaml invokes only `npm run check` and `npm run lint`; .github/workflows does not exist). The redundancy the register explicitly relied on is gone. Severity medium is below the default block_on=high threshold, so this is non-blocking and excluded from threats_open. It is also the single point where 05-02-SUMMARY.md's Threat Flags claim ('mitigated by the codepoint pin plus the pre-existing tests/home.spec.ts:112 twin') is stale against HEAD.


---

### T-05-03-03 — Denial of service (keyboard and small-screen access)

| | |
|---|---|
| Component | Header breakpoint move 768px to 1024px |
| Severity | medium (below the `high` threshold, non-blocking) |
| Plan | `05-03-PLAN.md` |
| Auditor verdict | CLOSED, overturned on adversarial review |

**What the register promised.** All three declared claims verified. (a) Both tier assertions exist: tests/responsive.spec.ts:12-20 defines `tablet: {width:768}` and the new `desktopSm: {width:1024, height:768}`; :124-135 asserts at 768px that 'Otworz menu' is visible and the inline 'Aktualnosci' link is hidden; :137-148 asserts the inverse at 1024px. The pre-existing 375px (:94-105) and 1280px (:107-118) tiers are untouched, and :49-65 sweeps 7 routes x 4 widths for horizontal overflow. (b) The breakpoint actually moved: Header.svelte:158 `@media (min-width: 1024px) { .desktop-nav { display: block } }` and :206-210 `@media (min-width: 1024px) { .mobile-slot { display: none } }`. (c) Geometry is provably unchanged: `git show e68fd6d -- src/lib/components/Header.svelte` filtered to changed lines shows ONLY the two `768px` -> `1024px` media thresholds plus four comment rewrites. `.nav-link` min-height 44px (Header.svelte:176), padding 8px 12px (:177), gap 4px (:167), font-size 14px/700 (:180-181) and the `aria-current='page'` chip block (:194-198) appear nowhere in the diff, so the WCAG target-size claim holds. Six-item source of truth: src/lib/nav.ts:19-26 with `{label:'Cennik', href:'/cennik'}` fourth; count and DOM order now asserted at tests/nav.spec.ts:31-32 and :44. QUALIFICATION 1: like T-05-03-01 this lives only in the Playwright tier, which nothing runs automatically (no CI dir; .pre-commit-config.yaml runs check + lint only). QUALIFICATION 2, scope: the move makes the hamburger drawer the sole navigation across 768-1023px, and MobileNav.svelte:73-79 carries a documented, deliberately unfixed Shift+Tab focus-trap escape (.planning/phases/05-gallery-fees/deferred-items.md:89-117), while tests/nav.spec.ts:141-164 exercises the drawer only at 375px and never presses Tab. That defect predates this plan and no register row claims it, so it does not reopen this row, but the 'keyboard access' half of this threat is covered by tier visibility only.

**Why it does not close.** The three factual sub-claims check out (responsive.spec.ts:12-20 plus the 768px/1024px tests at :122-148, Header.svelte:158 and :206 moved to 1024px, and the e68fd6d Header diff touching only two thresholds plus comments), but the mitigation for a threat whose stated category is 'keyboard and small-screen access' consists solely of two viewport-visibility assertions in a Playwright tier that nothing runs (no .github directory exists; .pre-commit-config.yaml registers only npm run check and npm run lint), and unlike T-05-03-02 no build-time gate enforces a breakpoint value. Worse, the move hands the whole 768-1023px band to MobileNav.svelte, whose focus trap at :73-79 handles only active === first and active === last so clicking the drawer body puts focus on the tabindex='-1' dialog container and Shift+Tab escapes to the page beneath (documented and deliberately unfixed at deferred-items.md:89-117, called out there as a WCAG 2.1 AA legal requirement), while tests/nav.spec.ts:141-164 exercises the drawer only at 375px and never presses Tab - so the keyboard half of this threat is asserted nowhere at the widths the change newly affects.

---

### T-05-09-05 — Tampering (silent loss of a launch-gate marker)

| | |
|---|---|
| Component | the two placeholder line comments |
| Severity | medium (below the `high` threshold, non-blocking) |
| Plan | `05-09-PLAN.md` |
| Auditor verdict | CLOSED, overturned on adversarial review |

**What the register promised.** Markers re-homed: src/lib/content/w-skrocie.json:3 (`"placeholder": true` inside godziny) and :10 (`"placeholder": false` inside miejsca). The replacement sentences naming where they went are present, not just promised: src/lib/content/site.ts:64-67 ('The launch-gate marker that used to be a `// PLACEHOLDER:` line comment here now lives in that store as the per-tile boolean `godziny.placeholder`') and :105-108. The executable inventory exists and does what is claimed: tests/zastepcze.unit.ts:49-59 walks every .json under src/lib/content off disk, :65-81 collects every `placeholder` key at ANY depth (recursing through objects and arrays, dotted path preserved), :87-98 asserts each value is a boolean with a non-vacuity guard at :90 (`INWENTARZ.length > 0`), :100-115 asserts the two new paths BY NAME ('w-skrocie.json.godziny.placeholder', 'w-skrocie.json.miejsca.placeholder'), and :117-127 prints the inventory for the Phase 6 gate. EXPLICIT CAVEAT, stated because the mitigation's strength depends on it: this test lives in a tier nothing runs automatically. .pre-commit-config.yaml declares exactly two hooks, `npm run check` and `npm run lint`; `npm run test:unit` is in neither, and `find .github/workflows` returns nothing (no CI in this repo). The marker is preserved in code and asserted by name, but the assertion only fires when a human runs the suite.

**Why it does not close.** The markers and tests/zastepcze.unit.ts:100-115 are exactly as described, but the enforcing half never runs: .pre-commit-config.yaml declares only `npm run check` and `npm run lint`, there is no .github directory, and the repo's own .claude/CLAUDE.md:44 states 'nothing automated runs test:unit' — a guard that fires only when a human remembers a command does not close a launch-gate obligation, especially since the test file itself notes the Phase 6 gate greps for a PLACEHOLDER token that a JSON boolean does not contain.

---

## Remediation

Both blocking code defects are small and local. Neither needs a design change.

### 1. `WZORZEC_ZERA` misses the grosze spelling (closes T-05-05-01 and T-05-02-01)

`src/lib/server/admin/walidacja/cennik.ts:107` is

```ts
export const WZORZEC_ZERA = /(?<!\d)0(?!\d)\s*zł/u;
```

It rejects `0 zł` and accepts `0,00 zł`. The project's own render-time regex at
`tests/cennik.spec.ts:27` is `/(^|[^0-9])0(,00)?\s*zł/` — it already carries the `(,00)?`
branch, so the repository knows the spelling exists and only the save-time half is blind to
it. Widening the save-time pattern to cover the grosze form realigns the two halves:

```ts
export const WZORZEC_ZERA = /(?<!\d)0(?:,00)?(?!\d)\s*zł/u;
```

Validated across eleven strings before being written here. It trips on every zero spelling
(`0 zł`, `0,00 zł`, `0zł`, and the zero inside a sentence) and stays silent on every non-zero
amount, including the three the boundary anchors exist to protect (`1 500 zł`, `1 000 zł`,
`2 337 zł`) and the two that would catch a careless widening: `10,00 zł` (a real amount whose
digits contain `0,00`) and `0,50 zł` (a leading zero that is not a zero amount). Both remain
non-matching, so the change is a strict superset on zero forms and a no-op everywhere else.

### 2. Prototype-chain lookup admits a non-image (closes T-05-07-02)

`src/lib/zdjecia-nazwy.ts:48-55` returns a plain `{}` object literal, and
`src/lib/galeria.ts:110-111` admits an entry on `obraz !== undefined`. A stored `plik` of
`constructor`, `__proto__`, `toString`, `valueOf` or `hasOwnProperty` therefore resolves off
`Object.prototype`, is admitted with `obraz` bound to a function rather than a `Picture`, and
`src/routes/o-nas/+page.svelte:178` then dereferences `zdjecie.obraz.img.src` and throws a
TypeError during the whole-site prerender. `zdjecieGalerii` does not constrain `plik` beyond
`czytajTekst`, so nothing upstream rejects the name.

Either fix works; the first is the smaller diff:

```ts
// src/lib/galeria.ts
if (!Object.hasOwn(wedlugNazwy, bazowaNazwa(zdjecie.plik))) continue;
const obraz = wedlugNazwy[bazowaNazwa(zdjecie.plik)];
```

```ts
// or src/lib/zdjecia-nazwy.ts — a null-prototype map has no inherited keys to hit
const wedlugNazwy = Object.create(null) as Record<string, T>;
```

`src/lib/server/admin/uploads.ts:104` wraps the same map in `Object.keys(...)`, which returns
own keys only, so that caller is unaffected either way. The panel's own upload path is also
already safe: `WZORZEC_NAZWY` forces an image extension. The reachable vector is a hand-edited
`galeria.json`, which `src/lib/galeria.ts:4-5` puts in scope by its own module header.

Each fix wants a test in the tier that already covers its neighbours:
`tests/admin-walidacja-cennik.unit.ts` for the first, `tests/galeria.spec.ts` for the second.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-05-01 | T-05-02-03 | A malformed committed store fails `vite build` rather than publishing a blank fee page. `/cennik` has no honest empty state and a failed build leaves the previous deployment live | Plan 05-02 | 2026-08-17 |
| R-05-02 | T-05-05-08, T-05-06-09 | One save equals one Cloudflare Pages build, roughly two minutes to publish against a free ceiling of 500 builds per month. One "Zapisz" per screen, never per field | Plan 05-05, 05-06 | 2026-08-17 |
| R-05-03 | T-05-07-07 | `KNOWN_FUTURE_ROUTES` is empty, so a broken internal link fails the build. A failed build leaves the previous deployment live, which this project prefers over a published broken link | Plan 05-07 | 2026-08-17 |
| R-05-04 | T-05-03-04, T-05-04-05, T-05-08-05 | No new information-disclosure or privilege surface: the lightbox renders only already-prerendered content, and every new `/admin` route inherits the layout gate with no `+server.ts` under `/admin` and nothing under `static/admin/` | Plans 05-03, 05-04, 05-08 | 2026-08-17 |
| R-05-05 | AG-3 (project-wide) | Every E4 (Playwright + axe) and E5 (`node:test`) mitigation in this register is proven only when a human runs the command. There is no CI. `05-VALIDATION.md` states this is not Phase 5's to fix. The full suite was run by hand during this audit: `npm run check` 0 errors, `npm run lint` clean, `npm run test:unit` 592 passed, `npm run test` 419 passed | This audit | 2026-08-18 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-18 | 64 | 58 | 6 (3 blocking) | gsd-security-auditor x9 + adversarial reviewer x9, orchestrated by /gsd-secure-phase 05 |

Adversarial review overturned six closures the per-plan auditors had accepted:
T-05-02-01, T-05-03-03, T-05-05-01, T-05-07-02, T-05-08-04 and T-05-09-05.
T-05-08-04 was restored to closed by the orchestrator on evidence the reviewer did not have:
its axe open-state scan did execute and pass in this session's `npm run test` run (419 passed).
The other five stand.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [ ] `threats_open: 0` confirmed — **3 open at high severity**
- [ ] `status: verified` set in frontmatter

**Approval:** pending — blocked on T-05-02-01, T-05-05-01 and T-05-07-02
