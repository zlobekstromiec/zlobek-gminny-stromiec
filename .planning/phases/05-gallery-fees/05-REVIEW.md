---
phase: 05
slug: gallery-fees
reviewed: 2026-08-17
depth: standard
reviewer: gsd-code-reviewer
diff_base: eac349c
files_reviewed: 48
status: issues
findings:
  critical: 2
  warning: 5
  info: 4
  total: 11
---

# Phase 05: Code Review Report

**Reviewed:** 2026-08-17
**Depth:** standard (per-file analysis, language-aware, plus targeted cross-file tracing)
**Scope:** the 48 files changed between `eac349c` and `HEAD` under `src/` and `svelte.config.js`
**Status:** issues_found

## Summary

The phase is unusually disciplined: readers narrow before they construct, results are built key by
key rather than spread, the two upload helpers reproduce the ownership rule rather than
parameterising it, and `npm run check` is clean (4403 files, 0 errors, 0 warnings). No secret is
read outside `platform.env`, no `import.meta.env` appears anywhere in `src/`, there is no
`static/admin/` and no `/functions` directory, no `tailwind.config.js`, and nothing in the new
server code logs a submitted value.

Two defects are nonetheless serious. One is a reachable **runtime throw** on the `/admin/galeria`
error path, proven by running the validator. The other is a **silent revert of an editor's previous
save** that the head-SHA conflict check structurally cannot catch, because the SHA is read live
while the form's values are read from the last build. The second is inherited from Phase 04.1 and
affects five screens, but this phase's „one screen, the whole list, one Zapisz" shape (D-21) is what
makes the amount of work lost by one round trip large.

The remaining findings are a WCAG 2.4.4 regression on the two new singleton screens, one published
fee figure that this phase left in two places while removing that hazard everywhere else, an
unenforced conditional-zero rule on the new W skrócie fields, and misleading security documentation
repeated verbatim in three new server files.

---

## Critical Issues

### CR-01: `/admin/galeria` throws `each_key_duplicate` whenever a photo item carries both a file error and a data error

**File:** `src/routes/admin/galeria/+page.svelte:98-114` (the summary), `:148` (the keyed each)
**Related:** `src/lib/server/admin/walidacja/galeria.ts:181-211`

`podsumowanie` maps four field names onto three DOM targets, and **two of those four map to the
same target**:

```
[POLE_DANYCH, `${wyspa}-plik`],
[POLE_PLIKU,  `${wyspa}-plik`],   <- same `cel`
[POLE_PODPISU, idPola(...)],
[POLE_ALTU,   `${wyspa}-alt`],
```

The list is then rendered `{#each podsumowanie as wpis (wpis.cel)}`. Svelte 5 throws on a duplicate
key in a keyed each block, **in production as well as in development**
(`node_modules/svelte/src/internal/client/errors.js:136-148`; the server renderer does not validate
keys, so SSR emits the duplicate silently and the throw lands on the client during hydration or on
the `use:enhance` update).

The two errors are set together by a **single** malformed value. Reproduced against the real
validator (Node 25, `--experimental-strip-types`):

```
walidujGaleria(fd, new Set())  // fd: galeria[0].plik = 'Sala_Zabaw.JPG', podpis + alt filled, dane = ''
=> { ok: false, pola: {
       "galeria[0].plik": "Ten plik nie jest zdjęciem. Wybierz plik JPG, PNG lub WEBP.",
       "galeria[0].dane": "Wybierz zdjęcie albo usuń całą pozycję."
   } }
```

The chain is: `bezpiecznaNazwaOkladki` refuses the basename → `stare[i] === null` → `pola[…plik]`
set (`galeria.ts:183-185`); `surowyPlik` is therefore not a string → `zachowajStare` false →
`jestZdjecie` false → `pola[…dane]` set (`galeria.ts:209-211`).

**Why it matters here.** `WZORZEC_NAZWY` admits only `^[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png|webp)$`.
`src/lib/assets/uploads/README.md` documents that files are also placed by hand, and
`galeria.json` is hand-editable in a PR. `IMG_2043.jpg`, `Sala_Zabaw.jpg` or `plac zabaw.jpg` are
the most likely hand-added names there are, and every one of them fails that pattern. The first
save an editor attempts after such an entry lands takes the panel screen down instead of showing
the Polish refusal that explains it. This is precisely the screen an editor cannot get past without
a developer.

