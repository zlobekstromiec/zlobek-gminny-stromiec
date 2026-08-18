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
// THE STAFF COUNTS ARE GONE (2026-08-18) and a LIST OF PEOPLE stands where they stood.
// They were two numbers, `kadra_opiekunki` and `kadra_personel`, rendered on the public page
// as tiles beside a list of the same four people, so a reader met „four names" and „3" on one
// screen and had to work out that the dyrektor is not an opiekunka. Removing only the tiles
// would have left two controls here that an editor can change and save with no visible
// effect, so the fields went and the list itself replaced them. The żłobek can now add a hire
// from the panel instead of asking for a pull request.
//
// THE ROLE FIELD IS OPTIONAL AND THAT IS THE WHOLE POINT OF ITS READER. Three states have to
// stay distinguishable: nothing typed (fine, stored as an empty string), something too long
// (a refusal the editor must see) and a real value. `tekstOpcjonalny` is exactly that
// three-way answer; `tekstWymagany` would turn „nothing typed" into a refusal and force every
// opiekunka to carry a redundant „opiekunka" label.
//
// EVERY READER REJECTS, NONE REPAIRS, and the result is built KEY BY KEY from guarded
// locals, never by spreading the submitted data.
//
// Pure apart from the shared readers and the copy module: no fetch, no I/O, no clock.
// Nothing here logs.
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import {
	POLE_IMIENIA,
	POLE_KADRY_OPIS,
	POLE_LEAD,
	POLE_MISJI,
	POLE_OBIEKTU_OPIS,
	POLE_OPISU,
	POLE_ROLI,
	POLE_TYTULU,
	POLE_ZASTEPCZA,
	PREFIKS_KADRY,
	PREFIKS_WARTOSCI,
	nazwaPola,
	zbierzIndeksowane,
	type ZrodloPol
} from '../../../pola-strony.ts';
import { BLAD_ZBYT_DLUGI, flaga, kodBledu, tekstOpcjonalny, tekstWymagany } from './pola.ts';

// Re-exported so a server caller keeps importing the whole vocabulary from the validator
// beside it while exactly one declaration exists.
export {
	POLE_IMIENIA,
	POLE_KADRY_OPIS,
	POLE_LEAD,
	POLE_MISJI,
	POLE_OBIEKTU_OPIS,
	POLE_OPISU,
	POLE_ROLI,
	POLE_TYTULU,
	POLE_ZASTEPCZA,
	PREFIKS_KADRY,
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
/** One person's name. Generous: Polish double-barrelled surnames with a title in front
 *  run long, and refusing a real name is a worse failure than storing a slightly long one. */
export const MAKS_IMIENIA = 80;
/** One person's role. Short by design: this field holds „Dyrektor", not a job description. */
export const MAKS_ROLI = 40;

/** Exactly the shape src/lib/content/o-nas.json holds. */
export interface WartoscONas {
	tytul: string;
	opis: string;
}

/** One entry of the staff list.
 *
 *  `rola` IS OPTIONAL CONTENT BUT NEVER AN OPTIONAL KEY. Every entry carries it, empty when
 *  the editor typed nothing, so the stored file has one shape rather than two and the public
 *  page's `{#if osoba.rola}` decides on a value rather than on a key's existence. */
export interface OsobaKadry {
	imie: string;
	rola: string;
}

export interface ONasDane {
	placeholder: boolean;
	lead: string;
	misja: string;
	wartosci: WartoscONas[];
	kadra_opis: string;
	kadra: OsobaKadry[];
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

	// ---------------------------------------------------------------------------
	// Kadra: the second repeated group (2026-08-18). ONE required field per row, the name,
	// so unlike the wartości loop above there is no „first error wins" branch to write:
	// there is only one error a row can carry.
	//
	// The role is OPTIONAL and is read through the plain length guard rather than the
	// required-text one, because empty is a legitimate answer here and must not become a
	// refusal. It is still capped: an unbounded field on a screen that commits to a public
	// repository is a field somebody will eventually paste an essay into.
	// ---------------------------------------------------------------------------
	const suroweOsoby = zbierzIndeksowane(zrodlo, PREFIKS_KADRY, [POLE_IMIENIA, POLE_ROLI]);
	const kadra: OsobaKadry[] = [];
	for (let i = 0; i < suroweOsoby.length; i++) {
		const imie = czytajWymagany(
			suroweOsoby[i][POLE_IMIENIA],
			MAKS_IMIENIA,
			KOPIA_WALIDACJA.osobaBezImienia
		);
		if (imie.blad !== undefined) pola[nazwaPola(PREFIKS_KADRY, i, POLE_IMIENIA)] = imie.blad;

		// THREE STATES, NOT TWO: undefined is „left empty" and is accepted, null is „too long"
		// and is refused. Collapsing them would let an over-long role vanish silently on save.
		const rola = tekstOpcjonalny(suroweOsoby[i][POLE_ROLI], MAKS_ROLI);
		if (rola === null) pola[nazwaPola(PREFIKS_KADRY, i, POLE_ROLI)] = tekstZaDlugi(MAKS_ROLI);

		if (imie.wartosc === null || rola === null) continue;
		// KEY BY KEY, in the order the committed file uses. An empty role is stored as an
		// empty STRING rather than omitted, so every entry in the file has one shape.
		const osoba: Partial<OsobaKadry> = {};
		osoba.imie = imie.wartosc;
		osoba.rola = rola ?? '';
		kadra.push(osoba as OsobaKadry);
	}

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
		obiektOpis.wartosc === null
	) {
		return { ok: false, pola };
	}
	if (Object.keys(pola).length > 0) return { ok: false, pola };

	// KEY BY KEY, in the order src/lib/content/o-nas.json uses: placeholder, lead, misja,
	// wartosci, kadra_opis, kadra, obiekt_opis.
	const dane: Partial<ONasDane> = {};
	dane.placeholder = flaga(zrodlo.get(POLE_ZASTEPCZA));
	dane.lead = lead.wartosc;
	dane.misja = misja.wartosc;
	dane.wartosci = wartosci;
	dane.kadra_opis = kadraOpis.wartosc;
	dane.kadra = kadra;
	dane.obiekt_opis = obiektOpis.wartosc;

	return { ok: true, dane: dane as ONasDane };
}
