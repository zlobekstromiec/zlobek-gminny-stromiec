---
phase: quick-260814-hwf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/assets/brand/logo-full.png
  - src/lib/assets/brand/logo-mark.png
  - static/favicon.png
  - static/apple-touch-icon.png
  - new-logo.png
  - src/lib/components/Header.svelte
  - src/lib/components/Footer.svelte
  - src/lib/components/Seo.svelte
  - src/routes/+page.svelte
  - src/routes/+error.svelte
  - src/routes/aktualnosci/+page.svelte
  - src/routes/o-nas/+page.svelte
  - src/routes/dokumenty/+page.svelte
  - src/routes/polityka-prywatnosci/+page.svelte
  - src/routes/deklaracja-dostepnosci/+page.svelte
  - static/site.webmanifest
  - src/lib/content/o-nas.json
  - src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json
  - static/admin/index.html
  - static/admin/config.yml
  - docs/instrukcja-cms.md
  - docs/dev-env.md
  - .claude/CLAUDE.md
  - tests/home.spec.ts
autonomous: true
requirements: [SITE-03, SITE-04, SITE-06]

must_haves:
  truths:
    - "Every visitor-facing surface (header, footer, page titles, meta descriptions, 404, manifest) names the institution 'Publiczny Żłobek w Stromcu', correctly declined for its grammatical case."
    - "The header tagline under the wordmark reads 'Jednostka organizacyjna Gminy Stromiec'."
    - "The header emblem and footer lockup are cut from the corrected artwork, so the rendered wordmark image matches the rendered wordmark text."
    - "The browser tab icon and the iOS home-screen icon are regenerated from the corrected emblem."
    - "Generic lowercase żłobek phrasing with no locality (post titles, day-plan copy, statut document title) is unchanged, and no identifier (package name, repo slug, deployment hostname, post slug, BIP URL, contact address) is touched."
    - "The full local gate suite is green, including the Playwright home-title assertion updated to the new name."
  artifacts:
    - "src/lib/assets/brand/logo-full.png (alpha-trimmed corrected lockup)"
    - "src/lib/assets/brand/logo-mark.png (alpha-trimmed emblem only, roughly square)"
    - "static/favicon.png (512x512 transparent) and static/apple-touch-icon.png (180x180 white plate)"
    - "Updated Header.svelte, Footer.svelte, Seo.svelte, five route pages, +error.svelte, site.webmanifest"
    - "Updated content seeds o-nas.json and 2026-07-15-witamy-na-nowej-stronie-zlobka.json"
    - "Updated static/admin/index.html, static/admin/config.yml, docs/instrukcja-cms.md, docs/dev-env.md, .claude/CLAUDE.md, tests/home.spec.ts"
  key_links:
    - "Header.svelte and Footer.svelte already import logo-mark.png?enhanced and logo-full.png?enhanced, so overwriting the two PNGs in place swaps the artwork with no component change."
    - "Seo.svelte siteName feeds every page title and og:site_name, so one edit there propagates across all prerendered routes."
    - "tests/home.spec.ts:166 asserts the document title and is the only hard test breaker; tests/aktualnosci.spec.ts:100 already asserts the new genitive form and must stay green."
    - "static/ is prettier-ignored, so site.webmanifest and static/admin/* keep their existing indentation and are never reformatted."
---

<objective>
Rename the institution to its official name, "Publiczny Żłobek w Stromcu", on every shipped surface, and swap in the corrected logo artwork whose wordmark carries that same name.

Purpose: the site currently ships an incorrect institution name in the header, footer, every page title and meta description, the web manifest, the CMS admin chrome, the docs, and the logo artwork itself. The client supplied corrected artwork (`new-logo.png` at the repo root) whose wordmark reads the official name, so the text and the artwork must change together or the two will contradict each other on screen.
Output: regenerated brand assets and favicons, renamed text across components, routes, meta, manifest, content seeds, admin chrome, docs and one test assertion, with all identifiers and all generic lowercase żłobek phrasing left untouched.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./.claude/CLAUDE.md
@.planning/quick/260814-6n1-implement-new-brand-logo-across-header-f/260814-6n1-SUMMARY.md

