# Phase 5: Gallery & Fees - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md; this log preserves the alternatives considered.

**Date:** 2026-08-17
**Phase:** 5-gallery-fees
**Areas discussed:** Gallery editor shape, Cennik editing scope, Photo cropping and limits, Third fee surface and navigation

**Why this discussion happened at all:** `05-CONTEXT.md` was first gathered on 2026-08-15, while Sveltia was still the CMS and the replacement panel did not exist. `.planning/STATE.md` line 56 carried a standing instruction to re-read and refresh it once Phase 04.1 landed. This session is that refresh, and it supersedes the 2026-08-15 file.

---

## Session opening: what to do with the existing context

| Option | Description | Selected |
|--------|-------------|----------|
| Update it | Load the existing decisions, discuss only what the panel changed, rewrite the file | ✓ |
| View it | Summarise the current file and stop | |
| Skip | Leave the file untouched and plan against pre-panel assumptions | |

**User's choice:** Update it
**Notes:** Decisions independent of the CMS (D-01 to D-07, D-12 to D-18 of the old file) were treated as still standing and were not re-litigated.

---

## Gallery editor shape

### How staff manage gallery photos

| Option | Description | Selected |
|--------|-------------|----------|
| One screen with a list | The `/admin/o-nas` pattern: repeatable group, add and remove rows work without JavaScript and save nothing, one Zapisz at the bottom. Ten photos in one sitting is one commit and one build. | ✓ |
| One screen per photo | The `/admin/aktualnosci` pattern: every operation persisted immediately, but ten photos is ten commits, ten builds out of 500 per month, and twenty minutes of waiting. | |
| Hybrid, list plus photo screen | List handles removal and ordering in one save; adding or replacing a photo gets its own screen. Two patterns instead of one. | |

**User's choice:** One screen with a list
**Notes:** The build budget argument was decisive. Every save is a Cloudflare Pages build and the free plan allows 500 per month (04.1 D-11).

### Photo ordering

| Option | Description | Selected |
|--------|-------------|----------|
| Move up and move down buttons | Named form actions, the same mechanism as the rest of the list (04.1-09 P-26), so they work with JavaScript disabled and save nothing until Zapisz. Keyboard operable by construction. | ✓ |
| No ordering control | New photos land at the end and stay there. Zero new code, but reordering means deleting and re-uploading everything after the target. | |
| Drag with the mouse | Most comfortable on a desktop, but a real interactive component with its own accessibility bar, and it does not work without JavaScript. | |

**User's choice:** Move up and move down buttons

### Relationship to the "Nasze miejsce" section on /o-nas

| Option | Description | Selected |
|--------|-------------|----------|
| Two separate sets | `/o-nas` keeps its few facility photos, `/galeria` is its own larger set | Initially chosen, then REVERSED |
| /o-nas shows an excerpt of the gallery | One set, one upload place, `/o-nas` renders the first few plus a link | |
| Two sets plus a link | Smallest possible change to o-nas: one line of copy | |

**User's choice:** Reversed mid-discussion.
**Notes:** The user's words: "no wait i made a wrong decision, /o-nas should have a full gallery as that page is actually the most empty and feels the least completely done." This reversal drove the follow-up question below and is the largest change in the phase.

### What becomes of the /galeria address

| Option | Description | Selected |
|--------|-------------|----------|
| It disappears, anchor `/o-nas#galeria` | One gallery, one set, one place. Footer repointed exactly as D-17 repoints `/dojazd` to `/kontakt#dojazd`. Public nav grows by Cennik alone, five to six items rather than seven. | ✓ |
| It stays, same set at two addresses | Every D-16 and D-18 promise survives untouched, at the cost of the same material under two URLs | |
| Two sets with an editorial split | `/o-nas` gets the nine banked room slots, `/galeria` becomes a growing set from the life of the żłobek | |

**User's choice:** It disappears, anchor `/o-nas#galeria`
**Notes:** Supporting argument accepted during the discussion: event photos already belong in Aktualności, which carries cover images, so the room and building set will stay small and stable.

### Where the gallery is edited in the panel

| Option | Description | Selected |
|--------|-------------|----------|
| Its own "Galeria" screen | New `/admin/galeria` and a new content file, even though it renders publicly on `/o-nas`. The o-nas form already carries lead, misja, four wartości, kadra and the facility text. | ✓ |
| Inside the existing `/admin/o-nas` | Panel mirrors the page one to one and a whole editing session is one commit, at the cost of a very long form and every new photo travelling as base64 in the same request against roughly 10 ms of Worker CPU. | |
| You decide | Leave it to the planner after measuring how many new photos fit in one request | |

**User's choice:** Its own "Galeria" screen

---

## Cennik editing scope

### What staff can change without a developer

