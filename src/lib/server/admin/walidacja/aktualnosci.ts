// The aktualność validator (Phase 04.1, Plan 04.1-06; CMS-02, D-15, SC5, threats
// T-04.1-12 and T-04.1-26).
//
// WHAT THIS FILE IS ACCOUNTABLE TO: src/lib/server/aktualnosci.ts. That module is the
// strictest consumer in the project. It skips any entry it cannot fully guard, with a
// build warning and nothing else, so a panel that emitted a subtly wrong shape would not
// break the build, it would publish NOTHING and leave a line in a log nobody reads. The
// output of this file is therefore not „valid according to us", it is „acceptable to the
// public reader", and tests/admin-walidacja-aktualnosci.unit.ts asserts exactly that by
// feeding a generated corpus through `postFromEntry` rather than through a description of
// it.
//
// EVERY READER REJECTS, NONE REPAIRS, inherited verbatim from walidacja/pola.ts and from
// the forms sanitizers: a silently corrected value is a different value, and here it
// would be committed to a public repository and published on the żłobek's website. A
// rejected field comes back to the editor with a Polish instruction; a repaired one comes
// back to nobody.
//
// THE RESULT IS BUILT KEY BY KEY from guarded locals, in the key order the two seed files
// already use, and NEVER by spreading the submitted data. That is the same rule
// `postFromEntry` states about itself, for the same reason: a spread is how an unvalidated
// field survives two fixes and reaches production on the third.
//
// Pure apart from the shared readers and the copy module: no fetch, no I/O, no clock.
// Nothing here logs. An entry title is staff-authored content and does not belong in a
// log line (RODO, C-03).
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import {
	POLE_DATA,
	POLE_DZIEN,
	POLE_MIESIAC,
	POLE_OBRAZ,
	POLE_OBRAZ_ALT,
	POLE_ROK,
	POLE_TRESC,
	POLE_TYTUL,
	POLE_ZAJAWKA,
	POLE_ZASTEPCZA,
	type ZrodloPol
} from '../../../pola-wpisu.ts';
import {
	BLAD_ZBYT_DLUGI,
	dataZTrzech,
	flaga,
	kodBledu,
	tekstOpcjonalny,
	tekstWymagany,
	type WynikPol
} from './pola.ts';

// Re-exported so a server caller may keep importing the whole vocabulary from the
// validator beside it while exactly one definition exists. A client component cannot
// import this file at all: see the header of src/lib/pola-wpisu.ts.
export {
	POLE_DATA,
	POLE_DZIEN,
	POLE_MIESIAC,
	POLE_OBRAZ,
	POLE_OBRAZ_ALT,
	POLE_ROK,
	POLE_TRESC,
	POLE_TYTUL,
	POLE_ZAJAWKA,
	POLE_ZASTEPCZA
};

// The caps. Named exported constants rather than inline numbers, because the message the
// editor reads quotes the cap the server actually enforced (`tekstZaDlugi`), and a number
// that lives in two places is a message that will eventually lie. T-04.1-26 mitigation:
// every narrative field is bounded before it can reach a commit.
//
// The values are sized against the real seed content plus generous room, not guessed:
// the longest committed zajawka today is about 230 characters and the longest tresc about
// 700.
/** One headline on a card and in a page title. */
export const MAKS_TYTULU = 160;
/** Two or three sentences on the list tile, per the field's own hint. */
export const MAKS_ZAJAWKI = 600;
/** A full post in the constrained markdown subset. Generous, and still an upper bound: an
 *  unbounded body is a commit nobody can review and a Worker request nobody budgeted. */
export const MAKS_TRESCI = 8000;
/** One sentence describing a photograph (D-15). */
export const MAKS_ALT = 300;

/** Exactly the shape src/lib/content/aktualnosci/*.json holds, and exactly the shape
 *  `postFromEntry` guards. Optional members are OMITTED when absent rather than emitted
 *  as undefined, so the serialized JSON matches the seed files byte for byte in shape. */
export interface WpisDane {
	tytul: string;
	data: string;
	zajawka?: string;
	tresc: string;
	obraz?: string;
	obraz_alt?: string;
	placeholder: boolean;
}

// `ZrodloPol` is declared beside the field names in src/lib/pola-wpisu.ts and re-exported
// here, for the same reason the names themselves are: the echo reader on the client side
// of the boundary and the validator on this side must read the same shape.
export type { ZrodloPol };

/** Longest generated cover basename. Not a staff-typed value at all: the island of Plan
 *  07 generates it from the entry, so the bound exists only to stop a hand-built request
 *  putting a page of text where a filename goes. */