@src/lib/components/Header.svelte
@src/lib/components/Footer.svelte
@src/lib/components/Seo.svelte
</context>

<naming_contract>

**This block is the single source of truth for the rename. It is a lookup table, not a search-and-replace pattern. A global `sed`, a global `grep -rl | xargs sed -i`, or any editor-wide replace is FORBIDDEN in this task: every edit is made at the explicit file and line listed in Task 2 and Task 3.**

<!-- planner-discipline-allow: Żłobek Gminny -->
<!-- planner-discipline-allow: Żłobka Gminnego -->
<!-- planner-discipline-allow: żłobkiem gminnym -->
<!-- planner-discipline-allow: żłobku gminnym -->

## Official name

`Publiczny Żłobek w Stromcu`

## Header tagline

`Jednostka organizacyjna Gminy Stromiec`

## Declension guide (verbatim, do not paraphrase)

- Żłobek Gminny Stromiec / Żłobek Gminny w Stromcu (nominative) -> Publiczny Żłobek w Stromcu
- Żłobka Gminnego w Stromcu (genitive) -> Publicznego Żłobka w Stromcu
- (w) żłobku gminnym w Stromcu (locative, lowercase) -> (w) Publicznym Żłobku w Stromcu
- Poznaj żłobek gminny w Stromcu (accusative) -> Poznaj Publiczny Żłobek w Stromcu

## DO NOT TOUCH: generic lowercase phrasing (verbatim list)

Generic lowercase "żłobek/żłobka/żłobku" phrases with no locality stay untouched:

- "Nasz dzień w żłobku"
- "z życia żłobka"
- "Poznaj żłobek"
- post titles "Wielkie otwarcie żłobka…" and "Witamy na nowej stronie żłobka"
- the statut-zlobka document title

## DO NOT TOUCH: identifiers (verbatim list)

Identifiers stay untouched:

- `package.json` name
- repo/org `zlobekstromiec/zlobek-gminny-stromiec`
- `*.pages.dev` and `workers.dev` URLs
- post slugs (including the filename `2026-07-15-witamy-na-nowej-stronie-zlobka.json`)
- the BIP URL
- `zlobek@ugstromiec.pl`

## Copy rules

No emoji. No em dashes anywhere (en dash only in numeric ranges). Applies to every string authored in this task.

</naming_contract>

<tasks>

<task type="auto">
  <name>Task 1: Regenerate brand assets and favicons from the corrected artwork</name>
  <files>src/lib/assets/brand/logo-full.png, src/lib/assets/brand/logo-mark.png, static/favicon.png, static/apple-touch-icon.png, new-logo.png</files>
  <action>
Source: `new-logo.png` at the repo root, 1672x941 RGBA with a transparent background; its wordmark reads the official name from `<naming_contract>`.

Write a THROWAWAY sharp script in the session scratchpad directory. It must never be created inside the repo and must never be committed. Reuse the technique proven in `260814-6n1-SUMMARY.md` and honour its three recorded deviations, which apply identically here:

1. `sharp .trim()` is a NO-OP on this family of delivered files. The nominally empty regions carry faint alpha noise (values 1 to 4) and the top-left pixel is not alpha 0, so exact-match trim returns the input unchanged and silently yields an untrimmed slab. Compute the alpha bounding box yourself from raw pixel data, treating alpha at or below 8 as empty.
2. Node module resolution walks up from the SCRIPT's directory, so a script in the scratchpad never reaches the repo `node_modules`. The script must `process.chdir()` to the repo root and import sharp by absolute path at `node_modules/sharp/dist/index.mjs` (the package exposes no `lib/index.js`).
3. Derive the emblem boundary from a per-column alpha scan, never from a guessed extract width. On this source the emblem plus its rays span roughly x 0 to 780 and there is an empty alpha gap before the first wordmark glyph at around x 790, but confirm the real empty-column range by scanning and cut there.

