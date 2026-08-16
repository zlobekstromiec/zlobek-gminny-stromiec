// The dokument validator (Phase 04.1, Plan 04.1-08; CMS-02, SC5, D-14, P-23, P-24,
// threats T-04.1-31 and T-04.1-32).
//
// WHAT THIS FILE IS ACCOUNTABLE TO: src/lib/server/dokumenty.ts. That reader skips any
// entry whose `plik` lacks the canonical prefix or whose file is missing, with a build
// warning and nothing else, so a panel that emitted a subtly wrong shape would not break
// the build, it would publish NOTHING and leave a line in a log nobody reads. The output of
// this file is therefore not „valid according to us", it is „acceptable to the public
// reader", and tests/admin-walidacja-dokumenty.unit.ts asserts exactly that by feeding the
// result through that reader's own metadata resolver rather than through a description of
// it. Same discipline, and the same reason, as walidacja/aktualnosci.ts.
//
// THE CATEGORY UNION IS IMPORTED, NEVER RETYPED (P-24). A list of three strings restated
// here would eventually accept a category the site does not group, and the entry would
// simply vanish from the public page with nothing said. The dormant RODO category is part
// of that union and stays selectable: dropping it would strand any entry already using it
// with no screen able to edit it.
//
// D-14: `typ` AND `rozmiar` ARE NEVER STORED. The reader computes both from the file on
// disk at build time, which is what makes them impossible to get wrong when a file is
// replaced. Nothing in this file may ever start writing them.
//
// EVERY READER REJECTS, NONE REPAIRS, inherited verbatim from walidacja/pola.ts: a silently
// corrected value is a different value, and here it would be committed to a public
// repository and published on the żłobek's website.
//
// THE RESULT IS BUILT KEY BY KEY from guarded locals, in the key order the three seed files
// already use, and NEVER by spreading the submitted data. A spread is how an unvalidated
// field survives two fixes and reaches production on the third.
//
// Pure apart from the shared readers and the copy module: no fetch, no I/O, no clock.
// Nothing here logs. A document name is staff-authored content and does not belong in a log
// line (RODO, C-03).
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import { KATEGORIE, jestKategoria, type Kategoria } from '../../../kategorie-dokumentow.ts';
import {
	POLE_DZIEN,
	POLE_KATEGORIA,
	POLE_MIESIAC,
	POLE_NAZWA,
	POLE_PLIK,
	POLE_ROK,
	POLE_WERSJA,
	POLE_ZASTEPCZA,
	POLE_ZRODLO,
	type ZrodloPol
} from '../../../pola-dokumentu.ts';
import type { DokumentEntry } from '../../dokumenty.ts';
import { base64ZDataUrlDokumentu, zaDuzyPlik, type PlikZDataUrl } from '../plik.ts';
import { slugAscii } from '../slug.ts';
import {
	BLAD_ZBYT_DLUGI,
	adresHttps,
	dataZTrzech,
	flaga,
	kodBledu,
	pusty,
	tekstWymagany
} from './pola.ts';

// Re-exported so a server caller may keep importing the whole vocabulary from the validator
// beside it while exactly one definition exists. A client component cannot import this file
// at all: see the header of src/lib/pola-dokumentu.ts.
export {
	POLE_DZIEN,
	POLE_KATEGORIA,
	POLE_MIESIAC,
	POLE_NAZWA,
	POLE_PLIK,
	POLE_ROK,
	POLE_WERSJA,
	POLE_ZASTEPCZA,
	POLE_ZRODLO
};
export { KATEGORIE };
export type { Kategoria };

/** Longest document name. Named and exported rather than inlined, because the message the
 *  editor reads quotes the cap the server actually enforced (`tekstZaDlugi`), and a number
 *  living in two places is a message that will eventually lie. The longest committed name
 *  today is „Statut żłobka (uchwała XXIII.133.2026)" at under forty characters, so this is
 *  generous and still a bound: an unbounded name is a filename nobody can read and a commit
 *  subject nobody can scan. */
export const MAKS_NAZWY = 200;