export const MAKS_NAZWY_OBRAZU = 300;

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
 * Read one submitted aktualność.
 *
 * Every field is read before anything is refused, so an editor who left two fields wrong
 * fixes both in one pass instead of discovering the second one after correcting the
 * first. That is UI-SPEC Component Contract 10a: one summary, every offending control
 * linked.
 */
export function walidujWpis(zrodlo: ZrodloPol): WynikPol<WpisDane> {
	const pola: Record<string, string> = {};

	const tytul = czytajWymagany(zrodlo.get(POLE_TYTUL), MAKS_TYTULU, KOPIA_WALIDACJA.tytulBrak);
	if (tytul.blad !== undefined) pola[POLE_TYTUL] = tytul.blad;

	// One reading of the three selects, one message for the whole group. The calendar
	// check lives in `dataZTrzech`, which round-trips through Date.UTC rather than
	// consulting a per-month table, so 31 April is refused without a leap-year rule of
	// our own.
	const data = dataZTrzech(zrodlo.get(POLE_DZIEN), zrodlo.get(POLE_MIESIAC), zrodlo.get(POLE_ROK));
	if (data === null) pola[POLE_DATA] = KOPIA_WALIDACJA.dataNiepelna;

	const surowaZajawka = zrodlo.get(POLE_ZAJAWKA);
	const zajawka = tekstOpcjonalny(surowaZajawka, MAKS_ZAJAWKI);
	// `null` here means „something was typed and it was refused", which for an optional
	// field can only be „too long". Collapsing that into „absent" would make the editor
	// watch their text vanish on save with no message.
	if (zajawka === null) pola[POLE_ZAJAWKA] = tekstZaDlugi(MAKS_ZAJAWKI);

	const tresc = czytajWymagany(zrodlo.get(POLE_TRESC), MAKS_TRESCI, KOPIA_WALIDACJA.trescBrak);
	if (tresc.blad !== undefined) pola[POLE_TRESC] = tresc.blad;

	// The photo pair. Plan 07 adds the control; the RULE exists here first, because D-15
	// makes it a server rule so it survives with JavaScript disabled.
	//
	// An alt WITHOUT an image is not an error and is not stored: the alt describes a
	// photograph, and with no photograph there is nothing to describe. An image WITHOUT an
	// alt is refused, because publishing a picture no screen-reader user can perceive is
	// exactly what the Deklaracja dostępności forbids this site to do.
	const obraz = tekstOpcjonalny(zrodlo.get(POLE_OBRAZ), MAKS_NAZWY_OBRAZU);
	const obrazAlt = tekstOpcjonalny(zrodlo.get(POLE_OBRAZ_ALT), MAKS_ALT);
	// An image value that arrived and could not be read is not something a control on this
	// screen can produce today, so it can only be a hand-built request. „Choose a JPG, PNG
	// or WEBP" is the honest instruction for it and is the sentence Plan 07's real file
	// checks will reuse.
	if (obraz === null) pola[POLE_OBRAZ] = KOPIA_WALIDACJA.zdjecieZlyTyp;
	if (typeof obraz === 'string') {
		if (obrazAlt === null) pola[POLE_OBRAZ_ALT] = tekstZaDlugi(MAKS_ALT);
		else if (obrazAlt === undefined) pola[POLE_OBRAZ_ALT] = KOPIA_WALIDACJA.altBrak;
	}

	// One refusal point. Each of the three required values adds a key above when it is
	// missing, so a null here always travels with a non-empty map: the failure arm of
	// WynikPol is never empty, which is what stops a summary panel rendering with nothing
	// to link to.
	if (tytul.wartosc === null || data === null || tresc.wartosc === null) {
		return { ok: false, pola };
	}
	if (Object.keys(pola).length > 0) return { ok: false, pola };

	// KEY BY KEY, in the order the seed files use: tytul, data, zajawka, tresc, obraz,
	// obraz_alt, placeholder. A `Partial` plus one cast at the return, rather than an
	// object literal, is what makes „omit an absent optional entirely" expressible without
	// emitting an explicit undefined that the serializer would then drop inconsistently.
	const dane: Partial<WpisDane> = {};
	dane.tytul = tytul.wartosc;
	dane.data = data.iso;
	// `typeof === 'string'` rather than `!== undefined`: the refused-because-too-long
	// value is null, it already added its own key above, and this is the narrowing that
	// says so to the compiler as well as to a reader.
	if (typeof zajawka === 'string') dane.zajawka = zajawka;
	dane.tresc = tresc.wartosc;
	if (typeof obraz === 'string' && typeof obrazAlt === 'string') {
		dane.obraz = obraz;
		dane.obraz_alt = obrazAlt;
	}
	dane.placeholder = flaga(zrodlo.get(POLE_ZASTEPCZA));

	return { ok: true, dane: dane as WpisDane };
}