Produce four outputs, overwriting the existing files in place:

- `src/lib/assets/brand/logo-full.png` — the whole lockup, alpha-trimmed.
- `src/lib/assets/brand/logo-mark.png` — the left emblem region only, alpha-trimmed.
- `static/favicon.png` — 512x512, transparent background, emblem centered.
- `static/apple-touch-icon.png` — 180x180, opaque white plate, emblem inset to about 80 percent.

Then open BOTH regenerated brand PNGs with the Read tool and inspect them visually before finishing the task. `logo-mark.png` must show the complete circle with all rays intact and carry no fragment of a wordmark glyph. `logo-full.png` must show the full wordmark with no clipped glyph on any edge. If either fails, adjust the cut columns and regenerate; do not proceed with a bad crop.

Finally remove the source with plain `rm new-logo.png`. It is untracked, so `git rm` will fail. Leave `logo.png`, `logo-bg.png` if present, and the design zips at the repo root untouched and untracked.

No component edits are needed for the swap: `Header.svelte` and `Footer.svelte` already import these two paths.

Stage this commit by explicit path only. Never use `git add -A` or `git add .` here: the repo root holds untracked client deliverables that must stay out of git.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs');const d=p=>{const b=fs.readFileSync(p);return[b.readUInt32BE(16),b.readUInt32BE(20)]};const[fw,fh]=d('src/lib/assets/brand/logo-full.png');const[mw,mh]=d('src/lib/assets/brand/logo-mark.png');const[vw,vh]=d('static/favicon.png');const[aw,ah]=d('static/apple-touch-icon.png');const r=fw/fh,mr=mw/mh;const fail=[];if(!(r>1.4))fail.push('logo-full not a wide lockup, ratio '+r.toFixed(3));if(!(mr>0.7&&mr<1.35))fail.push('logo-mark not roughly square, ratio '+mr.toFixed(3));if(!(fw<1672&&fh<941))fail.push('logo-full not trimmed, still '+fw+'x'+fh);if(vw!==512||vh!==512)fail.push('favicon '+vw+'x'+vh);if(aw!==180||ah!==180)fail.push('apple-touch-icon '+aw+'x'+ah);if(fs.existsSync('new-logo.png'))fail.push('new-logo.png still present');if(fail.length){console.error(fail.join('; '));process.exit(1)}console.log('assets ok',fw+'x'+fh,mw+'x'+mh)"</automated>
    <automated>npm run build</automated>
  </verify>
  <done>All four assets regenerated from the corrected artwork with sane trimmed dimensions, both brand PNGs visually confirmed by Read (complete emblem with no wordmark fragment, full wordmark with no clipped glyph), `new-logo.png` removed from the repo root, `npm run build` exits 0, and `git status` shows no newly tracked root-level deliverable.</done>
</task>

<task type="auto">
  <name>Task 2: Rename the institution across components, SEO meta and the web manifest</name>
  <files>src/lib/components/Header.svelte, src/lib/components/Footer.svelte, src/lib/components/Seo.svelte, src/routes/+page.svelte, src/routes/aktualnosci/+page.svelte, src/routes/o-nas/+page.svelte, src/routes/dokumenty/+page.svelte, src/routes/+error.svelte, src/routes/polityka-prywatnosci/+page.svelte, src/routes/deklaracja-dostepnosci/+page.svelte, static/site.webmanifest</files>
  <action>
Apply the rename at each explicit location below, choosing the case-correct form from the declension guide in `<naming_contract>`. Read each file before editing and confirm the target string is on or near the cited line; line numbers are a locator, not a guarantee. Edit only the cited strings. Do not restructure markup, do not reflow surrounding copy, do not touch any identifier from the DO-NOT-TOUCH lists.

