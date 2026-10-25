---
phase: quick-261025-m4g
plan: 01
status: complete
subsystem: content (rekrutacja, kontakt, formularze, klauzula RODO)
tags: [content, rekrutacja, rodo, single-source, placowka-correction]
requires: []
provides:
  - "skladanieWniosku {miejsce, ulica, godziny} in src/lib/content/site.ts, the one source for where, at what street and in what hours a wniosek is filed"
affects:
  - homepage recruitment step 2 and 3
  - /rekrutacja lead, procedura, nabor banner closing line
  - /kontakt info box (now .wnioski-panel)
  - KOPIA_KONTAKT.intro, KOPIA_ZGLOSZENIE.intro and .sukcesTresc
  - KLAUZULA (Administrator, Odbiorcy, Tymczasowa kopia zapasowa)
tech-stack:
  added: []
  patterns:
    - "single-source content object derived from `contact`, interpolated everywhere, asserted by tests against the object rather than literals"
key-files:
  created: []
  modified:
    - src/lib/content/site.ts
    - src/lib/content/rekrutacja.ts
    - src/lib/content/forms.ts
    - src/routes/rekrutacja/+page.svelte
    - src/routes/kontakt/+page.svelte
    - src/lib/server/forms/mailer.ts
    - tests/forms-copy.unit.ts
    - tests/rekrutacja.spec.ts
    - tests/kontakt.spec.ts
    - tests/home.spec.ts
    - .claude/CLAUDE.md
    - docs/dev-env.md
    - .planning/dane-bip-zlobek-stromiec.md
decisions:
  - "Wnioski przyjmuje i rekrutacje prowadzi zlobek (korekta placowki 2026-10-25); zadna powierzchnia strony nie kieruje rodzica do Urzedu Gminy"
  - "Miejsce, ulica i godziny skladania wniosku maja jedno zrodlo: skladanieWniosku w site.ts, wyprowadzone z contact (godziny z magazynu w-skrocie.json)"
  - "Kopia cc do Urzedu Gminy zostaje i nadal jest ujawniona w klauzuli, uzasadniona jako organ prowadzacy zlobek; stale w mailer.ts bez zmian"
metrics:
  duration: "~25 min"
  completed: 2026-10-25
actuals:
  tokens: 10100
  tasks: 2
  commits: 3
---

# Quick 261025-m4g Plan 01: wnioski przyjmuje żłobek, nie Urząd Gminy Summary

Every surface that tells a parent where to file a wniosek (homepage step 2, /rekrutacja procedura and banner, /kontakt info box, both form intros and the zgłoszenie success body) now names the żłobek at ul. Radomska 72 in the żłobek's own opening hours. All of them read one new object, `skladanieWniosku` in site.ts. The dead `urzad.room` and `urzad.wnioskiHours` fields are gone. The klauzula still discloses the cc copy to the Urząd Gminy, now justified as organ prowadzący.

## Commits

| Task | Commit | Message |
| ---- | ------ | ------- |
| 1 (tracer, TDD) | 6580dd3 | fix(quick-261025-m4g): wnioski przyjmuje zlobek, nie urzad gminy |
| 2 (code) | 55cc35e | refactor(quick-261025-m4g): usun room i wnioskiHours z urzad |
| 2 (docs) | 6039a2a | docs(quick-261025-m4g): urzad gminy jako organ prowadzacy zlobka |

## What changed

- **site.ts:** new exported `skladanieWniosku = { miejsce: 'w żłobku', ulica: contact.addressLines[0], godziny: contact.hours }`. `urzad` now holds only `name` and `addressLines`. `openStrings.nastepnyNabor` reads "Wnioski przyjmujemy w żłobku. ...", and `closedStrings.nastepnyNabor` reads "Termin kolejnego naboru ogłosi żłobek." (the PLACEHOLDER marker stays). Step 2 interpolates `skladanieWniosku`, and step 3 no longer says the Komisja is "powołana przez Wójta". The appeal sentence is unchanged.
- **rekrutacja.ts:** imports `skladanieWniosku`. The PROCEDURA steps were rewritten the same way; the 'Możesz się odwołać' step is unchanged.
- **/rekrutacja lead:** "Nabór prowadzi żłobek. Poniżej znajdziesz ..."
- **forms.ts:** the kontakt intro no longer names the Urząd. The zgłoszenie intro and success body end with the żłobek, street (and hours). In the klauzula, the administrator's second sentence ("właściwy jest ... pokój 17") is deleted, the Odbiorcy sentence ends "... otrzymuje Urząd Gminy w Stromcu jako organ prowadzący żłobek.", and the backup paragraph now says "do skrzynki żłobka".
- **/kontakt:** the info box heading is "Wnioski rekrutacyjne składasz w żłobku", with new body copy. The classes, ids and grid area were renamed `urzad*` to `wnioski*`. Styling values are unchanged.
- **mailer.ts:** comments only. TO, CC, BCC and FROM are byte-identical.
- **Docs:** the CLAUDE.md and dev-env.md cc clause now says "organ prowadzący". dane-bip has a dated correction note under Procedura, and the BIP lines are untouched.