| Option | Description | Selected |
|--------|-------------|----------|
| Amounts and prose, ZUS field required | All six fields editable, but the ZUS sentence is a required field that cannot be saved empty. D-07 stops being an editorial rule and becomes a property of the structure. | ✓ |
| Amounts only, prose stays in code | Narrowest possible error surface, at the cost of needing a developer for exactly the kind of change Phase 04.1 existed to eliminate | |
| Amounts, prose and extra rows | Staff can add their own fee lines, but every new row is an amount no test knows about, so the D-07 guarantee stops being machine checkable | |

**User's choice:** Amounts and prose, ZUS field required
**Notes:** Durability after handover was the stated reason: nobody will call a developer when ZUS renames the benefit.

### Storing the 2 337 to 1 500 breakdown

| Option | Description | Selected |
|--------|-------------|----------|
| Two numbers stored, the third computed | The file holds the statutory rate and the reduction as numbers; the payable amount is subtracted and formatted in code, so the page cannot contradict its own arithmetic | ✓ |
| Three independent text fields | Zero new code and full formatting freedom, at the cost of a typo producing a subtraction that disagrees with its own result, invisible to every test | |
| Breakdown stays in code | Only the payable amount is editable; the 2 337 minus 837 history is fixed prose because it comes from a specific uchwała | |

**User's choice:** Two numbers stored, the third computed
**Notes:** Resolved without a separate question: when the reduction expires and is set to zero, the whole breakdown block disappears rather than rendering "obniżka 0 zł", because D-07 forbids a zero figure without its condition.

### Whether the page says how and when to pay

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, with placeholders | The page makes room for payment method and deadline, marked `PLACEHOLDER` because no source in the repository carries these facts. It lands on the client question list instead of surfacing after launch. | ✓ |
| No, amounts and subsidy only | The page stays short and carries no unconfirmed fact | |
| Deadline only, no account number | Fewer sensitive details on a public body's site while keeping what a budgeting parent wants | |

**User's choice:** Yes, with placeholders

### Whether the page shows a worked ZUS example

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, in one block with the condition | Fee 1 500 zł, benefit up to 1 500 zł, payable 0 zł if ZUS grants it for your child. Exactly the form D-07 permits: the zero figure and its condition in one rendered block. | ✓ |
| No, the ZUS sentence alone | Zero risk of a bare "0 zł" travelling out of context, at the cost of a weaker message where it should be strongest | |
| Yes, plus a link to ZUS | Honest about the żłobek not deciding eligibility, but adds an external link somebody has to maintain | |

**User's choice:** Yes, in one block with the condition
**Notes:** Requires an adjacency assertion in the test suite, mirroring what `tests/rekrutacja.spec.ts` already does for the fee box.

---

## Photo cropping and limits

### Tile aspect ratio

| Option | Description | Selected |
|--------|-------------|----------|
| 4:3, as on /o-nas today | The grid continues the section it replaces, `PROPORCJA_O_NAS` already exists, and most phone photos are natively 4:3 so the automatic crop removes nothing | ✓ |
| Square 1:1 | Reads most strongly as a gallery and tolerates mixed orientations, at the cost of a new constant and a quarter of every phone photo | |
| 16:9, as news covers | Reuses `PROPORCJA_WPISU`, but a nursery room renders as a strip in three columns | |

**User's choice:** 4:3, as on /o-nas today

### Drag-to-position cropper

| Option | Description | Selected |
|--------|-------------|----------|
| Automatic centre crop stays | Choosing 4:3 removed most of the reason a cropper would exist. A cropper is a second hydrated island in a phase already building a lightbox. | ✓ |
| Build the cropper | Real help for portrait photos and edge-of-frame subjects, at the cost of its own accessibility audit and a no-JavaScript fallback that still lands on the automatic crop | |
| Crop choice without a cropper | Three plain buttons picking top, centre or bottom: accessible by construction and catches the common portrait case | |

**User's choice:** Automatic centre crop stays
**Notes:** 04.1 had deferred the cropper with the words "candidate for Phase 5 if the gallery makes framing matter more". The 4:3 choice answered that condition in the negative.

### Photo count limit

| Option | Description | Selected |
|--------|-------------|----------|
| Hard limit of 12 | A 3x3 grid plus one spare row. The add button disappears at the limit with a Polish message. Forces editing: nine good photos sell the żłobek better than forty random ones. | ✓ |
| No limit, with a warning | Full freedom, but a warning that can be ignored usually is | |
| Exactly nine slots | The most predictable layout, but the żłobek can never show anything we did not anticipate, and empty slots need a rendering | |

**User's choice:** Hard limit of 12

### Captions