/** Every stored key EXCEPT `plik`.
 *
 *  The path is not the validator's to produce, for the same reason the cover basename was
 *  not in Plan 04.1-07: on a create it is derived from the name this function is in the
 *  middle of validating, and on an edit it must stay the path the entry already has, which
 *  only the route knows. `zPlikiem` below folds it in at the right position, so the key
 *  order of the stored object lives in exactly one place and no route ever assigns onto a
 *  validated object. */
export type DokumentPola = Omit<DokumentEntry, 'plik'>;

/**
 * What a validated dokument submission carries.
 *
 * `plik` is present only when a NEW file arrived on this submission; its absence on an edit
 * means „keep the one this document already has" and is not an error. `slug` is the
 * document's identity (P-23), derived from the accepted name, and the create route uses it
 * both to refuse a collision and to name both halves. The edit route ignores it and writes
 * to the slug in its own route parameter, so renaming a document never moves its download
 * URL.
 */
export type WynikWalidacjiDokumentu =
	| { ok: true; dane: DokumentPola; plik?: PlikZDataUrl; slug: string }
	| { ok: false; pola: Record<string, string> };

/**
 * The stored entry with its path folded in, rebuilt KEY BY KEY in the seed order.
 *
 * A route cannot simply assign `dane.plik` after the fact: `plik` sits between `kategoria`
 * and `wersja` in all three seed files, and appending it would move it to the end of every
 * JSON the panel writes. That is invisible to the reader and glaring in a diff, which is
 * exactly the churn D-09 exists to prevent.
 */
export function zPlikiem(pola: DokumentPola, sciezka: string): DokumentEntry {
	const wpis: Partial<DokumentEntry> = {};
	wpis.nazwa = pola.nazwa;
	wpis.kategoria = pola.kategoria;
	wpis.plik = sciezka;
	wpis.wersja = pola.wersja;
	if (typeof pola.zrodlo_bip === 'string') wpis.zrodlo_bip = pola.zrodlo_bip;
	wpis.placeholder = pola.placeholder;
	return wpis as DokumentEntry;
}

/** Required text, with the two refusals the UI-SPEC error table distinguishes: „you left it
 *  empty" and „it is too long, shorten it to n". Same value, two instructions, because
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
 * Read one submitted document.
 *
 * Every field is read before anything is refused, so an editor who left two fields wrong
 * fixes both in one pass instead of discovering the second after correcting the first. That
 * is UI-SPEC Component Contract 10a: one summary, every offending control linked.
 *
 * `wymaganyPlik` is true on the create screen and false on the edit screen. It is a
 * parameter rather than something inferred from the submission, because „no file arrived"
 * and „this document needs no new file" are the same bytes on the wire and completely
 * different answers to the person in front of the screen.
 */
