// Panel JSON serializer (Phase 04.1, Plan 04.1-04; D-09).
//
// Every byte the panel writes into src/lib/content/ goes through this one
// function, so content authored in the browser stays inside the repository's
// normal quality gate instead of fighting it.
//
// WHY a tab indent and a trailing newline, and why that needs a test:
// prettier.config.js sets useTabs true, and src/lib/content/ is deliberately NOT
// listed in .prettierignore. prettier keeps a JSON object EXPANDED when the
// source has a newline after the opening brace and COLLAPSES it onto one line
// when it does not. JSON.stringify with an indent always emits that newline, so
// the two agree, and prettier always terminates a file with exactly one newline,
// so the appended newline agrees too. That agreement is a formatter HEURISTIC,
// not a configured option: nothing in prettier.config.js states it and nothing
// stops a future prettier release from changing it. So the equivalence is
// asserted against the real formatter in tests/admin-serializuj.unit.ts rather
// than assumed here.
//
// This has already gone wrong once. The Phase 3 UAT blocker recorded in STATE.md
// was content written with a two-space indent, which failed `prettier --check .`
// and therefore blocked EVERY local commit through the pre-commit hook until
// somebody ran `prettier --write`. A panel that can break a developer's ability
// to commit is worse than no panel.
//
// EXPECTED one-off diff on the first panel save: day-plan.json holds its rows and
// o-nas.json holds its obiekt_zdjecia as one-line objects today, which prettier
// preserves because their source has no newline after the brace. The first save
// expands them. That is correct output, not a regression.
//
// EXPLICITLY REJECTED alternative: adding src/lib/content/ to .prettierignore.
// It would silence this class of defect rather than prevent it, and it would hide
// every future regression in panel output (D-09).
export function serializujJson(dane: unknown): string {
	return JSON.stringify(dane, null, '\t') + '\n';
}