| Option | Description | Selected |
|--------|-------------|----------|
| Visible caption plus alt | Two fields per photo: a short caption a parent reads, and alt text describing what is in the photo. Keeps 04.1 D-15 intact, since alt stays a description rather than a label. | ✓ |
| Alt text only | Half the editor work, but the banked room names have nowhere to live and a sighted visitor cannot tell a bedroom from an art corner | |
| One field in both roles | Least work, but breaks 04.1 D-15 outright and reads the same content twice to a screen reader | |

**User's choice:** Visible caption plus alt

---

## Third fee surface and navigation

### The homepage keyFacts fee tile

| Option | Description | Selected |
|--------|-------------|----------|
| Reads the store, not editable | The tile computes its text from the same file as `/cennik` and the FeeBox. Drift becomes impossible and the panel does not grow. Deliberately does not open the "Ustawienia strony" screen that 04.1 deferred with the words "revisit after Phase 5". | |
| Move keyFacts to JSON and make it editable | All four facts move into a JSON file and get a panel screen, so staff can finally fix the opening hours, which are a `PLACEHOLDER` today. Cost: this is exactly the deferred settings screen, so the phase grows by one screen and one validator. | ✓ |
| Leave it as it is | Zero work, at the cost of the homepage and the fees page disagreeing the day the uchwała changes | |

**User's choice:** Move keyFacts to JSON and make it editable
**Notes:** Deliberate scope expansion, taken with the cost stated in the option text. The driving fact is that opening hours are a live `PLACEHOLDER` that the żłobek cannot fix without a developer. Constraint attached during the discussion: the fee tile specifically must stay computed rather than typed, because its suffix carries the conditional "0 zł" and an editor shortening it would publish a bare zero figure.

### How far the settings screen reaches

| Option | Description | Selected |
|--------|-------------|----------|
| The four tiles only | Age range, opening hours and place count are editable; the fee tile is shown as computed and locked, with a hint pointing at Cennik. Contact details are not touched. | ✓ |
| Tiles plus contact details | Full "Ustawienia strony", the largest handover value, but `contact` is rendered in many places and is woven into form copy that has its own single-source test gate | |
| Opening hours only | The smallest possible cut: one field, one `PLACEHOLDER` fewer | |

**User's choice:** The four tiles only

### Panel navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Galeria and Cennik in the nav, settings from the dashboard | Seven items become nine and the nav holds what an editor does often. Opening hours and place count change once every few years, so that screen is reached by a dashboard tile, which is an existing pattern rather than a new one. | ✓ |
| All three in the nav | Full consistency, at the cost of roughly four rows of wrapped chips above every screen on a phone, in a panel meant for uploading photos from a phone | |
| Cennik only | Lightest on mobile, but an editor looking for the gallery where they look for everything else will not find it, which is the class of problem CMS-03 exists to eliminate | |

**User's choice:** Galeria and Cennik in the nav, settings from the dashboard

### Cennik's position in the public navigation

| Option | Description | Selected |
|--------|-------------|----------|
| After Rekrutacja | Aktualności, O nas, Rekrutacja, Cennik, Dokumenty, Kontakt. Cost is part of the enrolment decision, so the next question sits under the parent's hand. | ✓ |
| After O nas | States the price early and honestly, but separates Rekrutacja and Dokumenty, which are used together | |
| Before Kontakt | Smallest disturbance to the tested order, but puts one of a parent's top three questions second from last | |

**User's choice:** After Rekrutacja
**Notes:** Requires a formal amendment to the locked Copywriting Contract in `01-UI-SPEC.md`, following the amendment procedure the project has used before.

---

## Claude's Discretion

Items the user delegated, explicitly or by choosing to move on:

- Whether the gallery section replaces the current "Nasze miejsce" block or sits below it. Resolved during the discussion as replacement, with `obiekt_opis` kept as introductory prose above the grid, because two photo sets on one page would reintroduce exactly the duplication that removing `/galeria` eliminated. Flagged for confirmation in `/gsd-ui-phase 5`.
- The exact JSON schema of both new content stores, the reader function signatures, and whether the repeated basename-resolution idiom is finally extracted into a shared helper.
- The Polish amount formatter (thousands separator, currency suffix) and where it lives.
- `/cennik` page structure inside the locked design system.
- Lightbox implementation detail inside the accessibility bar set by 04.1 for `MobileNav`.
- Rendering of the breakdown block when the reduction is zero.
- Odpisy and nieobecność policy detail level.

## Deferred Ideas

Raised during the discussion and consciously not taken up in this phase:

- Lightbox navigation between photos (arrows, swipe) rather than single-photo enlargement.
- A "treść zastępcza" placeholder boolean on the new content files, matching `o-nas.json`.
- A "Pełny cennik" link from the FeeBox on `/rekrutacja`.
- Contact details in the settings screen, which stays deferred from 04.1.
- The drag-to-position cropper, deferred for the second time and now with a stronger reason.
- Editor-defined extra fee rows.
- `/dojazd` as a standalone page, already dead per D-17.
