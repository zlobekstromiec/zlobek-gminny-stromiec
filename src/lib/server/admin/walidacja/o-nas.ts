// The O nas validator (Phase 04.1, Plan 04.1-09; Phase 05, Plan 05-07; CMS-02, D-13, SC5,
// threats T-04.1-12, T-04.1-29 and T-04.1-34).
//
// WHAT THIS FILE IS ACCOUNTABLE TO: src/routes/o-nas/+page.svelte. That page reads
// o-nas.json directly, with no guarding reader between it and the file, so there is nothing
// here that would skip a malformed value with a warning: a wrong shape is a broken public
// page or a failed prerender. The key set and the key order below are copied from the
// committed file, and tests/admin-walidacja-strony.unit.ts asserts that against the real
// file rather than against a description of it.
//
// THIS SCREEN OWNS TEXT ONLY (Phase 05, Plan 05-07). The facility photographs left this
// store together with the whole photo half of /admin/o-nas: the gallery owns them now, and
// everything this file used to carry about a picture, the required alt, the derived
// basename, the two-pass name reservation and the removal flag, lives in
// src/lib/server/admin/walidacja/galeria.ts. It was REPRODUCED there rather than shared from
// here, for the reason written at the head of src/lib/server/admin/uploads.ts. What stays
// here is the facility DESCRIPTION, which is prose and is still edited on this screen.
//
// THE STAFF COUNTS ARE NUMBERS, and that is not a detail. The page renders them as numbers
// beside a Polish label; a string „6" would render identically today and would be a
// different JSON value in a diff, in a future reader and in anything that ever adds them
// up. `liczbaWZakresie` refuses „12abc" and „12.0" before either could reach the file.
//
// EVERY READER REJECTS, NONE REPAIRS, and the result is built KEY BY KEY from guarded
// locals, never by spreading the submitted data.
//
// Pure apart from the shared readers and the copy module: no fetch, no I/O, no clock.
// Nothing here logs.
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import {
	POLE_KADRY_OPIEKUNKI,
	POLE_KADRY_OPIS,
	POLE_KADRY_PERSONEL,
	POLE_LEAD,
	POLE_MISJI,
	POLE_OBIEKTU_OPIS,
	POLE_OPISU,
	POLE_TYTULU,
	POLE_ZASTEPCZA,
	PREFIKS_WARTOSCI,
	nazwaPola,
	zbierzIndeksowane,
	type ZrodloPol
} from '../../../pola-strony.ts';
import { BLAD_ZBYT_DLUGI, flaga, kodBledu, liczbaWZakresie, tekstWymagany } from './pola.ts';

// Re-exported so a server caller keeps importing the whole vocabulary from the validator
// beside it while exactly one declaration exists.
export {
	POLE_KADRY_OPIEKUNKI,
	POLE_KADRY_OPIS,
	POLE_KADRY_PERSONEL,
	POLE_LEAD,
	POLE_MISJI,
	POLE_OBIEKTU_OPIS,
	POLE_OPISU,
	POLE_TYTULU,
	POLE_ZASTEPCZA,
	PREFIKS_WARTOSCI
};

// The caps. Named exported constants rather than inline numbers, because the message the
// editor reads quotes the cap the server actually enforced (`tekstZaDlugi`), and a number
// living in two places is a message that will eventually lie (T-04.1-26). Sized against the
// committed content plus generous room: the longest paragraph on the page today is about
// 300 characters.
/** The lead paragraph under the page heading. */
export const MAKS_LEAD = 600;
/** One narrative paragraph in the constrained markdown subset: misja, kadra, obiekt. */
export const MAKS_AKAPITU = 2000;
/** The heading of one wartość card. */
export const MAKS_TYTULU_WARTOSCI = 80;
/** The body of one wartość card. */
export const MAKS_OPISU_WARTOSCI = 400;
/** Nobody has a hundred opiekunki, and a typed 600 is a defect nobody would ever notice
 *  being wrong. The bound is what the UI-SPEC puts on the control itself. */
export const MIN_LICZBY_KADRY = 0;
export const MAKS_LICZBY_KADRY = 99;

/** Exactly the shape src/lib/content/o-nas.json holds. */
export interface WartoscONas {
	tytul: string;
	opis: string;
}

export interface ONasDane {
	placeholder: boolean;
	lead: string;
	misja: string;
	wartosci: WartoscONas[];
	kadra_opis: string;
	kadra_opiekunki: number;
	kadra_personel: number;
	obiekt_opis: string;
}

/**
 * What a validated O nas submission carries.
 *
 * NO PENDING PICTURES ANY MORE (Plan 05-07). This screen writes exactly one file, the JSON,
 * so the success arm is the stored content and nothing else; the gallery validator is the
 * one that still hands its route a list of files to write beside its store.
 */
export type WynikONas = { ok: true; dane: ONasDane } | { ok: false; pola: Record<string, string> };