Components:
- `src/lib/components/Header.svelte:31-32` — set the institution name to the official nominative name, and set the tagline to `Jednostka organizacyjna Gminy Stromiec`. Keep the existing two-line wordmark markup structure intact so the link's accessible name stays the wordmark text.
- `src/lib/components/Footer.svelte:20` — wordmark to the official nominative name.
- `src/lib/components/Footer.svelte:22` — organisation line to `Publiczny Żłobek w Stromcu, jednostka organizacyjna Gminy Stromiec`.
- `src/lib/components/Footer.svelte:85` — copyright line to `© Publiczny Żłobek w Stromcu`.

SEO and meta:
- `src/lib/components/Seo.svelte:28` — `siteName` to `'Publiczny Żłobek w Stromcu'`. This single value feeds every page title suffix and `og:site_name`.
- `src/routes/+page.svelte:29-30` — title and description, nominative.
- `src/routes/aktualnosci/+page.svelte:20-21` — title nominative; the description uses the GENITIVE form from the declension guide.
- `src/routes/o-nas/+page.svelte:46-47` — title nominative; the description uses the ACCUSATIVE form from the declension guide (the "Poznaj …" construction).
- `src/routes/dokumenty/+page.svelte:20-21` — title nominative; the description uses the GENITIVE form.
- `src/routes/+error.svelte:16` — the title suffix, nominative.
- `src/routes/polityka-prywatnosci/+page.svelte:10` and `src/routes/deklaracja-dostepnosci/+page.svelte:10` — these are raw `svelte:head` titles that bypass Seo.svelte, so they need their own edit.

Web manifest (`static/site.webmanifest`):
- line 2 `name` to `Publiczny Żłobek w Stromcu`.
- line 5 `description` to `Publiczny Żłobek w Stromcu, jednostka organizacyjna Gminy Stromiec.` — note this drops the existing em dash, per the copy rules in `<naming_contract>`.
- `short_name` is unchanged.
- `/static/` is prettier-ignored, so preserve the file's existing 2-space indentation exactly. Do not run a formatter over it.
  </action>
  <verify>
    <automated>npm run check</automated>
    <automated>npm run lint</automated>
    <automated>grep -rlF 'Publiczny Żłobek w Stromcu' src/lib/components/Header.svelte src/lib/components/Footer.svelte src/lib/components/Seo.svelte src/routes/+page.svelte src/routes/aktualnosci/+page.svelte src/routes/o-nas/+page.svelte src/routes/dokumenty/+page.svelte src/routes/+error.svelte src/routes/polityka-prywatnosci/+page.svelte src/routes/deklaracja-dostepnosci/+page.svelte static/site.webmanifest | wc -l | grep -qx ' *11' && echo 'all 11 surfaces renamed'</automated>
    <automated>grep -qF 'Jednostka organizacyjna Gminy Stromiec' src/lib/components/Header.svelte && echo 'tagline ok'</automated>
    <automated>node -e "const t=require('fs').readFileSync('static/site.webmanifest','utf8');if(!/^  \"/m.test(t)){console.error('manifest lost its 2-space indent');process.exit(1)}JSON.parse(t);console.log('manifest ok')"</automated>
  </verify>
  <done>All eleven component, route, meta and manifest surfaces carry the official name in the correct grammatical case; the header tagline reads the new organisational line; `npm run check` reports 0 errors and 0 warnings; `npm run lint` is clean; the manifest still parses as JSON and still uses 2-space indentation.</done>
</task>

<task type="auto">
  <name>Task 3: Rename content seeds, admin chrome, docs and the home title assertion, then run the full gate suite</name>
  <files>src/lib/content/o-nas.json, src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json, static/admin/index.html, static/admin/config.yml, docs/instrukcja-cms.md, docs/dev-env.md, .claude/CLAUDE.md, tests/home.spec.ts</files>
  <action>