**Fix:** make the key unique, and keep the link target as it is.

```svelte
for (const [pole, cel] of [...]) {
    const komunikat = pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, indeks, pole)];
    if (komunikat === undefined) continue;
    wpisy.push({ klucz: `${indeks}-${pole}`, cel, tekst: bladWElemencie(...) });
}
...
{#each podsumowanie as wpis (wpis.klucz)}
```

Deduplicating on `cel` instead would also work, but it hides one of the two refusals from the
editor, so the composite key is the better answer. Note that `/admin/cennik` and `/admin/w-skrocie`
are safe from this: their `cel` is derived from a unique field name.

---

### CR-02: A second save inside the build window silently reverts the first, and the conflict check cannot see it

**Files:** `src/routes/admin/galeria/+page.server.ts:45, 100-129, 254-262`;
`src/routes/admin/cennik/+page.server.ts:33, 71-96`;
`src/routes/admin/w-skrocie/+page.server.ts:42, 70-95`
**Inherited from:** Phase 04.1 (`/admin/o-nas`, `/admin/plan-dnia`, `/admin/nabor` have the same
shape). Not introduced here, but this phase adds three more screens on it and one of them also
deletes files.

Every one of these screens builds its form from a **build-time** import
(`import galeriaStore from '$lib/content/galeria.json'`), while `oczekiwanySha` comes from
`aktualnyShaGlowy(platform?.env)`, a **live** read of the repository head. Those two facts do not
agree during the roughly two minutes a Cloudflare Pages build takes.

Sequence, all inside that window:

1. Editor loads `/admin/galeria`. Build N's store holds `[A, B]`. Head is `H0`.
2. Editor adds photo `C`, saves. Commit `H1` writes `[A, B, C]` plus the file. 303 redirect.
3. The redirect GET runs `load` on the **still-deployed build N** Worker. `wartosciZPliku()`
   returns `[A, B]`; `sha` is read live and is `H1`.
4. The screen shows two photos. `C` is not on it.
5. Editor fixes a caption and saves. The form posts `[A, B']` with `sha = H1`. Head is still `H1`,
   so `zapiszTresc` sees **no conflict** and commits `[A, B']`.

`C` is gone from the store, its file is orphaned in git, and nothing told the editor. The head-SHA
mechanism (04.1 D-10) cannot help: the SHA is fresh and matching. The failure is that the *content*
is stale, not the ref.

A second consequence is specific to the gallery. The deletion list at `:259-262` is computed from
`czytajGalerie(galeriaStore)` and filtered by `istniejaceNazwy()`, both of which come from build N.
If the first save removed a panel-generated photo, the second save recomputes the same deletion,
and the GitHub tree API is asked to null a path that `H1` no longer carries. Condition 4 of
`zdjecieGaleriiDoUsuniecia` exists to prevent exactly that and cannot, because it consults the same
stale build. (I have not exercised the GitHub response for that case; the code comment at
`uploads.ts:121-123` asserts it fails the whole atomic save, which is the behaviour to expect.)

**Why it matters here.** 05 D-21 chose one screen, the whole list and one „Zapisz" specifically so
an editor does twelve photos in one sitting. That is the maximum amount of work one stale round
trip can discard, and the panel's own copy („zmiany pojawią się po około 2 minutach") invites the
save-notice-a-typo-save-again pattern that triggers it.

**Fix (needs its own plan, it is a panel-wide property):** the load must read the same source the
conflict check reads. Two workable shapes:

1. read the file's current content from GitHub in `load` (one API call, beside the head read
   already there) and fall back to the bundled import only when that read fails; or
2. carry the *committed content hash* the form was built from in a hidden field alongside
   `POLE_SHA`, and refuse the save when the file's blob SHA at head differs from it. That turns
   the silent revert into the existing Polish conflict panel, which is the behaviour 04.1 D-10
   already promises for the case it can see.

Until one lands, the screens should at minimum not present stale values as current after a
redirect; the pulpit already states the staleness in prose (`admin/+page.server.ts:22-26`) and the
editor screens do not.