export function walidujDokument(zrodlo: ZrodloPol, wymaganyPlik: boolean): WynikWalidacjiDokumentu {
	const pola: Record<string, string> = {};

	const nazwa = czytajWymagany(zrodlo.get(POLE_NAZWA), MAKS_NAZWY, KOPIA_WALIDACJA.nazwaBrak);
	if (nazwa.blad !== undefined) pola[POLE_NAZWA] = nazwa.blad;

	// THE SLUG IS THE DOCUMENT'S IDENTITY AND ITS FILENAME (P-23), so a name that slugs to
	// nothing has to be refused here rather than allowed to produce a file called only its
	// own extension. `slugAscii` emits either the empty string or lowercase ASCII letters,
	// digits and single hyphens, which is what makes every path built from it safe by
	// construction (T-04.1-31).
	const slug = nazwa.wartosc === null ? '' : slugAscii(nazwa.wartosc);
	if (nazwa.blad === undefined && slug.length === 0) pola[POLE_NAZWA] = KOPIA_WALIDACJA.nazwaBrak;

	// Read from the shared union rather than from a retyped list (P-24). An untouched select
	// posts the empty string, so „nothing chosen" and „something unexpected arrived" are the
	// same thing to the person reading the message and get the same instruction.
	const surowaKategoria = zrodlo.get(POLE_KATEGORIA);
	const kategoria = jestKategoria(surowaKategoria) ? surowaKategoria : null;
	if (kategoria === null) pola[POLE_KATEGORIA] = KOPIA_WALIDACJA.kategoriaBrak;

	// One reading of the three selects, one message for the whole group, keyed on the STORED
	// key rather than on any one control: a fieldset is what carries the message, and marking
	// the day invalid when the year is the empty one would send the editor to the wrong
	// control. The dotted shape is taken, never the ISO one: that is the shape all three seed
	// documents already store and the shape the public row renders.
	const wersja = dataZTrzech(
		zrodlo.get(POLE_DZIEN),
		zrodlo.get(POLE_MIESIAC),
		zrodlo.get(POLE_ROK)
	);
	if (wersja === null) pola[POLE_WERSJA] = KOPIA_WALIDACJA.wersjaNiepelna;

	// Optional, and only ever an https address. An http link from a public body's site is a
	// downgrade the visitor never asked for, and the field's own hint already promises
	// „zaczynający się od https://".
	const surowyZrodlo = zrodlo.get(POLE_ZRODLO);
	const zrodloBip = pusty(surowyZrodlo) ? undefined : adresHttps(surowyZrodlo);
	if (zrodloBip === null) pola[POLE_ZRODLO] = KOPIA_WALIDACJA.zrodloNiepoprawne;

	// ---------------------------------------------------------------------------------
	// The file. It arrives as a data URL the browser produced (P-22) and NOTHING HERE
	// DECODES IT: the extraction checks the type, then the length, then the pattern, and
	// hands the payload on as a substring.
	//
	// `undefined` means nothing was attached, `null` means something arrived and was
	// refused. Collapsing the two would silently drop a file the editor watched appear in
	// the „Wybrany plik" line, and the document would publish pointing at nothing.
	// ---------------------------------------------------------------------------------
	const surowyPlik = zrodlo.get(POLE_PLIK);
	const plik = pusty(surowyPlik) ? undefined : base64ZDataUrlDokumentu(surowyPlik);
	if (plik === null) {
		// Two refusals, two instructions: „it is too large" and „choose a different kind of
		// file" are not interchangeable to the person reading them (WCAG 3.3.3).
		pola[POLE_PLIK] = zaDuzyPlik(surowyPlik)
			? KOPIA_WALIDACJA.plikZaDuzy
			: KOPIA_WALIDACJA.plikZlyTyp;
	} else if (plik === undefined && wymaganyPlik) {
		pola[POLE_PLIK] = KOPIA_WALIDACJA.plikBrak;
	}

	// One refusal point. Each required value adds a key above when it is missing, so a null
	// here always travels with a non-empty map: the failure arm is never empty, which is what
	// stops a summary panel rendering with nothing to link to.
	if (nazwa.wartosc === null || kategoria === null || wersja === null) {
		return { ok: false, pola };
	}
	if (Object.keys(pola).length > 0) return { ok: false, pola };

	// KEY BY KEY, in the order the seed files use, minus `plik` which `zPlikiem` folds in.
	// A `Partial` plus one cast at the return, rather than an object literal, is what makes
	// „omit an absent optional entirely" expressible without emitting an explicit undefined
	// that the serializer would then drop inconsistently.
	const dane: Partial<DokumentPola> = {};
	dane.nazwa = nazwa.wartosc;
	dane.kategoria = kategoria;
	dane.wersja = wersja.kropki;
	// `typeof === 'string'` rather than `!== undefined`: a refused address is null, it has
	// already added its own key above, and this is the narrowing that says so to the
	// compiler as well as to a reader.
	if (typeof zrodloBip === 'string') dane.zrodlo_bip = zrodloBip;
	dane.placeholder = flaga(zrodlo.get(POLE_ZASTEPCZA));

	return {
		ok: true,
		dane: dane as DokumentPola,
		// Both absent cases spelled out. A null cannot reach here (it added its own key
		// above and the refusal returned), and narrowing it explicitly is what says that to
		// the compiler as well as to a reader.
		...(plik === undefined || plik === null ? {} : { plik }),
		slug
	};
}