Content seeds (CMS-editable, tab-indented JSON — preserve tabs, these files are NOT prettier-ignored and the pre-commit hook enforces tabs):
- `src/lib/content/o-nas.json:3` — `lead` becomes the accusative construction, i.e. it opens `Poznaj Publiczny Żłobek w Stromcu:` and keeps the rest of the existing sentence unchanged.
- `src/lib/content/o-nas.json:4` — `misja` opens with the LOCATIVE form, i.e. `W Publicznym Żłobku w Stromcu otaczamy…`, keeping the rest of the sentence unchanged.
- `src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json:4-5` — the GENITIVE form `Publicznego Żłobka w Stromcu`. The post title itself uses generic lowercase phrasing and is on the DO-NOT-TOUCH list, and the slug and filename are unchanged.

Admin chrome:
- `static/admin/index.html:7` — `Panel redakcyjny: Publiczny Żłobek w Stromcu`.
- `static/admin/config.yml:1` — update the header comment to the official name. `app_title` on line 15 STAYS as it is.
- Both files live under `/static/`, which is prettier-ignored: preserve existing indentation and do not reformat.

Docs:
- `docs/instrukcja-cms.md:3` — subtitle.
- `docs/dev-env.md:1` — heading.
- `.claude/CLAUDE.md:1` — heading; and line 6, the prose name mention. Identifiers elsewhere in that file (repo slug, org, hostnames, contact address) are unchanged.

Test:
- `tests/home.spec.ts:166` — update the title assertion to match the new name, i.e. `toHaveTitle(/Publiczny Żłobek w Stromcu/)`. This is the only hard breaker. `tests/aktualnosci.spec.ts:100` already asserts the correct genitive form and must keep passing without edits: if it fails, the seed rename in this task was done wrong, so fix the seed rather than the assertion.

Then run the full gate suite listed in `<verify>` and confirm the negative grep returns zero hits across `src/`, `static/`, `tests/` and `docs/`.

Record two carry-forward notes in the SUMMARY so the orchestrator can log them as STATE.md concerns:
1. `static/og-placeholder.png` still renders the old branding and needs regeneration in Phase 6.
2. The renamed strings in `src/lib/content/o-nas.json` and the aktualnosci seed are CMS-editable, so staff editing through `/admin` could overwrite them.
  </action>
  <verify>
    <automated>npm run check &amp;&amp; npm run lint &amp;&amp; npm run test:unit</automated>
    <automated>npm run build</automated>
    <automated>npm run test</automated>
    <automated>if grep -rEi 'Żłobek Gminny|Żłobka Gminnego|żłobkiem gminnym|żłobku gminnym' src/ static/ tests/ docs/; then echo 'FAIL: stale institution name still present'; exit 1; else echo 'grep gate clean'; fi</automated>
    <automated>node -e "const fs=require('fs');for(const p of ['src/lib/content/o-nas.json','src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json']){const t=fs.readFileSync(p,'utf8');JSON.parse(t);if(!/^\t/m.test(t)){console.error(p+' lost tab indentation');process.exit(1)}}console.log('seeds ok')"</automated>
    <automated>node -e "const fs=require('fs');const f=['src/lib/content/aktualnosci/2026-07-15-witamy-na-nowej-stronie-zlobka.json','static/admin/config.yml','package.json'];if(!fs.existsSync(f[0])){console.error('post slug filename changed');process.exit(1)}if(!/app_title/.test(fs.readFileSync(f[1],'utf8'))){console.error('config.yml app_title removed');process.exit(1)}console.log(JSON.parse(fs.readFileSync(f[2],'utf8')).name)"</automated>
  </verify>
  <done>Content seeds, admin chrome, docs and the home title assertion all carry the correctly declined official name; `npm run check`, `npm run lint`, `npm run test:unit`, `npm run build` and `npm run test` are all green, with `tests/aktualnosci.spec.ts` passing unedited; the negative grep across src/ static/ tests/ docs/ returns zero hits; both JSON seeds still parse and still use tab indentation; the post filename, `config.yml` `app_title` and the package name are unchanged; the two carry-forward notes are recorded in the SUMMARY.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client-delivered binary -> repo | `new-logo.png` is an untrusted third-party file decoded and re-encoded into shipped assets |
