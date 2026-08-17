# Phase 5: Gallery & Fees - Pattern Map

**Mapped:** 2026-08-17
**Files analyzed:** 46 (24 new, 22 modified)
**Analogs found:** 39 / 46 (7 have NO analog and are named explicitly in §No Analog Found)

> Sources: `05-CONTEXT.md` (decisions D-01..D-37), `05-RESEARCH.md` (corrections C-1..C-4,
> §Recommended Project Structure, §Validation Architecture), `05-UI-SPEC.md` (Contracts 1..12).
> Every excerpt below was read out of the working tree on 2026-08-17. Prefer symbol names over
> line numbers when quoting these into a plan: `05-CONTEXT.md` records that four previously
> cited line ranges had already drifted.

---

## File Classification

### Public half

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/routes/cennik/+page.svelte` | route (page) | build-time render | `src/routes/rekrutacja/+page.svelte` | exact |
| `src/routes/cennik/+page.server.ts` (if needed) | route (load) | build-time read | `src/routes/dokumenty/+page.server.ts` | exact |
| `src/lib/content/cennik.json` | data store | file-I/O (panel-written) | `src/lib/content/o-nas.json`, `nabor.json` | exact |
| `src/lib/content/galeria.json` | data store | file-I/O (panel-written) | `src/lib/content/o-nas.json` (`obiekt_zdjecia`) | exact |
| `src/lib/content/w-skrocie.json` | data store | file-I/O (panel-written) | `src/lib/content/day-plan.json` | exact |
| `src/lib/content/cennik.ts` | content module | static | `src/lib/content/rekrutacja.ts` | exact |
| cennik reader (`$lib`) | reader | transform, guard-and-degrade | `src/lib/server/aktualnosci.ts` `postFromEntry` | role-match |
| galeria reader (`$lib`) | reader | transform, guard-and-degrade | `postFromEntry` + `/o-nas/+page.svelte:26-40` glob filter | exact |
| w-skrocie reader (`$lib`) | reader | transform, fallback-to-defaults | `postFromEntry` | role-match |
| `src/lib/kwoty.ts` | utility | pure transform | `src/lib/liczebniki.ts` | exact (shape), **new** (algorithm) |
| `src/lib/godziny.ts` | utility | pure compose | `src/lib/liczebniki.ts` header idiom | role-match |
| `src/lib/zdjecia-nazwy.ts` (optional) | utility | lookup | `/o-nas/+page.svelte:26-36` + `uploads.ts` `istniejaceNazwy` | exact |
| `src/lib/components/Lightbox.svelte` | component (island) | event-driven, client state | `src/lib/components/MobileNav.svelte` | exact |
| `src/routes/o-nas/+page.svelte` | route (page) | build-time render | itself (section 6 replaced) | in-place |
| `src/routes/kontakt/+page.svelte` | route (page) | build-time render | the `#galeria` anchor treatment in this phase | sibling |
| `src/lib/components/KeyFacts.svelte` | component | props render | `DayPlan.svelte` (index re-key) | exact |
| `src/lib/components/Footer.svelte` | component | props render | itself | in-place |
| `src/lib/nav.ts` | config | static | itself | in-place |
| `src/lib/content/site.ts`, `rekrutacja.ts` | content module | static → typed read | `src/lib/content/rekrutacja.ts` header | in-place |
| `svelte.config.js` | config | build | itself | in-place |

### Panel half

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/routes/admin/cennik/+page.server.ts` | route (actions) | request-response + external write | `src/routes/admin/nabor/+page.server.ts` | exact |
| `src/routes/admin/w-skrocie/+page.server.ts` | route (actions) | request-response + external write | `src/routes/admin/nabor/+page.server.ts` | exact |
| `src/routes/admin/galeria/+page.server.ts` | route (actions) | request-response + external write | `src/routes/admin/o-nas/+page.server.ts` (photo half) | exact |
| `src/routes/admin/cennik/+page.svelte` | route (form UI) | request-response | `src/routes/admin/o-nas/+page.svelte` (summary + enhance) | exact |
| `src/routes/admin/w-skrocie/+page.svelte` | route (form UI) | request-response | `src/routes/admin/o-nas/+page.svelte` | role-match (fixed arity is new) |
| `src/routes/admin/galeria/+page.svelte` | route (form UI) | request-response | `src/routes/admin/o-nas/+page.svelte:352-398` photo group | exact |
| `src/lib/server/admin/walidacja/cennik.ts` | validator | transform + refuse | `walidacja/nabor.ts` (allowlist) + `pola.ts` `liczbaWZakresie` | partial (cross-field is new) |
| `src/lib/server/admin/walidacja/galeria.ts` | validator | transform + refuse | `walidacja/o-nas.ts:241-339` two-pass name reservation | exact |
| `src/lib/server/admin/walidacja/w-skrocie.ts` | validator | transform + refuse | `walidacja/nabor.ts` | role-match |
| `src/lib/server/admin/uploads.ts` (extend) | service | file naming/ownership | `uploads.ts:158-237` (`PREFIKS_O_NAS` block) | exact |
| `src/lib/pola-strony.ts` (extend) | wire vocabulary | shared boundary | itself (`wartosciONas`, `ZadanieFokusu`) | in-place |
| `src/lib/components/admin/PowtarzalnaGrupa.svelte` (extend) | component | request-response | itself | in-place |
| `src/lib/content/panel.ts` (extend) | copy module | static | itself (`KOPIA_EKRAN_O_NAS`, `POLA_O_NAS`) | in-place |
| `PanelNawigacja.svelte`, `admin/+layout.server.ts`, `admin/+page.svelte` | enumeration surfaces | static | themselves | in-place |
| `docs/instrukcja-cms.md`, `src/lib/assets/uploads/README.md` | docs | static | themselves | in-place |

### Tests

| New File | Role | Closest Analog | Match |
|---|---|---|---|
| `tests/kwoty.unit.ts` | unit | `tests/liczebniki.unit.ts` + `admin-walidacja-nabor.unit.ts` byte pin | exact |
| `tests/cennik-reader.unit.ts` | unit | `tests/aktualnosci-reader.unit.ts` | exact |
| `tests/admin-walidacja-{cennik,galeria,w-skrocie}.unit.ts` | unit | `tests/admin-walidacja-nabor.unit.ts` / `-strony.unit.ts` | exact |
| `tests/cennik.spec.ts` | e2e | `tests/rekrutacja.spec.ts`, `tests/dokumenty.spec.ts` | role-match |
| `tests/galeria.spec.ts` | e2e + a11y | `tests/o-nas.spec.ts`, `tests/nav.spec.ts:87-108` | **partial — see §No Analog** |
| `tests/admin-{cennik,galeria,w-skrocie}.spec.ts` | e2e (auth) | `tests/admin-strony.spec.ts` + `tests/fixtures/admin.ts` | exact |
| `tests/admin-enumeracja.spec.ts` | e2e (meta) | none | **no analog** |

---

## Pattern Assignments

### `src/routes/cennik/+page.svelte` (route, build-time render)

**Analog:** `src/routes/rekrutacja/+page.svelte`

**Module-header idiom** (`rekrutacja/+page.svelte:1-35`) — every new public route in this repo
opens with a comment naming the requirements, the UI-SPEC amendment it implements, the island
count, and the content rules it exists to honour. Copy the shape, including the last paragraph:

```svelte
// Rekrutacja page (RECRUIT-01, RECRUIT-02, ...; D-01, D-06, D-14, D-15, D-18).
// Composition per 01-UI-SPEC Amendment v1.6 §7 ...
//
// Static, zero-JavaScript content with exactly ONE hydrated island: the zgłoszenie
// form. The site-wide static-output flag is set once in src/routes/+layout.ts and is
// deliberately NOT restated here; its literal name is grep-banned in this file
// (acceptance gate for this plan), so it is described rather than written.
//
// The layout owns <main>, so this route adds no wrapper landmark and no heading
// above its own h1.
//
// Every fact is interpolated from the content modules: no address, room, office
// hours, telephone number, e-mail, amount or point value is written as a literal
// anywhere in this file, including in the head metadata below.
```

Note for `/cennik`: it is **zero-island**, so the second paragraph shortens; and the last
paragraph is load-bearing — every złoty figure must be interpolated from the cennik store.

**Imports + Seo pattern** (`rekrutacja/+page.svelte:35-53`):

```svelte
import Seo from '$lib/components/Seo.svelte';
import { BIP_ZLOBEK, KRYTERIA, OPLATY, PROCEDURA, WNIOSKI_PUSTE } from '$lib/content/rekrutacja';
import type { PageData } from './$types';
let { data }: { data: PageData } = $props();
</script>

