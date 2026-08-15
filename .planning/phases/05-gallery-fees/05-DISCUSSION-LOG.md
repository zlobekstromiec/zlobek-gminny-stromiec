# Phase 5: Gallery & Fees - Discussion Log

**Date:** 2026-08-15
**Mode:** default (interactive)

> Human reference only. Downstream agents read `05-CONTEXT.md`, not this file.

## Areas Selected

All four offered areas were selected: Fee source of truth, CMS editability vs D-18, Gallery presentation, Nav placement.

---

## Area 1: Fee source of truth

### Q1. Which fee figures are authoritative for /cennik?

Presented three-way contradiction found during scouting:

| Where | Value | Status |
|---|---|---|
| `rekrutacja.ts` `OPLATY.kwota` | 1 500 zł/mies. + wyżywienie maks. 20 zł/dzień | shipped live |
| `site.ts` `keyFacts` | 1 500 zł + same wyżywienie line | shipped live |
| `DESIGN-BANK.md` §Cennik | 400 zł/mies., 14 zł/dzień, wpisowe 0 zł | banked, never shipped |

**Options:** Shipped OPLATY wins / DESIGN-BANK wins / Both unconfirmed keep PLACEHOLDER
**Selected:** Shipped OPLATY wins (1 500 / 20 zł)
**Consequence noted:** striking DESIGN-BANK's fee block also removes the `Wpisowe 0 zł` card, which would have tripped the existing unconditional-`0 zł` gate at `tests/rekrutacja.spec.ts:168`.

### Q2. How should /cennik relate to the existing FeeBox and OPLATY const?

**Options:** One source cennik renders richer view / Cennik owns fees rekrutacja imports / Separate modules test enforces agreement
**Selected:** delegated to Claude ("decide urself if 1 or 2 is better and go with it")
**Claude's decision:** option 1, OPLATY stays canonical.
**Reasoning given:** `FeeBox.svelte` was deliberately built no-props precisely so pages cannot quote different amounts (its header comment says so); inverting ownership touches two shipped tested surfaces for no visitor-visible gain; `tests/rekrutacja.spec.ts` already imports `OPLATY` to interpolate assertions, so those tests keep passing untouched.
**Refinement added:** since `/cennik` needs fields `OPLATY` does not carry, a cennik-only prose module holds the extra copy and imports amounts rather than restating them.
**Later modified by Q6:** the backing store became JSON rather than a TS literal, but `OPLATY` remained the canonical exported symbol. Recorded as D-03.

### Q3. Should /cennik show the pre-subsidy price and the obniżka breakdown?

**Options:** Yes show 2 337 to 1 500 / No lead with 1 500 only / Show it but secondary
**Selected:** Yes, show 2 337 zł to 1 500 zł

### Q4. How prominent should the ZUS route to 0 zł be?

**Options:** Prominent near the amount / Present but secondary / Prominent plus offer help with formalities
**Selected:** Prominent, near the amount

---

## Area 2: CMS editability vs D-18

Framing offered before the questions: the Sveltia coupling is shallower than it looks, because all content is plain JSON under `src/lib/content/` read by build-time readers, with `config.yml` a thin declarative mapping on top. Also flagged that the fee decision from Area 1 had created a wrinkle: `OPLATY` is TypeScript and therefore not CMS-editable, while FEES-01 requires editability.

### Q5. How should GALLERY-02 be satisfied given D-18?

**Options:** Add Sveltia collection with CMS-agnostic JSON / JSON + reader only no CMS wiring / Amend roadmap descope CMS half
**Selected:** freeform. User stated the replacement target explicitly: *"We are getting rid of sveltia cms, so build it in a way so that later this can be easily modifiable for the user but in another cms perhaps we are going to go with our own custom admin panel with cloudflare otp email code access"*
**Significance:** this supersedes the vaguer "simpler CMS" in `04-CONTEXT.md` D-18 with a specific architecture.