| repo root working dir -> git index | untracked client deliverables (concept sheet, design zips) sit next to the files being committed |
| CMS (staff) -> content seeds | the renamed strings in `src/lib/content/*.json` are editable through `/admin` |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-QHWF-01 | Tampering | `new-logo.png` -> `src/lib/assets/brand/*`, `static/favicon.png`, `static/apple-touch-icon.png` | medium | mitigate | Every shipped asset is a sharp decode plus re-encode of the delivered file (no byte passthrough of unknown ancillary chunks), the crops are visually inspected with the Read tool before wiring, and the source is removed from the repo root at the end of Task 1. |
| T-QHWF-02 | Information disclosure | git index vs repo-root working files | medium | mitigate | Task 1 stages by explicit path only. `git add -A` and `git add .` are forbidden, so the untracked concept sheet and client design zips cannot be swept into a public commit. |
| T-QHWF-03 | Tampering | identifiers: package name, repo/org slug, `*.pages.dev` and `workers.dev` hostnames, post slugs, BIP URL, contact address | high | mitigate | Global `sed`/editor-wide replace is forbidden by `<naming_contract>`; every edit is made at an explicit file and line, and Task 3 asserts the post filename, `config.yml` `app_title` and `package.json` name are unchanged. A blind replace here would break deploy URLs and permanent post URLs. |
| T-QHWF-04 | Tampering | CMS-editable content seeds | low | accept | Staff editing through `/admin` can overwrite the renamed lead/misja/post strings. Recorded as a carry-forward note in the SUMMARY rather than mitigated in code, since making seeds read-only would defeat CMS-01. |
| T-QHWF-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package installs occur in this task. `sharp` is already a resolved dependency and is used only from an uncommitted scratchpad script; `package.json` and `package-lock.json` must be byte-unchanged. |
</threat_model>

<verification>
1. `npm run check && npm run lint && npm run test:unit` all green; `npm run build` exits 0.
2. `npm run test` (Playwright) green, including the updated home title assertion and the unedited `tests/aktualnosci.spec.ts:100` genitive assertion.
3. Negative grep gate returns zero hits: `grep -rEi 'Żłobek Gminny|Żłobka Gminnego|żłobkiem gminnym|żłobku gminnym' src/ static/ tests/ docs/`.
4. Visual Read of `src/lib/assets/brand/logo-mark.png` and `src/lib/assets/brand/logo-full.png` confirms a complete emblem with no wordmark fragment, and a full wordmark with no clipped glyph.
5. `git diff --stat` shows no change to `package.json`, `package-lock.json`, or any file outside the `files_modified` list; `git status` shows the root design zips and `logo.png` still untracked.
</verification>

<success_criteria>
- Header, footer, every page title, every meta description, the 404 page and the web manifest name the institution `Publiczny Żłobek w Stromcu`, declined correctly for context.
- Header tagline reads `Jednostka organizacyjna Gminy Stromiec`.
- Header emblem and footer lockup are cut from the corrected artwork, so the image wordmark and the text wordmark agree.
- Favicon and apple-touch-icon regenerated from the corrected emblem.
- Zero occurrences of the old institution name across `src/`, `static/`, `tests/`, `docs/`.
- Every item on both DO-NOT-TOUCH lists is verifiably unchanged.
- Full local gate suite green.
</success_criteria>

<output>
Create `.planning/quick/260814-hwf-rename-to-official-publiczny-zlobek-w-st/260814-hwf-SUMMARY.md` when done.
</output>