<Seo
  title="Rekrutacja: Publiczny Żłobek w Stromcu"
  description="..."
  canonical="/rekrutacja"
/>

<header class="page-head">
  <div class="inner uklad-naglowka">
    <div class="intro">
      <h1>Rekrutacja do żłobka</h1>
      <p class="lead">...</p>
```

`prerender = true` is **not** restated: it is inherited from `src/routes/+layout.ts`.
`Cta`, `Wave`, `SkipLink`, `Header`, `Footer` are direct reuse (`05-UI-SPEC` Contract 3).

**Load pattern** (`src/routes/dokumenty/+page.server.ts`, whole file — the smallest correct shape):

```ts
// Build-time load for /dokumenty (DOCS-01). prerender = true is inherited from
// +layout.ts, so this runs once at build (never at runtime) ...
import type { PageServerLoad } from './$types';
import { groupDokumenty, readDokumenty } from '$lib/server/dokumenty';

export const load: PageServerLoad = () => {
  return { grupy: groupDokumenty(readDokumenty()) };
};
```

`/cennik` may not need a `+page.server.ts` at all if its reader is a plain `$lib` import (the
cennik reader must be `$lib`, not `$lib/server`, because `/admin/cennik` echoes formatted
amounts too). Decide once and state it; do not create an empty load.

---

### `src/lib/kwoty.ts` (utility, pure transform)

**Analog:** `src/lib/liczebniki.ts` — for the *file shape*, not the algorithm.

**Header idiom that records the boundary and the rejected stdlib** (`liczebniki.ts:1-17`):

```ts
/** Polish noun declension after a number.
 *  ...
 *  This lives in $lib (never $lib/server) because both the public pages and the
 *  editorial panel print counts, and the panel runs in the Cloudflare Worker
 *  where node built-ins are unavailable. No Intl.PluralRules: it would pull a
 *  locale dependency for a rule that is four lines, and it returns category
 *  names rather than the words, which we would still have to map by hand.
 */
```

`kwoty.ts` owes the identical two sentences with `Intl.NumberFormat` in place of
`Intl.PluralRules`, plus the C-2 evidence (default emits `"1500"`; `useGrouping:'always'`
emits U+00A0 where the shipped byte is U+0020).

**Guard-the-shape idiom** (`liczebniki.ts:31-37`) — the same reasoning applies to an
editor-saved amount:

```ts
// Guard the shape rather than trusting the caller: these counts come from
// editor-saved JSON, so a hand-edited "6.5", a negative or a NaN must not pick
// a form that reads as a confident lie.
if (!Number.isInteger(liczba) || liczba < 0) return formy.dopelniacz;
```

**Algorithm:** no analog. `05-RESEARCH.md` §Code Examples supplies the hand-rolled
`grupujTysiace` / `zlote` pair; treat that as the spec.

---

### The three readers (transform, guard-and-degrade)

**Analog:** `src/lib/server/aktualnosci.ts` `postFromEntry` — the matured precedent.
Note the *location* differs: `postFromEntry` is under `$lib/server/`; this phase's readers
must be in `$lib` (the `$lib/server` boundary is recorded three times, see below).

**The four rules, verbatim from `aktualnosci.ts:84-158`:**

```ts
/*  `entry` is typed `unknown` on purpose. The PostEntry compile-time shape is a
 *  lie for git-CMS content that staff hand-edit and partially commit, and three
 *  successive crash shapes reached production behind that lie. Typing the
 *  parameter `unknown` makes the compiler enforce a guard on every field, and the
 *  result is CONSTRUCTED key by key (never spread from the raw entry) so nothing
 *  unvalidated can leak through. */
export function postFromEntry(path: string, entry: unknown): PostWithMeta | null {
  // A post JSON holding null, an array, a bare string or a number would throw on
  // the first property access, before any field guard could run (T-03-07-04).
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    console.warn(`aktualnosci: skipping "${path}" (entry is not a JSON object)`);
    return null;
  }
  const record = entry as Record<string, unknown>;
  const tytul = readString(record.tytul);
  if (!tytul) { console.warn(...); return null; }
  ...
  // Constructed key by key from guarded locals only — never `...entry`, which is
  // how unvalidated fields survived two prior fixes (T-03-07-03).
  return { tytul, data: parsed.iso, ..., placeholder: record.placeholder === true };
}
```

**The narrowing primitive to copy verbatim** (`aktualnosci.ts:75-82`):

```ts
/** Return `value` when it is a string with non-whitespace content, otherwise
 *  undefined. Returns the ORIGINAL string, never the trimmed one ... This is the
 *  single narrowing primitive of the reader: every field postFromEntry emits
 *  passes through it. */
function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}
```

**Per-store degradation (from `05-RESEARCH.md` Pattern 4, restated so the planner does not
re-derive it):** `galeria.json` drops an entry whose `plik` is not in the glob; `cennik.json`
hides the breakdown when the payable amount would be negative; `w-skrocie.json` falls back to
code-authored defaults with a build warning.

**The glob + basename filter to copy rather than re-derive** (`src/routes/o-nas/+page.svelte:26-40`):

```ts
// Statically-analyzable glob: keys are absolute file paths, values are processed
// enhanced-img Picture objects. Map by final path segment (basename) for lookup.
const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
  query: { enhanced: true }, eager: true, import: 'default'
});
const byName: Record<string, Picture> = {};
for (const [path, mod] of Object.entries(uploads)) {
  const base = path.split('/').pop();
  if (base) byName[base] = mod;
}
const facility = onas.obiekt_zdjecia
  .map((item) => ({ alt: item.alt, pic: byName[item.plik.split('/').pop() ?? item.plik] }))
  .filter((item): item is { alt: string; pic: Picture } => Boolean(item.pic));
