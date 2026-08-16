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
	POLE_ZDJECIE,
	POLE_ZDJECIE_USUN,
	type ZrodloPol
} from '../../../pola-wpisu.ts';
import { base64ZDataUrl, zaDuzeZdjecie } from '../obraz.ts';
import { bezpiecznaNazwaOkladki } from '../uploads.ts';
import {
	BLAD_ZBYT_DLUGI,
	dataZTrzech,
	flaga,
	kodBledu,
	pusty,
	tekstOpcjonalny,
	tekstWymagany
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
	POLE_ZASTEPCZA,
	POLE_ZDJECIE,
	POLE_ZDJECIE_USUN
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

/** A photo that arrived on this submission and still has to be written, together with the
 *  description that must accompany it (D-15).
 *
 *  The payload is carried out of the validator rather than the finished `obraz` value,
 *  because the cover is named after the entry's own filename stem (P-19) and on a create
 *  that stem is derived from the very title and date this function is in the middle of
 *  validating. The route composes the name once it has both, using `zOkladka` below so the
 *  key order of the stored object stays in one place. */
export interface NoweZdjecie {
	/** The base64 payload, already stripped of its prefix and never decoded. */
	base64: string;
	alt: string;
}

/**
 * What a validated aktualność submission carries.
 *
 * The success arm is `WynikPol<WpisDane>` widened with the two photo outcomes, so every
 * existing caller and every existing assertion that reads `wynik.dane.tytul` is unchanged.
 * The photo is not folded into `dane` because it is not stored content yet: it is a second
 * file the route has to commit in the SAME tree as the JSON (D-07).
 */
export type WynikWalidacjiWpisu =
	| { ok: true; dane: WpisDane; zdjecie?: NoweZdjecie; usunOkladke: boolean }
	| { ok: false; pola: Record<string, string> };

/**
 * The stored entry with its cover folded in, rebuilt KEY BY KEY in the seed order.
 *
 * A route cannot simply assign `dane.obraz` after the fact: the two optional photo keys sit
 * between `tresc` and `placeholder` in both seed files, and appending them would move them
 * to the end of every JSON the panel writes. That is invisible to the reader and glaring in
 * a diff, which is exactly the kind of churn D-09 exists to prevent.
 */
export function zOkladka(dane: WpisDane, nazwa: string, alt: string): WpisDane {
	const zOkladkaDane: Partial<WpisDane> = {};
	zOkladkaDane.tytul = dane.tytul;
	zOkladkaDane.data = dane.data;
	if (typeof dane.zajawka === 'string') zOkladkaDane.zajawka = dane.zajawka;
	zOkladkaDane.tresc = dane.tresc;
	zOkladkaDane.obraz = nazwa;
	zOkladkaDane.obraz_alt = alt;
	zOkladkaDane.placeholder = dane.placeholder;
	return zOkladkaDane as WpisDane;
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
 * Read one submitted aktualność.
 *
 * Every field is read before anything is refused, so an editor who left two fields wrong
 * fixes both in one pass instead of discovering the second one after correcting the
 * first. That is UI-SPEC Component Contract 10a: one summary, every offending control
 * linked.
 */
export function walidujWpis(zrodlo: ZrodloPol): WynikWalidacjiWpisu {
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

	// ---------------------------------------------------------------------------
	// The photo. Three related values arrive, and all three are read on the SERVER, which
	// is what makes D-15 survive scripting being switched off.
	//
	//  • the prepared data URL the island wrote into its hidden field, present only when a
	//    NEW photo was chosen on this visit;
	//  • the cover the entry already had, carried back so a save that changes only the
	//    title keeps the picture;
	//  • the removal flag, which is not the same thing as „no data URL arrived".
	//
	// An alt WITHOUT a photo is not an error and is not stored: the alt describes a
	// photograph, and with no photograph there is nothing to describe. A photo WITHOUT an
	// alt is refused, because publishing a picture no screen-reader user can perceive is
	// exactly what the Deklaracja dostępności forbids this site to do.
	// ---------------------------------------------------------------------------
	const surowe = zrodlo.get(POLE_ZDJECIE);
	// `undefined` means nothing was chosen, `null` means something arrived and was refused.
	// Collapsing the two would silently drop a photo the editor watched appear in the
	// preview, and the entry would publish without it with no message anywhere.
	const nowyBase64 = pusty(surowe) ? undefined : base64ZDataUrl(surowe);
	if (nowyBase64 === null) {
		// Two refusals, two instructions: „shrink it" and „choose a different file" are not
		// interchangeable to the person reading them (WCAG 3.3.3).
		pola[POLE_ZDJECIE] = zaDuzeZdjecie(surowe)
			? KOPIA_WALIDACJA.zdjecieZaDuze
			: KOPIA_WALIDACJA.zdjecieZlyTyp;
	}

	const surowaOkladka = zrodlo.get(POLE_OBRAZ);
	// Admitted by an allowlist rather than cleaned up (T-04.1-10). This is the one value in
	// the whole submission that could otherwise reach a written path.
	const staraOkladka = pusty(surowaOkladka) ? undefined : bezpiecznaNazwaOkladki(surowaOkladka);
	if (staraOkladka === null) pola[POLE_OBRAZ] = KOPIA_WALIDACJA.zdjecieZlyTyp;

	const usunieteZdjecie = flaga(zrodlo.get(POLE_ZDJECIE_USUN));
	// A new photo WINS over the flag: choosing a file after pressing „Usuń zdjęcie" is an
	// editor changing their mind, and the island clears the flag when it happens. Deciding
	// it here as well means a stale flag can never delete a picture that was just chosen.
	const maNowe = typeof nowyBase64 === 'string';
	const zachowajStara = !maNowe && !usunieteZdjecie && typeof staraOkladka === 'string';
	const jestZdjecie = maNowe || zachowajStara;

	const obrazAlt = tekstOpcjonalny(zrodlo.get(POLE_OBRAZ_ALT), MAKS_ALT);
	if (jestZdjecie) {
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
	// Only the cover that is ALREADY in the repository can be stored from here. A photo
	// chosen on this visit has no name yet, because the name comes from the entry's own
	// filename stem and the route is what knows it (P-19); it travels out in `zdjecie` and
	// the route folds it in with `zOkladka`.
	if (zachowajStara && typeof staraOkladka === 'string' && typeof obrazAlt === 'string') {
		dane.obraz = staraOkladka;
		dane.obraz_alt = obrazAlt;
	}
	dane.placeholder = flaga(zrodlo.get(POLE_ZASTEPCZA));

	return {
		ok: true,
		dane: dane as WpisDane,
		// `obrazAlt` is a string here by construction: `jestZdjecie` implies the alt rule
		// above ran and would have refused an absent or over-long one.
		...(typeof nowyBase64 === 'string' && typeof obrazAlt === 'string'
			? { zdjecie: { base64: nowyBase64, alt: obrazAlt } }
			: {}),
		// A REMOVAL, and deliberately not a replacement (P-21). Choosing a new photo writes
		// a blob at the generated path, which is the same path the entry's previous cover
		// occupies whenever the panel was what created it, so listing that path as a
		// deletion in the same tree would be asking one commit to both write and remove one
		// file. A replacement is an overwrite in place and needs no deletion at all.
		//
		// False when there is nothing to remove: a removal on an entry that never had a
		// cover is a no-op, not an instruction to go looking for a file.
		usunOkladke: usunieteZdjecie && !maNowe && typeof staraOkladka === 'string'
	};
}