---

## Warnings

### WR-01: `/admin/cennik` and `/admin/w-skrocie` validation summaries can render several identical links (WCAG 2.4.4)

**File:** `src/routes/admin/cennik/+page.svelte:97-109`; `src/routes/admin/w-skrocie/+page.svelte:110-114`

Both build summary entries as `{ cel: ident(pole), tekst: pola[pole] }`: the visible link text is
the raw error message, with no field name. Several of the new messages are shared by several
controls on the same screen:

| Message | Fields that can carry it at once |
|---|---|
| `KOPIA_WALIDACJA.poleBrak` („Uzupełnij to pole.") | `naglowek`, `kwotaOpis`, `wyzywienie`, `nieobecnosc` |
| `KOPIA_WALIDACJA.kwotaZeroBezWarunku` | all five text fields (`cennik.ts:210-219`) |
| `tekstZaDlugi(MAKS_ZDANIA)` | four fields, identical cap |
| `tekstZaDlugi(MAKS_ATOMU)` | `godziny`, `dniPelne`, `dniSkrot`, `weekend`, `dopisek` |

An editor who blanks the whole „Opis opłat" fieldset gets four links reading „Uzupełnij to pole."
pointing at four different controls. This is the exact failure the repository already documents and
already solved: `src/lib/content/panel.ts:892-901` says so in `bladWElemencie`'s own doc comment,
and `/admin/galeria` and `/admin/plan-dnia` use it. The two new singleton screens do not.

(The existing `/admin/o-nas` singleton half has the same shape, so the pattern is inherited; what is
new is that this phase added a deliberate catch-all message and a rule that can fire on five fields
at once, which makes the collision ordinary rather than theoretical.)

**Fix:** compose the summary line from the field's own label, the same way the repeated groups do.

```ts
.map((pole) => ({ cel: ident(pole), tekst: bladWElemencie(ETYKIETY[pole], pola[pole]) }))
```

with `ETYKIETY` reading the labels already declared in `POLA_CENNIK` / `POLA_W_SKROCIE`.

---

### WR-02: the homepage fee tile hard-codes a food charge that an editor now owns on `/admin/cennik`

**File:** `src/lib/w-skrocie.ts:244-245`, used at `:255`

```ts
const OPLATA_DOPISEK =
    '+ wyżywienie maks. 20 zł/dzień; możliwe 0 zł ze świadczeniem ZUS „Aktywnie w żłobku"';
```

`20 zł` is also the figure inside `CENNIK.wyzywienie` (`src/lib/content/cennik.json:8`), which
plan 05-04 made editable. An editor who corrects the daily food rate on `/admin/cennik` publishes a
homepage tile that contradicts `/cennik` and `FeeBox` about a fee on a public body's website.

The module comment at `:240-242` names the mitigation: „tests/home.spec.ts cross-checks the two so
they cannot drift apart silently." That mitigation cannot fire on the path that produces the drift.
The panel commits straight to `main`, Cloudflare Pages builds and deploys on push, and this project
has **no CI** (`.claude/CLAUDE.md`: „pre-commit runs only the first two, and nothing automated runs
`test:unit`"). The Playwright suite is a developer-time gate, not a deploy gate.

This is also the one place Contract 7's own reasoning is not carried through: the fee *amount* was
made computed precisely to delete the drift hazard structurally, and the food figure beside it was
left duplicated.

**Fix:** compose the suffix from the store the same way the value is, so it cannot disagree. If the
suffix must stay a fixed sentence for the conditional-zero test lockstep, extract the food amount
into the cennik store as its own whole-złoty number (a sibling of `stawka` / `obnizka`) and
interpolate it into both `OPLATA_DOPISEK` and the `wyzywienie` sentence, rather than letting an
editor retype it in prose.

---

### WR-03: the conditional-zero rule is not enforced on any `/admin/w-skrocie` field

**File:** `src/lib/server/admin/walidacja/w-skrocie.ts:139-202`

`walidujCennik` applies `zeroBezWarunku` to every text field it accepts
(`walidacja/cennik.ts:205-219`), for the reason its own header states: an amount of nothing may not
be published without the condition that makes it nothing (dane-bip §10 pkt 1). `walidujWSkrocie`
applies no such check to any of its five text fields.

`dopisek` is rendered directly under the „Liczba miejsc" tile on the front page
(`w-skrocie.ts:256`), and `godziny`, `dniPelne`, `dniSkrot` and `weekend` reach the fact strip, the
top bar, `contact.hours`, `/kontakt` and the footer. „0 zł" typed into any of them is published on
five surfaces with nothing beside it.

I am flagging this as a gap rather than a spec violation: 05-UI-SPEC Contract 11 does not extend
the rule to this screen, and Contract 7 addresses the fee tile by making it read-only. But the rule
is a publishing rule about the site, not about one screen, and this phase introduced the first
editor-writable free-text field that renders on the homepage without it.

**Fix:** run the existing exported `zeroBezWarunku` over the five text fields in
`walidujWSkrocie` and reuse `KOPIA_WALIDACJA.kwotaZeroBezWarunku`. It is an import and five lines,
and it keeps one rule with one implementation.

---

### WR-04: three new server files repeat a security claim that is false in both halves

**Files:** `src/routes/admin/galeria/+page.server.ts:34-37`;
`src/routes/admin/cennik/+page.server.ts:29-31`; `src/routes/admin/w-skrocie/+page.server.ts:28-30`

Each says, verbatim:

> NO +server.ts LIVES UNDER /admin, HERE OR ANYWHERE. The session gate covers pages and their POSTs
> by layout inheritance; a standalone endpoint is the one construct that would sit outside it.

Both halves are wrong.

1. `src/routes/admin/pomoc/instrukcja/+server.ts` exists. The absolute claim is simply untrue, and
   the next person who greps for it will conclude the repository has drifted.
2. The gate is **not** layout inheritance. `src/routes/admin/+layout.server.ts` (28 lines, read in
   full) performs no authentication at all: it returns `sekcja` and `editor` and nothing else. The
   gate is `src/hooks.server.ts:40-73`, which matches on `pathname` and therefore *does* cover
   `+server.ts` endpoints, form POSTs and everything else under `/admin`.

**There is no live vulnerability here** — the hook covers the existing endpoint. The defect is that
three new files, in the most security-sensitive part of the codebase, tell a maintainer the auth
boundary is somewhere it is not. A future author who trusts them could add an endpoint believing a
layout protects it, or move the hook believing it is redundant.

**Fix:** replace the paragraph in all three files with the accurate statement, for example:
„Every path under /admin is gated in src/hooks.server.ts before the router runs, so pages, their
POSTs and any +server.ts endpoint are all covered. Nothing goes under static/admin/, because
Cloudflare Pages resolves static assets before invoking the Worker."

---

### WR-05: the lightbox focus trap can be escaped with Shift+Tab

**File:** `src/lib/components/Lightbox.svelte:118-145`, `:160-169`

`klawisz` only redirects Tab when `document.activeElement` is the first or the last focusable
element inside the dialog. The dialog itself carries `tabindex="-1"` (`:166`), which makes it
**click-focusable**: a visitor who clicks the enlarged photograph moves focus to the dialog
container, which is neither `pierwszy` nor `ostatni`. Shift+Tab from there is not intercepted and
takes focus out of the dialog, behind the scrim, onto the tile links the trap is supposed to bound.

The component's own comment at `:126-128` states the property being enforced as „Tab and Shift+Tab
never reach the tile links on either side of it". The implementation does not deliver it on that
path.

**Fix:** treat „focus is on the dialog container" as the same case as „focus is on the last
element", so both directions land back on the close button:

```ts
const aktywny = document.activeElement;
if (aktywny === dialogEl) {
    zdarzenie.preventDefault();
    (zdarzenie.shiftKey ? ostatni : pierwszy).focus();
    return;
}
```

---

## Info

### IN-01: dead copy constant

**File:** `src/lib/content/panel.ts:589`

`KOPIA_WALIDACJA.zdjecieBrak` („Wybierz zdjęcie albo usuń tę pozycję.") has no reference anywhere in
`src/`, `tests/` or `docs/`. Its only consumer was the O nas photo validator that plan 05-07
deleted; the gallery uses the new `zdjecieGaleriiBrak` beside it. Removing it means updating the
`EKSPORTY` length assertion in `tests/admin-copy.unit.ts`, which is why it presumably survived.

### IN-02: the ZUS benefit name uses two different closing quotes across this phase's new strings

**File:** `src/lib/content/panel.ts:326` uses `„Aktywnie w żłobku”` (U+201D); every other new
occurrence uses `„Aktywnie w żłobku"` (U+0022) —
`src/lib/w-skrocie.ts:245`, `src/lib/content/cennik.ts:30,36,42,70`,
`src/lib/content/cennik.json:7`, `src/routes/cennik/+page.svelte:115`.

The repository is already inconsistent about this (134 ASCII vs 9 typographic across
`src/lib/content/*.ts`), and the new hint follows `panel.ts`'s own local convention, so this is not
a regression so much as a missed chance to converge. It does not affect the validator: `MARKER_ZUS`
matches the name without its quotes. Worth resolving once, repository wide, rather than per file.

### IN-03: an over-cap gallery save can lose its cap message

**File:** `src/lib/server/admin/walidacja/galeria.ts:162-165` and `:195-198`

The cap refusal is written to `galeria[12].dane` before the loop, and the loop's
`if (nowyBase64 === null)` branch assigns to the same key **unconditionally**. A thirteenth item
that also carries an unusable data URL therefore replaces „Możesz dodać najwyżej 12 zdjęć…" with
„wrong file type", and the editor is told to change a file rather than to remove an item. The save
is still refused, so this is a message-quality defect only. Guarding the assignment the way the
`zdjecieGaleriiBrak` branch at `:209` already guards its own would fix it.

### IN-04: `limit` without `komunikatLimitu` silently disables the cap affordance

**File:** `src/lib/components/admin/PowtarzalnaGrupa.svelte:364-371`

`{#if naLimicie && komunikatLimitu}` falls through to the add button when a caller passes `limit`
but no message, so the cap is not enforced and nothing says why. The prop doc at `:151-153` says the
two are „passed with `limit` or not at all", but nothing makes that true. The `przenoszenie`
`$derived` just above (`:170-179`) demonstrates the pattern that would: collapse the pair into one
value so a half-configured mount is inexpressible.

---

## Areas examined with no findings

Stated explicitly so a reader can tell what was checked from what was skipped.

- **`src/lib/server/admin/uploads.ts` (gallery half).** `nazwaZdjeciaGalerii` and
  `zdjecieGaleriiDoUsuniecia` are correct. The name is generated, never accepted; the four
  deletion conditions are applied in the stated order; `bezpiecznaNazwaOkladki`'s allowlist admits
  no separator and no dot run, so no request-supplied value can name a path outside
  `src/lib/assets/uploads`. The `endsWith` comparison in the still-in-use check errs toward *not*
  deleting, which is the safe direction. The suffix loop is bounded and its unreachable tail
  returns rather than throwing. The two hand-placed seed files are unreachable by construction.
  (The stale-build interaction is CR-02, not a defect in this module.)
- **`src/lib/server/admin/serializuj.ts`.** Unchanged behaviour, one function, no issue.
- **`src/lib/server/admin/walidacja/cennik.ts`.** `WZORZEC_ZERA` is correctly boundary-anchored
  (`(?<!\d)0(?!\d)\s*zł`): it matches „0 zł" and rejects „1 500 zł", „20 zł", „1 000 zł". The
  cross-field invariant is strictly-less-than as specified, is evaluated only when both numbers
  survived their own readers, and every field is read before anything is refused. The result is
  constructed key by key in the committed key order.
- **`src/lib/server/admin/walidacja/w-skrocie.ts`.** Fixed arity is a structural property, not a
  count check; an absent field is a refusal, never a default; `dopisek ?? ''` is correct after the
  null narrowing. (WR-03 is a missing rule, not a fault in what is implemented.)
- **`src/lib/kwoty.ts`.** Hand-rolled grouping is correct for 0, 1, 999, 1000, 1500, 2337, 9999;
  `Math.trunc` over `Math.round` is right; the sign is preserved; the non-finite guard returns a
  visibly broken value rather than a plausible one. Separator is U+0020 as specified.
- **`src/lib/cennik.ts`, `src/lib/galeria.ts`, `src/lib/w-skrocie.ts`.** All three guard the
  container before any property access, narrow every field through one primitive, construct key by
  key and never spread. The opposite degrade policies (cennik throws at module scope, w-skrocie
  falls back to code-authored defaults) are deliberate and documented; note only that w-skrocie's
  „it never throws" property is transitive on `cennik.ts`, which does throw, so a malformed
  `cennik.json` still fails the build. That is the intended precedence.
- **`src/lib/godziny.ts`, `src/lib/zdjecia-nazwy.ts`, `src/lib/sciezki-panelu.ts`,
  `src/lib/pola-strony.ts`.** Pure, no I/O, correct boundary placement outside `$lib/server`.
  `indeksZadania` bounds the client-supplied index against the dense collected array;
  `zbierzIndeksowane` is dense as claimed. `przeniesZdjecie`'s splice pair is correct in both
  directions.
- **`src/routes/cennik/+page.svelte`.** Structure matches Contract 3 and 4: no `<table>`, the
  breakdown is `dl > div > dt/dd`, every section is `aria-labelledby` its own `h2`, heading order
  is h1 → h2 → h3, no złoty literal appears in the file, and the only zero amount is inside
  `#zus-blok` in the same sentence as its condition. Contrast checked by hand: `muted #475569` on
  `tint-yellow #FFE29A` is 6.0:1 (AA), the row rule at `border-strong #64748B` on the same surface
  is 3.8:1.
- **`src/routes/o-nas/+page.svelte`.** Section renders unconditionally with its `id`, `tabindex`
  and `scroll-margin-top: 96px`; each block is keyed by position; the empty state is the inherited
  panel; the first two tiles are eager and the rest lazy.
- **`src/lib/components/Footer.svelte`, `KeyFacts.svelte`, `Header.svelte`, `src/lib/nav.ts`,
  `svelte.config.js`.** The footer shortcuts repoint to real fragments and `#dojazd` exists on
  `/kontakt` with matching treatment. `KeyFacts` re-keys by index, which is the correct fix now
  that two labels are editor-adjacent. The nav breakpoint moves cleanly from 768px to 1024px in
  both directions. `KNOWN_FUTURE_ROUTES` and its tolerance branch are fully removed.
- **`src/lib/components/admin/Przycisk.svelte`.** The new `wylaczone` prop is correctly separated
  from `zajete` so `aria-busy` is not set on a permanently unavailable control. The 0.7 opacity on
  a disabled secondary button computes to about 3.2:1 against the warm item surface, which is below
  4.5:1 but is exempt under WCAG 1.4.3 („inactive user interface component") and is what
  05-UI-SPEC's interaction table specifies. Not a finding.
- **`src/lib/components/admin/PowtarzalnaGrupa.svelte`.** Reordering, the cap and the empty note
  are genuinely opt-in; a mount passing none of the nine new props renders as before. The
  `przenoszenie` all-or-nothing derived makes a half-configured mount inexpressible. Focus after a
  move goes to the button that performed it, with the documented fallback, in both the
  server-attribute and the hydrated path. At most one `autofocus` is ever emitted.
- **RODO.** No form submission, editor handle or submitted value is logged on any path in the
  changed files. The only `console.warn` calls are build-time/reader diagnostics carrying no
  personal data.
- **Adapter and platform rules.** No `import.meta.env` in `src/`; every secret read goes through
  `platform?.env`; no `static/admin/`; no `/functions`; no `tailwind.config.js`.
- **Polish-only.** No English visitor-facing or panel-facing string was found in the changed files.
  Identifiers, comments and JSON keys are out of scope for that rule.
- **Emoji / em dash / en dash.** None found in new copy. The en dash appears only in the numeric
  range `6:30–16:30`; day abbreviations use a plain hyphen.
- **`npm run check`** run against the current tree: 4403 files, 0 errors, 0 warnings.

## Deliberately not reported

The five items listed in the review brief as known and accepted (the double asterisk on required
panel fields, the Playwright load flake, the `'/dojazd'` grep false positive, GAL-3/GAL-10 recorded
as unproven, and the placeholder opening hours) were verified as still matching their descriptions
and are excluded.

---

_Reviewed: 2026-08-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