/** Required text, with the two refusals the UI-SPEC error table distinguishes. */
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
 * Read one submitted O nas page.
 *
 * TAKES NO SET OF EXISTING FILENAMES ANY MORE (Plan 05-07). It used to, because it had to
 * name a new facility photograph without colliding with a file the build already carries;
 * that argument moved to `walidujGaleria` with the photographs themselves.
 *
 * Every field is read before anything is refused (Contract 10a: one summary, every
 * offending control linked).
 */
export function walidujONas(zrodlo: ZrodloPol): WynikONas {
	const pola: Record<string, string> = {};

	const lead = czytajWymagany(zrodlo.get(POLE_LEAD), MAKS_LEAD, KOPIA_WALIDACJA.trescBrak);
	if (lead.blad !== undefined) pola[POLE_LEAD] = lead.blad;

	const misja = czytajWymagany(zrodlo.get(POLE_MISJI), MAKS_AKAPITU, KOPIA_WALIDACJA.trescBrak);
	if (misja.blad !== undefined) pola[POLE_MISJI] = misja.blad;

	// ---------------------------------------------------------------------------
	// Wartości: a repeated pair of required fields. ONE message per broken row, keyed to
	// the field that is missing, because the UI-SPEC sentence names both halves already
	// („Uzupełnij tytuł i opis tej wartości albo usuń ją") and two summary entries saying
	// the identical thing about one card is noise the editor has to read twice.
	// ---------------------------------------------------------------------------
	const surowe_wartosci = zbierzIndeksowane(zrodlo, PREFIKS_WARTOSCI, [POLE_TYTULU, POLE_OPISU]);
	const wartosci: WartoscONas[] = [];
	for (let i = 0; i < surowe_wartosci.length; i++) {
		const tytul = czytajWymagany(
			surowe_wartosci[i][POLE_TYTULU],
			MAKS_TYTULU_WARTOSCI,
			KOPIA_WALIDACJA.wartoscNiepelna
		);
		const opis = czytajWymagany(
			surowe_wartosci[i][POLE_OPISU],
			MAKS_OPISU_WARTOSCI,
			KOPIA_WALIDACJA.wartoscNiepelna
		);
		if (tytul.blad !== undefined) pola[nazwaPola(PREFIKS_WARTOSCI, i, POLE_TYTULU)] = tytul.blad;
		else if (opis.blad !== undefined) pola[nazwaPola(PREFIKS_WARTOSCI, i, POLE_OPISU)] = opis.blad;

		if (tytul.wartosc === null || opis.wartosc === null) continue;
		const wartosc: Partial<WartoscONas> = {};
		wartosc.tytul = tytul.wartosc;
		wartosc.opis = opis.wartosc;
		wartosci.push(wartosc as WartoscONas);
	}

	const kadraOpis = czytajWymagany(
		zrodlo.get(POLE_KADRY_OPIS),
		MAKS_AKAPITU,
		KOPIA_WALIDACJA.trescBrak
	);
	if (kadraOpis.blad !== undefined) pola[POLE_KADRY_OPIS] = kadraOpis.blad;

	const opiekunki = liczbaWZakresie(
		zrodlo.get(POLE_KADRY_OPIEKUNKI),
		MIN_LICZBY_KADRY,
		MAKS_LICZBY_KADRY
	);
	if (opiekunki === null) pola[POLE_KADRY_OPIEKUNKI] = KOPIA_WALIDACJA.liczbaNiepoprawna;

	const personel = liczbaWZakresie(
		zrodlo.get(POLE_KADRY_PERSONEL),
		MIN_LICZBY_KADRY,
		MAKS_LICZBY_KADRY
	);
	if (personel === null) pola[POLE_KADRY_PERSONEL] = KOPIA_WALIDACJA.liczbaNiepoprawna;

	const obiektOpis = czytajWymagany(
		zrodlo.get(POLE_OBIEKTU_OPIS),
		MAKS_AKAPITU,
		KOPIA_WALIDACJA.trescBrak
	);
	if (obiektOpis.blad !== undefined) pola[POLE_OBIEKTU_OPIS] = obiektOpis.blad;

	// One refusal point. Each required value adds a key above when it is missing, so a null
	// here always travels with a non-empty map.
	if (
		lead.wartosc === null ||
		misja.wartosc === null ||
		kadraOpis.wartosc === null ||
		obiektOpis.wartosc === null ||
		opiekunki === null ||
		personel === null
	) {
		return { ok: false, pola };
	}
	if (Object.keys(pola).length > 0) return { ok: false, pola };

	// KEY BY KEY, in the order src/lib/content/o-nas.json uses: placeholder, lead, misja,
	// wartosci, kadra_opis, kadra_opiekunki, kadra_personel, obiekt_opis.
	const dane: Partial<ONasDane> = {};
	dane.placeholder = flaga(zrodlo.get(POLE_ZASTEPCZA));
	dane.lead = lead.wartosc;
	dane.misja = misja.wartosc;
	dane.wartosci = wartosci;
	dane.kadra_opis = kadraOpis.wartosc;
	dane.kadra_opiekunki = opiekunki;
	dane.kadra_personel = personel;
	dane.obiekt_opis = obiektOpis.wartosc;

	return { ok: true, dane: dane as ONasDane };
}