```

This exact block is what `05-UI-SPEC` Contract 2's "the lightbox can never open onto nothing"
rests on. It is duplicated in three files today (`/o-nas/+page.svelte`, `uploads.ts`
`istniejaceNazwy`, and one more); `05-UI-SPEC` §Discretion says extract it into
`src/lib/zdjecia-nazwy.ts` rather than make it four.

---

### `src/lib/components/Lightbox.svelte` (component, island, event-driven)

**Analog:** `src/lib/components/MobileNav.svelte` — read in full; every excerpt below is
transposable line for line.

**Reduced-motion duration as a function** (`MobileNav.svelte:29-33`):

```ts
/** Slide/fade duration: 0 (instant) when the user prefers reduced motion. */
function motionMs(): number {
  if (typeof window === 'undefined') return 0;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DRAWER_MS;
}
```

**Scroll lock + focus, with the restore in the effect CLEANUP** (`MobileNav.svelte:42-53`).
This is the "effect owns its own lifetime" shape: doing the restore in an `onclick` means
Escape and scrim-click each need their own restore and one will be forgotten.

```ts
// While open: lock body scroll and move focus to the close button. On close
// (effect cleanup): release the scroll lock and restore focus to the hamburger.
$effect(() => {
  if (!open) return;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  closeBtnEl?.focus();
  return () => {
    document.body.style.overflow = previousOverflow;
    hamburgerEl?.focus();
  };
});
```

**Bounded focus trap + Escape, one handler on the dialog** (`MobileNav.svelte:55-80`):

```ts
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { event.preventDefault(); closeDrawer(); return; }
  if (event.key !== 'Tab' || !dialogEl) return;
  // Bounded focus trap over the drawer's focusable elements.
  const focusables = Array.from(
    dialogEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
  ).filter((el) => el.tabIndex !== -1);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
}
```

**Scrim: the two `svelte-ignore` comments are mandatory** (`MobileNav.svelte:95-113`). Without
them `npm run check` fails at pre-commit on `a11y_click_events_have_key_events` and
`a11y_no_static_element_interactions` (Pitfall 8):

```svelte
{#if open}
  <!-- Scrim: mouse-dismiss convenience. Keyboard users dismiss via the close
       button (first focus) or ESC, so the static element carries no keyboard
       handler by design. -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="scrim" transition:fade={{ duration: motionMs() }} onclick={closeDrawer}></div>

  <div bind:this={dialogEl} id={DRAWER_ID} class="drawer"
       role="dialog" aria-modal="true" aria-label="Menu nawigacyjne" tabindex="-1"
       transition:fly={{ x: 320, duration: motionMs() }} onkeydown={handleKeydown}>
```

**Reduced-motion belt-and-braces in CSS as well as JS** (`MobileNav.svelte:230-237`):

```css
/* Explicit instant show/hide when reduced motion is requested (the JS duration
   is already 0; this also neutralises any inherited transition on the panel). */
@media (prefers-reduced-motion: reduce) {
  .scrim, .drawer { transition: none; }
}
```

**Delta for the lightbox** (`05-UI-SPEC` Contract 2, not present in `MobileNav`): the trigger is
an `<a href={pic.img.src}>` and the click interception is narrow (plain primary click, no
modifier); `aria-labelledby` points at the caption element rather than a literal `aria-label`;
the motion is an opacity fade only, never a `fly`.

---

### `src/lib/components/KeyFacts.svelte` (component, edit)

**Analog for the re-key:** `src/lib/components/DayPlan.svelte:30-34` and
`src/routes/o-nas/+page.svelte:77-81` — both already key by position. `KeyFacts.svelte:20` is
`{#each keyFacts as fact (fact.label)}`, keyed by a value an editor can now type; a duplicated
key throws in production. Follow the two existing fixes verbatim.

The icon/tint stay code-authored as a fixed four-slot table zipped with the stored strings
(`05-UI-SPEC` Contract 7), which deletes D-32's runtime-fallback requirement rather than
guarding it. Say so in the plan.

---

### `src/routes/admin/cennik/+page.server.ts` and `.../w-skrocie/+page.server.ts` (route, actions)

**Analog:** `src/routes/admin/nabor/+page.server.ts` — 129 lines, the complete singleton template.

**Header idiom (the four standing rules every panel route restates)** (`nabor/+page.server.ts:1-23`):

```ts
// THE WHOLE SEQUENCE IS: validate, serialize, save, redirect. Everything expensive lives
// behind everything cheap ...
//
// D-10 IS FREE HERE ... the SHA the editor's browser carries in a hidden field is the state
// the form was built from ... a forged value can only make the save FAIL, never make it
// overwrite more, because GitHub itself enforces the ref update with force false.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare ... so its name is grep-banned across server code.
//
// Nothing here logs. Not the editor handle, not the submitted state, not on the error path.
```

**Load** (`nabor/+page.server.ts:53-66`):

```ts
export const load: PageServerLoad = async ({ platform, url }) => {
  return {
    /** Current committed value, read from the same import the public page consumes. */
    stan: stanZWartosci(nabor.otwarty),
    /** Undefined when the head could not be read. That degrades to „save without the
     *  conflict check" rather than to „this screen will not open". */
    sha: await aktualnyShaGlowy(platform?.env),
    /** POST then redirect then GET: the success panel is driven by a query marker on a
     *  fresh GET, never by an action return. */
    zapisano: url.searchParams.get('zapisano') === '1'
  };
};
```

**Save action: the three refusal branches, in this order** (`nabor/+page.server.ts:68-128`):

```ts
const wynik = walidujNabor(surowy);
if (!wynik.ok) {
  return fail(400, {
    stan: stanZWartosci(nabor.otwarty),
    bladStanu: wynik.pola[POLE_STAN],
    panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
    panelTresc: KOPIA_WALIDACJA.podsumowanieTresc
  } satisfies WynikNaboru);
}
const zapis = await zapiszTresc({
  env: platform?.env, uchwyt: locals.editor, zakres: ZAKRES,
  opis: ...,
  // Serialized HERE, by the caller, which is what makes an unvalidated save
  // inexpressible in zapiszTresc's signature.
  pliki: [{ sciezka: SCIEZKA_NABOR, tresc: serializujJson(wynik.dane) }],
  oczekiwanySha: typeof oczekiwanySha === 'string' && oczekiwanySha.length > 0 ? oczekiwanySha : undefined
});
if (zapis.stan === 'konflikt') {
  return fail(409, { stan: wybrany, panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
                     panelTresc: KOPIA_ZAPIS.konfliktTresc, konflikt: true });
}
if (zapis.stan === 'blad') {
  // The missing-binding detail zapiszTresc may carry is deliberately NOT rendered.
  return fail(500, { stan: wybrany, panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
                     panelTresc: KOPIA_ZAPIS.bladTresc });
}
// 303 rather than 302, so the browser turns the POST into a GET.
redirect(303, '/admin/nabor?zapisano=1');
```

**Result-shape idiom** (`nabor/+page.server.ts:36-51`): one flat exported interface
(`WynikNaboru`) that every branch satisfies with `satisfies`, documented field by field.
`/admin/cennik` and `/admin/w-skrocie` each need their own equivalent.

**Caveat:** `nabor` uses a `default` action because it has exactly one. Both new singleton
screens have a save plus (for w-skrócie, none; for cennik, none) — if either grows a second
action, switch to **named actions only**, per `pola-strony.ts:76-79`: "SvelteKit forbids mixing
the two on one page, so the save is named here as well."

---

### `src/routes/admin/galeria/+page.server.ts` (route, actions, repeated group + files)

**Analog:** `src/routes/admin/o-nas/+page.server.ts` — its photo half moves wholesale.

**Header rules that transfer verbatim** (`o-nas/+page.server.ts:1-34`):

```ts
// FOUR OF THE FIVE ACTIONS BELOW NEVER TOUCH GIT. The two add and the two remove actions
// read what was typed, change the LENGTH of one list and render the form again. They mint
// no token, they call no orchestrator, they write no blob and they produce no Cloudflare
// build (P-26). Only `zapisz` writes ...
//
// THE JSON AND EVERY PENDING PICTURE TRAVEL IN ONE TREE (D-07). Two commits would be two
// builds, roughly four minutes, and a window in which the page lists a photograph nobody
// can load.
//
// NAMED ACTIONS ONLY, INCLUDING THE SAVE ...
//
// THE HEAD SHA TRAVELS IN THE FORM, not in whatever the load last read (D-10). Adding a
// wartość is a round trip, the load runs again on the way back, and taking the fresh answer
// would quietly move the conflict baseline forward.
//
// STAFF NEVER TYPE A FILENAME (D-14, P-25).
```

**The echo-from-file loader, including the bare-basename rule** (`o-nas/+page.server.ts:88-112`):

```ts
zdjecia: oNas.obiekt_zdjecia.map((zdjecie) => ({
  // A BARE BASENAME (P-20), even if a hand-edited file stored a path: the island
  // renders its preview by looking the name up in the same by-name map the public
  // page uses, and the hidden field carries this value back so a save that changes
  // only a sentence keeps the picture.
  plik: zdjecie.plik.split('/').pop() ?? '',
  alt: zdjecie.alt,
  // Nothing is pending and nothing is removed on a fresh load.
  dane: '', usunieto: false
})),
```

**Add / remove action pair — the exact template the two NEW move actions extend**
(`o-nas/+page.server.ts:167-200`):

```ts
dodajZdjecie: async ({ request }) => {
  const dane = await request.formData();
  const wartosci = wartosciONas(dane);
  wartosci.zdjecia.push({ plik: '', alt: '', dane: '', usunieto: false });
  const numer = wartosci.zdjecia.length;
  return { wartosci, pola: {}, statusZdjec: dodanoWiersz(numer),
           zadanieZdjec: { cel: 'element', indeks: numer - 1 } satisfies ZadanieFokusu,
           sha: shaZFormularza(dane) } satisfies WynikONasEkranu;
},

usunZdjecie: async ({ request }) => {
  const dane = await request.formData();
  const wartosci = wartosciONas(dane);
  // Bounded against the set that ARRIVED (T-04.1-34).
  const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.zdjecia.length);
  if (indeks === null) return { wartosci, pola: {}, sha: shaZFormularza(dane) };
  wartosci.zdjecia.splice(indeks, 1);
  return { wartosci, pola: {}, statusZdjec: usunietoWiersz(indeks + 1),
           zadanieZdjec: { cel: 'dodaj' } satisfies ZadanieFokusu,
           sha: shaZFormularza(dane) };
},
```

`05-RESEARCH.md` §Pattern 3 supplies the `przeniesWGore` shape derived from this. Reuse
`indeksZadania` unchanged.

**One file list, one call, JSON first** (`o-nas/+page.server.ts:225-237`):

```ts
// ONE FILE LIST, ONE CALL. The JSON goes FIRST, so a person reading the commit sees
// the page before its pictures.
const pliki: PlikDoZapisu[] = [
  { sciezka: SCIEZKA, tresc: serializujJson(wynik.dane) },
  ...wynik.zdjecia.map((zdjecie) => ({
    sciezka: sciezkaOkladki(zdjecie.nazwa),
    // PASSED THROUGH UNCHANGED. The browser produced this encoding ... nothing on the
    // server reads, decodes or re-encodes it.
    tresc: zdjecie.base64, base64: true
  }))
];
```

**Deletion set, and the reason the two seed files survive** (`o-nas/+page.server.ts:239-252`):

```ts
// A picture leaves the repository in the SAME commit that stops pointing at it ...
// `zdjecieONasDoUsuniecia` ... refuses any name the panel did not generate, because both
// pictures placed here by hand are rendered by a seeded aktualność as well.
const nadalUzywane = [
  ...wynik.dane.obiekt_zdjecia.map((z) => z.plik),
  ...readAktualnosci().map((wpis) => wpis.obraz)
];
const usun: string[] = [];
for (const stare of oNas.obiekt_zdjecia) {
  const doUsuniecia = zdjecieONasDoUsuniecia(stare.plik, nadalUzywane);
  if (doUsuniecia !== null && !usun.includes(doUsuniecia)) usun.push(doUsuniecia);
}
```

**Validator called with the build's existing names, from the ROUTE not the validator**
(`o-nas/+page.server.ts:209-214`):

```ts
// The names this build already carries. Read HERE rather than inside the validator,
// which keeps that module pure and every naming branch drivable under a plain test
// runner. The answer is the LAST BUILD, which is safe in this direction.
const wynik = walidujONas(dane, istniejaceNazwy());
```

---

### `src/routes/admin/galeria/+page.svelte` (route, form UI)

**Analog:** `src/routes/admin/o-nas/+page.svelte`.

**Fixed DOM order (Contract 5)** — stated in that file's header at `:1-16` and it is the
acceptance shape for all three new screens:

> back link, h1, save-result region, validation summary region, required-fields note,
> field groups, save row. Nothing is inserted before either of the two regions that receive focus.

**Validation-summary anchors — the WCAG 2.4.4 contract** (`o-nas/+page.svelte:142-155`):

```ts
wartosci.zdjecia.forEach((_, indeks) => {
  // Both picture refusals point at the file control and the description at its own
  // field: a summary entry linking to a control that is not on the screen would
  // announce nothing at all.
  const wyspa = idWyspyZdjecia(indeks);
  for (const [pole, cel] of [
    [POLE_DANYCH, `${wyspa}-plik`],
    [POLE_PLIKU,  `${wyspa}-plik`],
    [POLE_ALTU,   `${wyspa}-alt`]
  ] as const) {
    const komunikat = pola[nazwaPola(PREFIKS_ZDJECIA, indeks, pole)];
    if (komunikat === undefined) continue;
    wpisy.push({ cel, tekst: bladWElemencie(legendaZdjecia(indeks + 1), komunikat) });
  }
});
```

The gallery adds a fourth row for `podpis` → `${wyspa}-podpis` (or its own control id).

**Summary render + `use:enhance` with `reset: false`** (`o-nas/+page.svelte:183-215`):

```svelte
{#if podsumowanie.length > 0}
  <ul>
    {#each podsumowanie as wpis (wpis.cel)}
      <li><a href="#{wpis.cel}">{wpis.tekst}</a></li>
    {/each}
  </ul>
{:else if form.konflikt}
  <p><a href={page.url.pathname}>{KOPIA_ZAPIS.konfliktAkcja}</a></p>
{/if}

<form method="POST" action={AKCJA_ZAPISU} novalidate
  use:enhance={() => {
    zapisywanie = true;
    return async ({ update }) => {
      // See the module header: without this the four list actions would wipe the form.
      await update({ reset: false });
      zapisywanie = false;
    };
  }}>
```

**Photo group mount, `wlasnaRamka` + island props** (`o-nas/+page.svelte:352-398`) — copy this
block and add `podpis`, `limit`, `akcjaWGore`, `akcjaWDol`:

```svelte
<!-- The photo list. `wlasnaRamka` because the island IS the item's fieldset and carries
     the numbered legend: two nested fieldsets would announce two groups for one
     picture. The island is MOUNTED here, never rewritten. -->
<PowtarzalnaGrupa
  id={PREFIKS_ZDJECIA}
  legenda={POLA_O_NAS.zdjeciaLegenda}
  ile={wartosci.zdjecia.length}
  etykietaElementu={legendaZdjecia}
  akcjaDodania={AKCJA_DODANIA_ZDJECIA}
  akcjaUsuniecia={AKCJA_USUNIECIA_ZDJECIA}
  etykietaDodania={KOPIA_ZAPIS.dodajZdjecie}
  etykietaUsuniecia={KOPIA_ZAPIS.usunZdjecie}
  nazwaIndeksu={POLE_INDEKSU}
  nota={KOPIA_ZAPIS.notaGrupy}
  status={form?.statusZdjec ?? ''}
  zadanie={form?.zadanieZdjec}
  wlasnaRamka
>
  {#snippet element(indeks)}
    <ZdjecieIsland
      id={idWyspyZdjecia(indeks)}
      legenda={legendaZdjecia(indeks + 1)}
      proporcja={PROPORCJA_O_NAS}
      komunikatGotowe={KOPIA_ZDJECIA.gotowe43}
      nazwaZdjecia={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_DANYCH)}
      nazwaUsuniecia={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_USUNIECIA)}
      nazwaObrazu={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_PLIKU)}
      nazwaAltu={nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_ALTU)}
      obraz={wartosci.zdjecia[indeks].plik}
      usunieto={wartosci.zdjecia[indeks].usunieto}
      zdjecie={wartosci.zdjecia[indeks].dane}
      alt={wartosci.zdjecia[indeks].alt}
      blad={pola[nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_DANYCH)] ??
            pola[nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_PLIKU)]}
      bladAltu={pola[nazwaPola(PREFIKS_ZDJECIA, indeks, POLE_ALTU)]}
      autofokus={form?.zadanieZdjec?.cel === 'element' && form.zadanieZdjec.indeks === indeks}
    />
  {/snippet}
</PowtarzalnaGrupa>
```

`PROPORCJA_O_NAS` is 4:3 and is used **unchanged** (D-24) — the ratio is a prop precisely so a
later plan mounts the same island.

---

### `src/lib/components/admin/PowtarzalnaGrupa.svelte` (extend: reorder + cap)

**Analog:** itself. The regression surface, verified (`05-RESEARCH.md` C-1) — **three mount
sites across two files**, not four screens:

```
src/routes/admin/o-nas/+page.svelte:254      (wartości,  else-branch fieldset)
src/routes/admin/o-nas/+page.svelte:359      (zdjęcia,   wlasnaRamka -> div.element)
src/routes/admin/plan-dnia/+page.svelte:161  (wiersze,   else-branch fieldset)
```

**The branch split the move buttons must join on BOTH sides** (`PowtarzalnaGrupa.svelte:141-174`):

```svelte
{#each indeksy as indeks (indeks)}
  {#if wlasnaRamka}
    <div class="element">
      {@render element(indeks)}
      <div class="usun">
        <Przycisk wariant="secondary" formaction={akcjaUsuniecia}
                  nazwa={nazwaIndeksu} wartosc={String(indeks)}>
          <span class="etykieta-usun">{etykietaUsuniecia}</span>
        </Przycisk>
      </div>
    </div>
  {:else}
    <fieldset class="element">
      <legend class="legenda-elementu">{etykietaElementu(indeks + 1)}</legend>
      ... same remove block ...
    </fieldset>
  {/if}
{/each}
```

The gallery is the **`{#if wlasnaRamka}` branch**. Pitfall 1: editing only the visually obvious
`{:else}` fieldset ships a gallery with no reorder controls and gives two unrelated screens
controls they were never meant to have.

**The focus effect and the selector that excludes buttons** (`PowtarzalnaGrupa.svelte:109-132`):

```ts
/** The controls an editor can land in. The hidden fields the photo island carries are
 *  excluded by construction ... */
const WYBIERALNE = 'input:not([type="hidden"]), select, textarea';

$effect(() => {
  // Read as a whole so a new answer re-runs this even when it names the same destination.
  const cel = zadanie;
  if (cel === undefined) return;
  if (cel.cel === 'dodaj') { przyciskDodania?.querySelector('button')?.focus(); return; }
  // By POSITION, which is the same identity every other part of this pattern uses.
  const karty = korzen?.querySelectorAll('.element');
  const kontrolka = karty?.[cel.indeks]?.querySelector(WYBIERALNE);
  if (kontrolka instanceof HTMLElement) kontrolka.focus();
});
```

Pitfall 2: `WYBIERALNE` excludes `<button>` by construction, so a third `ZadanieFokusu` variant
plus a matching effect branch is required to focus the move button at its new position.

**The header paragraph that must be REWRITTEN, not left** (`PowtarzalnaGrupa.svelte:37-40`):

```
// REORDERING IS OUT OF SCOPE for this phase, in both directions and in every list that
// uses this component: no dragging, no up and down buttons. Items are authored in order
// and an editor who wants a different order retypes. This sentence is here because the
// contract asks for it to be written down where somebody would otherwise add it.
```

**The props idiom to extend** (`PowtarzalnaGrupa.svelte:50-101`): every prop is documented with
*why*, and `wlasnaRamka = false` is the existing precedent for an opt-in prop whose default
renders today's markup byte-identically. New props follow that form.

---

### `src/lib/pola-strony.ts` (extend: wire vocabulary)

**Analog:** itself. This module is the fifth recording of the client/server boundary; the new
echo shapes and the two new action names belong here, not in the validators.

**The boundary header idiom every new `$lib` vocabulary module owes** (`pola-strony.ts:1-30`,
echoed at `zdjecia.ts:1-18` and `stan-naboru.ts:1-22`):

```
// WHY IT IS NOT INSIDE THE VALIDATORS. The fifth occurrence in this phase of the boundary
// src/lib/stan-naboru.ts, src/lib/daty.ts, src/lib/zdjecia.ts ... each record: the
// validators live under src/lib/server/, and SvelteKit refuses at build time to bundle that
// directory into client code. The page rendering a repeated row has to emit the identical
// control names the action reads back, and a rename that only half landed would post one
// name to an action reading another ...
//
// This module carries NO visible string: nothing here is ever rendered to an editor. The
// Polish labels and hints live in src/lib/content/panel.ts and are swept by
// tests/admin-copy.unit.ts.
//
// Pure: no I/O, no clock, no framework import. Safe on both sides of the boundary.
```

**Action-name constants** (`pola-strony.ts:76-85`) — `AKCJA_PRZENIESIENIA_W_GORE` /
`_W_DOL` and the three new screens' add/remove names join this block:

```ts
/** Names of the add and remove actions, so the page's `formaction` and the action table in
 *  the route cannot drift apart. Named actions rather than a default one: SvelteKit
 *  forbids mixing the two on one page, so the save is named here as well. */
export const AKCJA_ZAPISU = '?/zapisz';
export const AKCJA_DODANIA_ZDJECIA = '?/dodajZdjecie';
export const AKCJA_USUNIECIA_ZDJECIA = '?/usunZdjecie';
```

**Echo shape + collector** (`pola-strony.ts:177-252`) — the gallery needs a **separate**
`ZdjecieGaleriiEcha` with `podpis`, leaving `ZdjecieEcha` untouched (Open Question 3):

```ts
/** One facility photo, same contract. `usunieto` is echoed rather than inferred from an
 *  emptied basename: a refused save that forgot it would republish the picture on the next
 *  attempt, or leave the file behind with nothing pointing at it. */
export interface ZdjecieEcha { plik: string; alt: string; dane: string; usunieto: boolean; }

zdjecia: zbierzIndeksowane(zrodlo, PREFIKS_ZDJECIA,
    [POLE_PLIKU, POLE_ALTU, POLE_DANYCH, POLE_USUNIECIA]).map((zdjecie) => ({
  plik: tekst(zdjecie[POLE_PLIKU]),
  alt: tekst(zdjecie[POLE_ALTU]),
  dane: tekst(zdjecie[POLE_DANYCH]),
  usunieto: tekst(zdjecie[POLE_USUNIECIA]).length > 0
})),
```

**Index bounding — reused unchanged by the move actions** (`pola-strony.ts:254-261`):

```ts
/** The position a remove button asked for, or null. Read through the same bounds the
 *  collector uses, so an index outside the group can only ever mean „remove nothing". */
export function indeksZadania(surowy: unknown, ile: number): number | null {
  if (typeof surowy !== 'string') return null;
  if (!/^[0-9]{1,3}$/.test(surowy.trim())) return null;
  const indeks = Number.parseInt(surowy.trim(), 10);
  return indeks >= 0 && indeks < ile ? indeks : null;
}
```

**`ZadanieFokusu` — the union that needs a third variant** (`pola-strony.ts:263-273`):

```ts
/*  A FRESH OBJECT PER RESPONSE, which is what lets the group component tell one answer
 *  from the next ... */
export type ZadanieFokusu =
  | { cel: 'element'; indeks: number }
  | { cel: 'dodaj' };
```

**`MAKS_ELEMENTOW = 30` stays where it is** (`pola-strony.ts:87-96`) — it is a *work* bound on
every repeated group. The twelve-photo cap is a **new editorial bound** and belongs beside the
gallery vocabulary, not here (D-23).

---

### `src/lib/server/admin/walidacja/cennik.ts` (validator)

**Analog for the allowlist discipline:** `walidacja/nabor.ts` (43 lines, read in full).

```ts
// One boolean, and it still gets a validator of its own, because the value this reads
// is UNTRUSTED INPUT even though the person who sent it is authenticated. It travels
// from a form field into a JSON file, into a commit on a public repository and onto
// the front page a parent reads. An allowlist of exactly two literals is what keeps
// anything else out of that chain ...
//
// Pure and dependency-free apart from the shared readers and the copy module: no
// fetch, no I/O, no clock. Nothing here logs.

/**
 * An absent field is a failure rather than a default. Defaulting would mean a request
 * that simply omitted the control silently closed the nabór, which is a state change
 * nobody asked for and which a parent would see on the front page within two minutes.
 */
export function walidujNabor(surowy: unknown): WynikPol<NaborDane> {
  if (surowy === STAN_OTWARTY) return { ok: true, dane: { otwarty: true } };
  if (surowy === STAN_ZAMKNIETY) return { ok: true, dane: { otwarty: false } };
  return { ok: false, pola: { [POLE_STAN]: KOPIA_WALIDACJA.stanNaboruBrak } };
}
```

**Note the relative `.ts` import paths** (`nabor.ts:13-15`) — mandatory, because the unit suites
load these modules directly under bare `node --test` where `$lib` does not resolve:

```ts
import { KOPIA_WALIDACJA } from '../../../content/panel.ts';
import { POLE_STAN, ... } from '../../../stan-naboru.ts';
import type { WynikPol } from './pola.ts';
```

**Analog for the numeric field:** `walidacja/pola.ts:101-115` — and it is the *only* numeric
validator, so it establishes the four-digit / whole-złoty bound D-28 relies on:

```ts
/** Base-ten integer inside an inclusive range. The digit shape is checked BEFORE the
 *  parse, because `Number.parseInt` accepts „12abc" and returns 12 ... */
export function liczbaWZakresie(surowy: unknown, min: number, maks: number): number | null {
  ...
  const przyciety = surowy.trim();
  if (!/^[0-9]{1,4}$/.test(przyciety)) return null;
  ...
}
```

**No analog for the cross-field invariant** `0 <= obnizka < stawka`, nor for the
conditional-zero rule (an empty `zus` refuses the save). Both are hand-written. See §No Analog.

---

### `src/lib/server/admin/walidacja/galeria.ts` and `uploads.ts` (extend)

**Analog:** `src/lib/server/admin/uploads.ts:141-237` — the `PREFIKS_O_NAS` block, to be
reproduced (not referenced) for `galeria-`.

**Why the prefix is an ownership marker, not decoration** (`uploads.ts:141-156`):

```
// THE PREFIX DOES TWO JOBS ... It keeps the uploads directory readable, which is the reason
// P-25 gives; and it is the marker that says „the panel generated this name for the o nas
// page", which is what makes the deletion rule below safe ... both pictures currently in
// this directory were placed by hand and are rendered by BOTH the o nas page and a seeded
// aktualność, so a deletion rule that only asked „does anything else point at this name"
// would eventually remove a file a public page renders.
```

**Two-pass name reservation** (`uploads.ts:170-205`):

```ts
export function nazwaZdjeciaONas(alt: string, zajete: ReadonlySet<string>): string {
  const rdzen = slugAscii(alt, MAKS_RDZENIA_O_NAS) || RDZEN_ZAPASOWY;
  const podstawa = `${PREFIKS_O_NAS}${rdzen}`;
  if (!zajete.has(`${podstawa}${ROZSZERZENIE}`)) return `${podstawa}${ROZSZERZENIE}`;
  // From two, because the unsuffixed name IS the first one. Bounded by the group size the
  // form can post, so this cannot spin.
  for (let numer = 2; numer < 1000; numer++) {
    const kandydat = `${podstawa}-${numer}${ROZSZERZENIE}`;
    if (!zajete.has(kandydat)) return kandydat;
  }
  return `${podstawa}-1000${ROZSZERZENIE}`;
}
```

`zajete` is "the basenames already in the build PLUS the ones handed out earlier in the same
submission" — that is the two-pass part, and `walidacja/o-nas.ts:241-339` (~100 lines) is where
it is orchestrated. The gallery reproduces that branch.

**Four-condition ownership rule** (`uploads.ts:206-237`):

```ts
export function zdjecieONasDoUsuniecia(
  plik: string,
  nadalUzywane: readonly (string | undefined)[],
  // Injected exactly as it is for a cover, so the whole decision is drivable under a plain
  // test runner with no build and no browser.
  istniejace: ReadonlySet<string> = istniejaceNazwy()
): string | null {
  const nazwa = bezpiecznaNazwaOkladki(plik.split('/').pop());
  if (nazwa === null) return null;
  if (!nazwa.startsWith(PREFIKS_O_NAS)) return null;
  const uzywana = nadalUzywane.some((inny) => inny !== undefined && inny.endsWith(nazwa));
  if (uzywana) return null;
  if (!istniejace.has(nazwa)) return null;
  return sciezkaOkladki(nazwa);
}
```

The four conditions and their doc comment (prefix / admissible basename / nothing else points
at it / present in the build) transfer verbatim with `PREFIKS_GALERII`. This is what makes
GAL-10 ("hand-placed `sala-zabaw.jpg` is never deleted") true by construction.

---

### Tests

**Authenticated panel fixture** — every new `tests/admin-*.spec.ts` imports this instead of
walking the login flow (`tests/fixtures/admin.ts`, whole file is the analog):

```ts
import { test, expect } from './fixtures/admin';  // NOT from '@playwright/test'
// ...
export const test = base.extend<{ zalogowany: Zalogowany }>({
  zalogowany: async ({ context }, use) => {
    const token = await tokenSesji();
    await context.addCookies([{ name: NAZWA_CIASTKA, value: token,
      // OBSERVED, not assumed: passing `url: 'http://localhost:4173'` here is refused ...
      domain: 'localhost', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
    // Fail LOUDLY rather than silently running the whole spec unauthenticated.
    ...
  }
});
```

Secrets are **read out of the `preview:test` script**, never retyped (`fixtures/admin.ts:30-46`).

**`javaScriptEnabled: false` context** — an established pattern in five panel specs
(`admin-strony:105`, `admin-zdjecia:318`, `admin-nabor:240`, `admin-dokumenty:372`,
`admin-aktualnosci:576`). Use it for GAL-5 (the no-JS tile href) and GAL-7 (reorder without
scripting).

**Byte-for-byte serialization pin** — every panel-written store owes one
(`tests/admin-walidacja-nabor.unit.ts:160-190`):

```ts
test('zserializowany wynik walidatora jest bajt w bajt tym, co lezy w repozytorium', () => {
  // The panel serializes the validator's OUTPUT ... Read from disk rather than imported,
  // because an import would compare parsed values and would not see an indent, a key
  // order or a missing trailing newline: precisely the differences that break
  // `prettier --check .` and therefore block every local commit (D-09).
  const naDysku = readFileSync(SCIEZKA_NABOR, 'utf8');
  // Drive the validator from the state the file CURRENTLY holds, never from a fixed
  // literal: the flag is editor-owned since 04.1 ... What is pinned here is the BYTE
  // SHAPE (indent, key order, trailing newline).
  const wynik = walidujNabor(stanZWartosci(JSON.parse(naDysku).otwarty));
  assert.equal(serializujJson(wynik.dane), naDysku);
});

test('sciezka, ktora panel zapisuje, wskazuje na istniejacy plik naboru', () => {
  // A save that writes a path nothing reads would report success to the editor, produce
  // a real commit and a real Cloudflare build, and change nothing a parent can see.
  assert.equal(SCIEZKA_ZAPISU, 'src/lib/content/nabor.json');
  assert.doesNotThrow(() => readFileSync(`${KORZEN}${SCIEZKA_ZAPISU}`, 'utf8'));
});
```

**Reader-resilience unit suite** — the analog for `tests/cennik-reader.unit.ts`
(`tests/aktualnosci-reader.unit.ts:1-38`):

```ts
// Reader-resilience unit test (WR-02 proof). Pins the type guards ... so that removing
// either the typeof guard or the day-range check turns this suite red. Uses Node's
// built-in runner (no new dependency). Intentionally named *.unit.ts so Playwright's
// spec|test matcher never collects it. The compile-time type is a deliberate lie here:
// these objects simulate malformed hand-edited on-disk JSON.

// The exact key set a returned post may expose, pre-sorted. This is a key-set
// equality on purpose: it is the durable proof that postFromEntry CONSTRUCTS its
// result from guarded locals. Reintroducing an object-spread of the raw on-disk
// entry leaks unknown keys and turns this red (T-03-07-03).
const EXPECTED_POST_KEYS = ['data', 'dataDisplay', 'excerpt', ...];
```

---

## Shared Patterns

### 1. The `$lib` vs `$lib/server` boundary
**Sources:** `src/lib/zdjecia.ts:1-18`, `src/lib/stan-naboru.ts:1-22`, `src/lib/pola-strony.ts:1-30`,
`src/lib/liczebniki.ts:12-16` (four recordings, not three).
**Apply to:** `kwoty.ts`, `godziny.ts`, `zdjecia-nazwy.ts`, the three readers, the new wire
vocabulary, the KeyFacts allowlist.
Rule: SvelteKit refuses at build time to bundle `src/lib/server/` into client code; anything both
halves need lives in `src/lib/`. Each such module opens with a header stating *why it is not in
the server module*, notes it carries **no visible string** (copy lives in `panel.ts`), and ends
with "Pure: no I/O, no clock ... Safe on both sides of the boundary."

### 2. Copy lives only in `src/lib/content/panel.ts`, and every export joins the sweep
**Source:** `src/lib/content/panel.ts:16-25`, sweep at `tests/admin-copy.unit.ts:101-151, 212-215`.
**Apply to:** every new panel screen's labels, hints, validation messages, commit descriptions.

```
// EVERY NEW EXPORT MUST BE ADDED TO THE SWEEP LIST IN tests/admin-copy.unit.ts.
// An export that is missing from that list silently escapes the emoji, em dash and
// English chrome contract ... That suite counts the module's exports, so a forgotten
// entry turns it red rather than passing quietly.
//
// Values that vary at render time are exported as FUNCTIONS taking the value ...
// The relative `.ts` import path convention of that module applies here too.
```

```ts
test('lista zamiatanych eksportow obejmuje wszystkie eksporty modulu', () => {
  assert.equal(EKSPORTY.length, Object.keys(panel).length);
});
```
Caveat (`05-RESEARCH.md` Pitfall 6): this assertion lives in the **unrun** E5 tier.

### 3. Panel enumeration surfaces — the lockstep edit, located precisely
Each new screen (`/admin/galeria`, `/admin/cennik`, `/admin/w-skrocie`) must be added to **all**
of these in one commit:

| # | Surface | File | Anchor |
|---|---|---|---|
| 1 | `NAWIGACJA` (7 → 9; w-skrócie is pulpit-only per D-34) | `src/lib/content/panel.ts:44-52` | `Object.freeze([...])`, "Labels only: the route each one points at is wiring, not copy" |
| 2 | `SCIEZKI`, index-aligned | `src/lib/components/admin/PanelNawigacja.svelte:30-40` | `const pozycje = NAWIGACJA.map((etykieta, i) => ({ etykieta, href: SCIEZKI[i] }))` — no length check; a mismatch yields an `undefined` href |
| 3 | `SEKCJE` page-title map | `src/routes/admin/+layout.server.ts` | `const SEKCJE: Record<string,string> = { '': 'Pulpit', ..., pomoc: 'Pomoc' }`; unknown segment silently degrades to `'Panel redakcyjny'` |
| 4 | Pulpit cards (6 → 9), **written out, not looped** | `src/routes/admin/+page.svelte:9-13, 30-56` | `<KafelPulpitu cel="/admin/nabor" tytul={...} opis={...} stan={obecnieNabor(...)} />`; the header explains why a loop was rejected |
| 5 | `TRASY` Polish-only sweep (**14 → 17**) | `tests/admin-polski.spec.ts:76-91` | `const TRASY: readonly { nazwa: string; sciezka: string }[] = [...]` — the **only enforced** gate of the seven |
| 6 | `EKSPORTY` copy sweep | `tests/admin-copy.unit.ts:101-151` + count at `:212-215` | unrun tier |
| 7 | `docs/instrukcja-cms.md` (§2 six tiles, §5 photos on O nas, §7 facility photos all become false) | gated by `tests/instrukcja.unit.ts:115-138, 158-238` | unrun tier |

`05-RESEARCH.md` recommends `tests/admin-enumeracja.spec.ts` to convert surfaces 1-5 into one
enforced check. There is no analog for it (below).

### 4. Panel save-path plumbing (do not re-derive)
**Sources:** `src/lib/server/admin/zapis.ts` (`aktualnyShaGlowy`, `zapiszTresc`),
`serializuj.ts:33-35`, `src/routes/admin/+layout.server.ts` + `src/hooks.server.ts` (auth by
inheritance), `admin/+layout.ts:12` (prerender opt-out).
**Apply to:** all three new panel routes. A new route under `/admin` needs **no** auth wiring.
All panel output is `JSON.stringify(dane, null, '\t') + '\n'`, and `src/lib/content/` is
deliberately not in `.prettierignore` — hand-author every seed tab-indented with a trailing
newline (Pitfall 7).

### 5. Public route composition
**Sources:** `Seo`, `Cta`, `Wave`, `SkipLink`, `Header`, `Footer`; `src/routes/+layout.ts`
(single `prerender = true`); `src/routes/+layout.svelte` owns `<main>`.
**Apply to:** `/cennik`. No route restates the prerender flag; no route adds a second `<main>`.

### 6. Tests interpolate, never retype — with one deliberate exception
**Sources:** `tests/fixtures/admin.ts:30-46` (reads bindings out of `package.json`),
`tests/admin-polski.spec.ts:62-73` (reads slugs off disk),
`tests/admin-walidacja-nabor.unit.ts:167-173` (drives the validator from the file's current state).
**Exception:** `tests/home.spec.ts:106-119` retypes the four tile strings. `05-CONTEXT.md`
records that this asymmetry is now a design decision the plan must make **per surface**:
interpolated assertions go blind once an editor owns the value; retyped ones break on any
reformatting. For `/cennik` the answer is the arithmetic + scoped-zero pair in
`05-RESEARCH.md` §Code Examples (blind to the stored values by construction).

---

## No Analog Found

The planner must use `05-RESEARCH.md` §Code Examples / `05-UI-SPEC` contracts for these, not a
weak local match. A named absence is more useful than a misleading one.

| File / capability | Role | Data Flow | Why there is no analog |
|---|---|---|---|
| `tests/galeria.spec.ts` — **axe scan with an overlay OPEN** | test | a11y | `AxeBuilder` is called in **twelve** spec files and every call runs against a page in a load-time state. None scans an open overlay. `nav.spec.ts:87-108` proves `MobileNav`'s dialog role, first focus, Escape and focus restore but runs **no** axe scan while open. First of its kind in the project (assumption A2: axe may flag a non-`inert` background) |
| `tests/galeria.spec.ts` — **Tab-boundedness assertion** | test | keyboard | No spec in the repository presses Tab to test a trap. `nav.spec.ts` never does. The implementation precedent exists (`MobileNav.svelte:61-80`); the *evidence* precedent does not |
| `tests/galeria.spec.ts` — `emulateMedia({ reducedMotion: 'reduce' })` | test | media query | `grep -rn "emulateMedia\|reducedMotion" tests/` returns nothing. New capability for this project (assumption A1) |
| `tests/admin-enumeracja.spec.ts` | test (meta) | filesystem enumeration | Nothing in the repository asserts that a hand-maintained list covers the routes that exist. `TRASY`, `SCIEZKI`, `SEKCJE` and the pulpit are all unchecked for completeness |
| Cross-field numeric invariant (`0 <= obnizka < stawka`) | validator | transform | `liczbaWZakresie` (`pola.ts:101-115`) is the repository's **only** numeric validator and takes an independent per-field min/max. It cannot express a relationship between two fields |
| Save-time conditional-zero rule (a zero figure may occur only inside the string carrying the ZUS condition) | validator | transform | No validator anywhere inspects one field's content against another's. `tests/rekrutacja.spec.ts:183` is a *render*-time regex and is explicitly **not** reusable: it forbids any zero in `.fee-box`, while `/cennik` deliberately renders one |
| A **fixed-arity** panel screen (`/admin/w-skrocie`: exactly four tiles, no add, no remove, two read-only) | route (form UI) | request-response | Every existing panel screen is either a singleton scalar form (`nabor`) or a `PowtarzalnaGrupa` list. A read-only tile rendered as **text plus a hint plus a link** (never a `disabled` input, `05-UI-SPEC` Contract 11) has no precedent |
| Hand-rolled thousands grouping | utility | pure transform | `liczebniki.ts` supplies the file shape and the anti-`Intl` reasoning, but no grouping code exists. `05-RESEARCH.md` §Code Examples is the spec |

Partial-analog warnings (a match exists but is weaker than it looks):

- **`tests/cennik.spec.ts` ← `tests/rekrutacja.spec.ts`.** Reuse the file *structure* only. `:183`'s
  no-zero regex must be rewritten as the scoped pair, and `:178` is co-presence, not adjacency.
- **`/admin/w-skrocie` ← `admin/nabor/+page.server.ts`.** The plumbing transfers exactly; the
  screen's *shape* (fixed arity, computed and locked fields) does not.

---

## Metadata

**Analog search scope:** `src/lib/`, `src/lib/components/`, `src/lib/components/admin/`,
`src/lib/content/`, `src/lib/server/`, `src/lib/server/admin/walidacja/`, `src/routes/`,
`src/routes/admin/`, `tests/`, `tests/fixtures/`.
**Files read in full:** `admin/nabor/+page.server.ts`, `admin/o-nas/+page.server.ts`,
`server/aktualnosci.ts`, `components/MobileNav.svelte`, `components/admin/PowtarzalnaGrupa.svelte`,
`lib/liczebniki.ts`, `lib/pola-strony.ts`, `walidacja/nabor.ts`, `tests/fixtures/admin.ts`,
`admin/+layout.server.ts`, `lib/nav.ts`, `dokumenty/+page.server.ts`, `rekrutacja/+page.server.ts`.
**Files read in targeted ranges:** `admin/o-nas/+page.svelte`, `rekrutacja/+page.svelte`,
`o-nas/+page.svelte`, `uploads.ts`, `walidacja/pola.ts`, `content/panel.ts`,
`PanelNawigacja.svelte`, `admin/+page.svelte`, `admin-polski.spec.ts`, `admin-copy.unit.ts`,
`admin-walidacja-nabor.unit.ts`, `aktualnosci-reader.unit.ts`, `zdjecia.ts`, `stan-naboru.ts`.
**Pattern extraction date:** 2026-08-17