## Verification (commands and results)

TDD RED, before any copy change:
- `npm run test:unit`: forms-copy.unit.ts failed to load with `SyntaxError: ... does not provide an export named 'skladanieWniosku'` (606 tests, 1 failing file).
- After adding only the export, `node --test tests/forms-copy.unit.ts` gave pass 37, fail 5. The 5 failures were exactly the new or changed assertions (klauzula organ prowadzący, klauzula no pokój or właściwy jest, zgłoszenie intro, success body, kontakt intro).

GREEN and the final gate, run on the tree that was committed:
- `npm run check`: exit 0, "0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS"
- `npm run lint`: exit 0 (prettier "All matched files use Prettier code style!", eslint clean)
- `npm run test:unit`: exit 0, tests 647, pass 647, fail 0
- `lsof -ti :4173 | xargs kill; npx playwright test tests/rekrutacja.spec.ts tests/kontakt.spec.ts tests/home.spec.ts`: 56 passed (run after Task 1 and again after Task 2)
- `grep -rnE 'urzad\.room|urzad\.wnioskiHours|pokój 17|Urzędzie Gminy|prowadzi Gmina|powołana przez Wójta|ogłosi Urząd|recruitment casework|prowadzi sprawy rekrutacyjne' src tests`: no matches (exit 1)
- mailer.ts non-comment diff lines vs fbaf6f5: 0
- em dashes added in `git diff fbaf6f5 -- src tests`: 0 (also 0 in the three docs)
- pre-commit (svelte-check, prettier and eslint) passed on all three commits

## Open items for the client to confirm

1. **E-mail or post filing.** Can a wniosek now also be sent by e-mail or by post? The site still says "osobiście" and "Nie ma możliwości złożenia wniosku drogą elektroniczną ani pocztą", because that sentence comes from the regulamin on the BIP.
2. **Appeal to the Wójt.** Does the 7-day appeal to the Wójt still apply now that the żłobek runs the recruitment? The /rekrutacja appeal step and homepage step 3 still say it does.

## Deviations from Plan

1. **Commit subjects shortened (CLAUDE.md / hook rule).** The two Task 2 subjects the plan prescribed were 74 and 79 characters, over the 72-character Conventional Commits limit. I rewrote both local, unpushed commits through `git reset --soft 6580dd3` and recommitted them as 55cc35e (60 chars) and 6039a2a (64 chars). File content is identical to the verified tree, and no unrelated file was staged.
2. **Tracer feedback gate.** Auto mode is off (`_auto_chain_active` and `auto_advance` are both false), so the interactive tracer rule would have stopped for a human-verify after Task 1. The plan is `autonomous: true` and the orchestrator asked for all tasks, so I continued. The tracer's automated `<verify>` (test:unit plus the three specs) passed end-to-end before I expanded.
3. **Playwright RED not observed separately.** The new spec assertions target `.wnioski-panel`, the "w żłobku" heading and the `skladanieWniosku` export, none of which existed before Task 1. The specs could not have passed on the old code, but they were not run red as a separate step. Only the unit RED was observed.

## Deferred (out of plan scope, not edited)

Two stale code comments still say wnioski are filed at the Urząd Gminy. Both files are outside this plan's file list, so I left them alone. A follow-up quick fix should correct them:
- `src/lib/components/Recruitment.svelte:7`: "wnioski are filed in person at the Urząd Gminy"
- `src/lib/components/ZgloszenieForm.svelte:22`: "accepted in person at the Urząd Gminy only"

Both are comments only and nothing a visitor can see.

## Threat model check

- T-m4g-01: the klauzula keeps the copy disclosure with `urzad.name`. The forms-copy test asserts it, plus "jako organ prowadzący żłobek". mailer.ts constants are unchanged, with a comment-only diff.
- T-m4g-02: no new copy names the clerk. The CC-absence sweep in forms-copy.unit.ts stays green.
- T-m4g-03: the single source is `skladanieWniosku`, and the specs assert against that object, never against literals.
- T-m4g-04: in the backup paragraph only the mailbox noun changed. The pinned assertions and the BCC constant are intact.

## Known Stubs

None introduced. The existing `// PLACEHOLDER:` marker on `closedStrings.nastepnyNabor` is kept on purpose.

## Self-Check: PASSED

- All 13 modified files exist and are in the three commits (`git show --stat`).
- Commits 6580dd3, 55cc35e and 6039a2a are present in `git log`.
