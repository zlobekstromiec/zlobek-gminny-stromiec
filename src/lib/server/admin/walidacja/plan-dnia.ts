// The day-plan validator (Phase 04.1, Plan 04.1-09; CMS-02, SC5, threats T-04.1-12 and
// T-04.1-34).
//
// WHAT THIS FILE IS ACCOUNTABLE TO: src/lib/components/DayPlan.svelte and, through it,
// BOTH the homepage and the O nas page. day-plan.json is one file rendered in two places
// (02 D-03), so a shape this validator gets wrong is wrong twice, and it is wrong at build
// time on a prerendered site: there is no reader here that skips a malformed row with a
// warning, the component simply renders whatever is in the array.
//
// THE KEY SET AND THE KEY ORDER ARE THE CONTRACT, not an aesthetic. The stored keys are
// `placeholder`, `rows`, and inside a row `time` and `what`. They are English because they
// predate this phase and ROADMAP SC5 freezes the shape of every content file; the panel's
// own control names are Polish and live in src/lib/pola-strony.ts, and this file is the one
// place the two vocabularies meet. Renaming either half here would publish a plan the
// component cannot read.
//
// THE HOURS FIELD IS FREE TEXT ON PURPOSE. The committed content writes a range with an en
// dash (6:30–8:30), which the project's copy rules allow precisely there, and the field is
// also where „po południu" or „w zależności od pogody" would legitimately go. A pattern
// tight enough to be worth having would refuse the content that is on the site today.
//
// EVERY READER REJECTS, NONE REPAIRS, inherited verbatim from walidacja/pola.ts: a silently
// corrected value is a different value, and here it would be committed to a public
// repository and published on the żłobek's website.
//
// THE RESULT IS BUILT KEY BY KEY from guarded locals and NEVER by spreading the submitted
// data, which is the same rule `postFromEntry` states about itself.
//
// Pure apart from the shared readers and the copy module: no fetch, no I/O, no clock.
// Nothing here logs.
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import {
	POLE_GODZIN,
	POLE_OPISU,
	POLE_ZASTEPCZA,
	PREFIKS_WIERSZA,
	nazwaPola,
	zbierzIndeksowane,
	type ZrodloPol
} from '../../../pola-strony.ts';
import { BLAD_ZBYT_DLUGI, flaga, kodBledu, tekstWymagany, type WynikPol } from './pola.ts';

// Re-exported so a server caller keeps importing the whole vocabulary from the validator
// beside it while exactly one declaration exists. A client component cannot import this
// file at all: see the header of src/lib/pola-strony.ts.
export { POLE_GODZIN, POLE_OPISU, POLE_ZASTEPCZA, PREFIKS_WIERSZA };

/** One time range on one row. Short: „6:30–8:30" is nine characters and the longest thing
 *  anybody should be writing here is „od 6:30 do 8:30, w zależności od pogody". */
export const MAKS_GODZIN = 60;
/** One line of the schedule, as it renders beside the hours. */
export const MAKS_OPISU = 200;

/** Exactly the shape src/lib/content/day-plan.json holds and DayPlan.svelte renders. */
export interface WierszPlanu {
	time: string;
	what: string;
}

export interface PlanDniaDane {
	placeholder: boolean;
	rows: WierszPlanu[];
}

/** Required text, with the two refusals the UI-SPEC error table distinguishes: „you left
 *  it empty" and „it is too long, shorten it to n". Same value, two instructions, because
 *  „popraw to pole" would tell an editor nothing about which of the two happened. */
function czytajWymagany(
	surowy: unknown,
	maks: number,
	brak: string
): { wartosc: string | null; blad?: string } {
	const wartosc = tekstWymagany(surowy, maks);
	if (wartosc !== null) return { wartosc };
	return {
		wartosc: null,
		blad: kodBledu(surowy, wartosc, maks) === BLAD_ZBYT_DLUGI ? tekstZaDlugi(maks) : brak
	};
}

/**
 * Read one submitted day plan.
 *
 * Every row is read before anything is refused, so an editor who left two rows incomplete
 * fixes both in one pass instead of discovering the second after correcting the first.
 * That is UI-SPEC Component Contract 10a: one summary, every offending control linked.
 *
 * Errors are keyed by the CONTROL NAME of the offending field, indexed exactly as it was
 * rendered, so the summary can link to the row the editor has to go and fix rather than to
 * the top of the form.
 */
export function walidujPlanDnia(zrodlo: ZrodloPol): WynikPol<PlanDniaDane> {
	const pola: Record<string, string> = {};

	// Dense, ordered, by position only. The index never leaves this function as anything
	// but an array offset and an error key (T-04.1-34).
	const surowe = zbierzIndeksowane(zrodlo, PREFIKS_WIERSZA, [POLE_GODZIN, POLE_OPISU]);

	const rows: WierszPlanu[] = [];
	for (let i = 0; i < surowe.length; i++) {
		const godziny = czytajWymagany(
			surowe[i][POLE_GODZIN],
			MAKS_GODZIN,
			KOPIA_WALIDACJA.godzinyBrak
		);
		if (godziny.blad !== undefined) pola[nazwaPola(PREFIKS_WIERSZA, i, POLE_GODZIN)] = godziny.blad;

		const opis = czytajWymagany(surowe[i][POLE_OPISU], MAKS_OPISU, KOPIA_WALIDACJA.opisWierszaBrak);
		if (opis.blad !== undefined) pola[nazwaPola(PREFIKS_WIERSZA, i, POLE_OPISU)] = opis.blad;

		if (godziny.wartosc === null || opis.wartosc === null) continue;
		// KEY BY KEY, in the order the committed file uses.
		const wiersz: Partial<WierszPlanu> = {};
		wiersz.time = godziny.wartosc;
		wiersz.what = opis.wartosc;
		rows.push(wiersz as WierszPlanu);
	}

	// One refusal point. Every incomplete row added at least one key above, so a failure
	// always travels with a non-empty map: the failure arm of WynikPol is never empty,
	// which is what stops a summary panel rendering with nothing to link to.
	if (Object.keys(pola).length > 0) return { ok: false, pola };

	const dane: Partial<PlanDniaDane> = {};
	dane.placeholder = flaga(zrodlo.get(POLE_ZASTEPCZA));
	dane.rows = rows;
	return { ok: true, dane: dane as PlanDniaDane };
}