### Q6. FEES-01 requires CMS-editability but OPLATY is code-authored TypeScript

**Options:** Move amounts to JSON singleton / Prose CMS-editable amounts stay in code / Whole cennik in JSON guarded by tests
**Selected:** Move amounts to JSON singleton, code imports it

### Q7. Should Phase 5 still add the cheap Sveltia wiring as an interim?

Two consequences flagged before asking: (a) the custom panel is its own phase, not this one; (b) a custom panel needs a write path that does not exist today, and the runtime-store option would end the site's prerendered zero-JS no-database property.

**Options:** Skip Sveltia entirely / Wire it treat as disposable / Wire cennik only
**Selected:** Skip Sveltia entirely
**Consequence accepted:** GALLERY-02 and FEES-01 stay unmarked at phase completion as tracked debt.

### Q8. When does the custom admin panel land?

**Options:** New phase in v1 before launch / After v1 launch / Undecided capture as deferred
**Selected:** New phase in v1, before launch
**Follow-up required:** discussion cannot amend ROADMAP.md; the phase must be inserted with `/gsd-phase`.

---

## Area 3: Gallery presentation

Prior art surfaced: `/o-nas` §6 "Nasze miejsce" grid; no lightbox exists anywhere in the codebase; all content routes are prerendered zero-JS with only three hydrated islands.

### Q9. What layout for the nine banked slots?

**Options:** Reuse o-nas grid add 3-col desktop / Reuse verbatim 2-col max / Grouped by area with subheadings
**Selected:** Reuse o-nas grid, add 3-col desktop

### Q10. Should photos open larger (lightbox)?

**Options:** No lightbox plain grid (recommended) / Yes hydrated lightbox island / No JS native full-size links
**Selected:** Yes, a hydrated lightbox island
**Note:** the recommended option was not taken. Accessibility bar recorded in D-13 as a result: focus trap, Escape, reduced-motion, keyboard operable, own axe pass in both states, page fully usable without JS.

### Q11. What photos does Phase 5 ship with?

**Options:** Placeholders now real in Phase 6 / Only real consented photos fewer slots / Real photos required before page ships
**Selected:** Placeholders now, real photos in Phase 6

---

## Area 4: Nav placement

Loose end surfaced: `/dojazd` is footer-linked and in `KNOWN_FUTURE_ROUTES`, but Phase 4 built directions into `/kontakt`, so it has no owning phase and would 404 indefinitely.

### Q12. Where should Galeria and Cennik appear?

**Options:** Footer only nav stays five / Add both to main nav seven items / Add Cennik only six items
**Selected:** Add both to the main nav (seven items)
**Cost accepted:** amendment to the locked Copywriting Contract in `01-UI-SPEC.md`. Flagged that seven inline desktop items is a real density change that `/gsd-ui-phase 5` should pin down.

### Q13. What happens to the orphaned /dojazd footer link?

**Options:** Repoint to /kontakt anchor / Remove the link / Out of scope leave it
**Selected:** Repoint footer link to /kontakt anchor

---

## Closing

**Q14.** Offered further areas: `/cennik` page structure (cards vs table vs prose), whether the fee JSON store also absorbs `site.ts` keyFacts strings, photo caption and alt-text authoring rules, odpisy detail level.
**Selected:** "I'm ready for context" — those four fall to Claude's Discretion in `05-CONTEXT.md`.

## Claude's Discretion Items

Recorded in `05-CONTEXT.md` under Claude's Discretion: fee-store shape resolution (explicitly delegated), JSON schemas and reader signatures, basename-idiom extraction, `/cennik` page structure, lightbox implementation details, caption and alt-text rules, odpisy detail level, keyFacts derivation.

## Deferred Ideas Captured

Custom admin panel as a new v1 phase (with its write-path research question); `/dojazd` as a standalone page (dead); real consented photo set (Phase 6); EU funding marking (Phase 6); AG-3 unit-test gate gap; Phase 3 prettier-vs-CMS-indent policy.
