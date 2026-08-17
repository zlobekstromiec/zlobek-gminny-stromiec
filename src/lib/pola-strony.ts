// The WIRE VOCABULARY of the singleton editor screens: O nas and Plan dnia (Phase 04.1,
// Plan 04.1-09) and Cennik (Phase 05, Plan 05-05), plus the indexed-field primitive the
// first two are built on.
//
// WHY IT IS NOT INSIDE THE VALIDATORS. The fifth occurrence in this phase of the boundary
// src/lib/stan-naboru.ts, src/lib/daty.ts, src/lib/zdjecia.ts, src/lib/pola-wpisu.ts and
// src/lib/pola-dokumentu.ts each record: the validators live under src/lib/server/, and
// SvelteKit refuses at build time to bundle that directory into client code. The page
// rendering a repeated row has to emit the identical control names the action reads back,
// and a rename that only half landed would post one name to an action reading another:
// the save would refuse a field the editor had filled in and tell them to complete
// something they had already completed.
//
// THE INDEXED NAME IS THE WHOLE DESIGN OF THE REPEATABLE GROUPS (UI-SPEC Component
// Contract 7, D-17). Adding and removing a row are server round trips, because that is the
// only shape that works with scripting switched off, so a row has to survive the trip. It
// survives as its POSITION and as nothing else: `wiersz[2].godziny` says „the third row's
// hours", it names no file, no record and no identity, and the collector below turns the
// submitted set into a dense ordered array so a gap in the numbering cannot become a hole
// in the saved content (threat T-04.1-34).
//
// The stored JSON keys of day-plan.json (`rows`, `time`, `what`) are deliberately NOT
// reused as control names. They are the only English identifiers in the two files and they
// predate this phase; the panel's own vocabulary is Polish, and the validator is the one
// place the two meet.
//
// This module carries NO visible string: nothing here is ever rendered to an editor. The
// Polish labels and hints live in src/lib/content/panel.ts and are swept by
// tests/admin-copy.unit.ts.
//
// Pure: no I/O, no clock, no framework import. Safe on both sides of the boundary.
import { POLE_SHA, POLE_ZASTEPCZA, ZNACZNIK_ZAPISANO, type ZrodloPol } from './pola-wpisu.ts';

// Imported and re-exported rather than retyped, exactly as src/lib/pola-dokumentu.ts does
// with the same three: the head SHA field, the placeholder checkbox and the saved marker
// mean the same thing on every writing screen, so exactly one declaration of each exists.
export { POLE_SHA, POLE_ZASTEPCZA, ZNACZNIK_ZAPISANO };
export type { ZrodloPol };

/** Plan dnia: one row of the day plan. */
export const PREFIKS_WIERSZA = 'wiersz';
export const POLE_GODZIN = 'godziny';
/** Shared by a day-plan row and a wartość, because in both places it is the same control
 *  with the same meaning: the descriptive half of a two-field row. */
export const POLE_OPISU = 'opis';

/** O nas: one wartość. */
export const PREFIKS_WARTOSCI = 'wartosc';
export const POLE_TYTULU = 'tytul';

/** O nas: one facility photo. Four names per item, which is why the island took them as
 *  props in Plan 07 instead of hard-coding them: here they are index scoped. */
export const PREFIKS_ZDJECIA = 'zdjecie';
/** The basename the photo already has in the repository, carried back so a save that
 *  changes only the alt keeps the picture (P-20). */
export const POLE_PLIKU = 'plik';
export const POLE_ALTU = 'alt';
/** The prepared data URL the island writes, present only for a photo chosen on this visit. */
export const POLE_DANYCH = 'dane';
/** „Usuń zdjęcie" inside the island: the editor cleared the picture of an item that keeps
 *  its place in the list. Not the same instruction as „Usuń to zdjęcie", which removes the
 *  whole item, and the two cannot share a field. */
export const POLE_USUNIECIA = 'usun';

/** O nas: the singleton fields, named after the JSON keys they are stored as so a reader
 *  comparing a control to the committed file needs no translation table. */
export const POLE_LEAD = 'lead';
export const POLE_MISJI = 'misja';
export const POLE_KADRY_OPIS = 'kadra_opis';
export const POLE_KADRY_OPIEKUNKI = 'kadra_opiekunki';
export const POLE_KADRY_PERSONEL = 'kadra_personel';
export const POLE_OBIEKTU_OPIS = 'obiekt_opis';

/** Cennik: the seven controls of 05-UI-SPEC Contract 10, named after the JSON keys of
 *  src/lib/content/cennik.json so a reader comparing a control to the committed file needs
 *  no translation table. That is the same rule the O nas singletons above follow, and here
 *  it is load bearing twice over: the validator constructs its result in the committed
 *  file's key ORDER, and a byte-for-byte pin in tests/admin-walidacja-cennik.unit.ts goes
 *  red if the two ever disagree.
 *
 *  The screen has no repeated group at all, so none of these is index scoped. */
export const POLE_STAWKI = 'stawka';
export const POLE_OBNIZKI = 'obnizka';
export const POLE_NAGLOWKA = 'naglowek';
export const POLE_KWOTY_OPIS = 'kwotaOpis';
export const POLE_ZUS = 'zus';
export const POLE_WYZYWIENIA = 'wyzywienie';
export const POLE_NIEOBECNOSCI = 'nieobecnosc';

/** `name` of the remove button, whose `value` is the POSITION of the row it sits in. */
export const POLE_INDEKSU = 'indeks';

/** Names of the add and remove actions, so the page's `formaction` and the action table in
 *  the route cannot drift apart. Named actions rather than a default one: SvelteKit
 *  forbids mixing the two on one page, so the save is named here as well. */
export const AKCJA_ZAPISU = '?/zapisz';
export const AKCJA_DODANIA_WIERSZA = '?/dodajWiersz';
export const AKCJA_USUNIECIA_WIERSZA = '?/usunWiersz';
export const AKCJA_DODANIA_WARTOSCI = '?/dodajWartosc';
export const AKCJA_USUNIECIA_WARTOSCI = '?/usunWartosc';
export const AKCJA_DODANIA_ZDJECIA = '?/dodajZdjecie';
export const AKCJA_USUNIECIA_ZDJECIA = '?/usunZdjecie';

/** Names of the two REORDER actions (05-UI-SPEC Contract 9, 05 D-22).
 *
 *  One pair for both screens rather than a pair per list, unlike the add and remove names
 *  above. Those need a suffix because the O nas screen carries TWO repeatable lists and one
 *  action table, so `?/dodajWartosc` and `?/dodajZdjecie` have to be different words.
 *  Reordering is opted into by exactly ONE list per screen (the O nas photos, the plan-dnia
 *  rows), so a single unsuffixed pair names an unambiguous action on each of them, and a
 *  screen that later opts a second list in would have to say which one it means. */
export const AKCJA_PRZENIESIENIA_W_GORE = '?/przeniesWGore';
export const AKCJA_PRZENIESIENIA_W_DOL = '?/przeniesWDol';

/**
 * Upper bound on the number of items in one repeated group.
 *
 * It is a work bound rather than an editorial rule: the collector below reads a fixed
 * number of indices whatever arrives, so a hand-built request naming index 900 costs the
 * same as one naming index 3. The real day plan has seven rows and the real o nas page has
 * four wartości and two photos, so this is roughly four times the largest plausible list
 * and still small enough that reading it is free.
 */
export const MAKS_ELEMENTOW = 30;

/** The control name of one field of one item. The one place this shape is spelled out. */
export function nazwaPola(prefiks: string, indeks: number, pole: string): string {
	return `${prefiks}[${indeks}].${pole}`;
}

/** The DOM id of the same control.
 *
 *  Deliberately not the name: the validation summary links to `#id`, and a fragment
 *  carrying brackets and a dot would have to be escaped in both the href and every
 *  selector that ever looks for it. Hyphens are the same information with none of that. */
export function idPola(prefiks: string, indeks: number, pole: string): string {
	return `${prefiks}-${indeks}-${pole}`;
}

/** The id the photo island of item `indeks` is mounted with. The island derives its file
 *  control (`-plik`) and its description field (`-alt`) from it, so the summary can link to
 *  either without the page guessing at the island's internals. */
export function idWyspyZdjecia(indeks: number): string {
	return `${PREFIKS_ZDJECIA}-${indeks}`;
}

/**
 * Read `prefiks[i].klucz` fields into a DENSE ordered array.
 *
 * A row is present when at least one of its keys ARRIVED, which is not the same as „is not
 * empty": every control of a rendered row posts, even after the editor clears it, so an
 * emptied row is still a row and comes back as a validation error rather than silently
 * disappearing. A row nobody rendered posts nothing at all and is simply absent.
 *
 * DENSE IS THE MITIGATION, not a convenience (T-04.1-34). The index arrives from the
 * client. It is never used to build a path, to select a record or to decide an identity:
 * it only orders the values within this one submission, and a request naming 0 and 5 and
 * nothing between them yields two rows, not six, and not an array with four holes in it.
 */
export function zbierzIndeksowane(
	zrodlo: ZrodloPol,
	prefiks: string,
	klucze: readonly string[],
	maks: number = MAKS_ELEMENTOW
): Record<string, unknown>[] {
	const zebrane: Record<string, unknown>[] = [];
	for (let i = 0; i < maks; i++) {
		const wiersz: Record<string, unknown> = {};
		let obecny = false;
		for (const klucz of klucze) {
			const wartosc = zrodlo.get(nazwaPola(prefiks, i, klucz));
			if (wartosc !== null && wartosc !== undefined) obecny = true;
			wiersz[klucz] = wartosc;
		}
		if (obecny) zebrane.push(wiersz);
	}
	return zebrane;
}

/** A submitted value as a string. A missing key, a null and a file part all become the
 *  empty string, which is what a control renders as „nothing typed here". */
function tekst(surowy: unknown): string {
	return typeof surowy === 'string' ? surowy : '';
}

/** An unticked checkbox omits its key entirely, the HTML convention the server readers
 *  follow too: absent is false and never an error. */
function zaznaczone(zrodlo: ZrodloPol, nazwa: string): boolean {
	const wartosc = zrodlo.get(nazwa);
	return wartosc !== null && wartosc !== undefined;
}

/** One row of the day plan, as strings, exactly as it was submitted or as it is stored. */
export interface WierszEcha {
	godziny: string;
	opis: string;
}

/** One wartość, same contract. */
export interface WartoscEcha {
	tytul: string;
	opis: string;
}

/** One facility photo, same contract. `usunieto` is echoed rather than inferred from an
 *  emptied basename: a refused save that forgot it would republish the picture on the next
 *  attempt, or leave the file behind with nothing pointing at it. */
export interface ZdjecieEcha {
	plik: string;
	alt: string;
	dane: string;
	usunieto: boolean;
}

/**
 * The ECHO shape of the day plan screen, not the stored shape.
 *
 * It exists so a refused save, and every add and every remove, hand the editor back what
 * they typed rather than an empty form (Contract 10c, „every typed value intact"). It is
 * deliberately all strings and never validated: a value that was refused still has to be
 * rendered back into the control that holds it.
 */
export interface WartosciPlanuDnia {
	wiersze: WierszEcha[];
	zastepcza: boolean;
}

export function wartosciPlanuDnia(zrodlo: ZrodloPol): WartosciPlanuDnia {
	return {
		wiersze: zbierzIndeksowane(zrodlo, PREFIKS_WIERSZA, [POLE_GODZIN, POLE_OPISU]).map(
			(wiersz) => ({
				godziny: tekst(wiersz[POLE_GODZIN]),
				opis: tekst(wiersz[POLE_OPISU])
			})
		),
		zastepcza: zaznaczone(zrodlo, POLE_ZASTEPCZA)
	};
}

/** The echo shape of the O nas screen. */
export interface WartosciONas {
	lead: string;
	misja: string;
	wartosci: WartoscEcha[];
	kadraOpis: string;
	kadraOpiekunki: string;
	kadraPersonel: string;
	obiektOpis: string;
	zdjecia: ZdjecieEcha[];
	zastepcza: boolean;
}

export function wartosciONas(zrodlo: ZrodloPol): WartosciONas {
	return {
		lead: tekst(zrodlo.get(POLE_LEAD)),
		misja: tekst(zrodlo.get(POLE_MISJI)),
		wartosci: zbierzIndeksowane(zrodlo, PREFIKS_WARTOSCI, [POLE_TYTULU, POLE_OPISU]).map(
			(wartosc) => ({
				tytul: tekst(wartosc[POLE_TYTULU]),
				opis: tekst(wartosc[POLE_OPISU])
			})
		),
		kadraOpis: tekst(zrodlo.get(POLE_KADRY_OPIS)),
		kadraOpiekunki: tekst(zrodlo.get(POLE_KADRY_OPIEKUNKI)),
		kadraPersonel: tekst(zrodlo.get(POLE_KADRY_PERSONEL)),
		obiektOpis: tekst(zrodlo.get(POLE_OBIEKTU_OPIS)),
		zdjecia: zbierzIndeksowane(zrodlo, PREFIKS_ZDJECIA, [
			POLE_PLIKU,
			POLE_ALTU,
			POLE_DANYCH,
			POLE_USUNIECIA
		]).map((zdjecie) => ({
			plik: tekst(zdjecie[POLE_PLIKU]),
			alt: tekst(zdjecie[POLE_ALTU]),
			dane: tekst(zdjecie[POLE_DANYCH]),
			usunieto: tekst(zdjecie[POLE_USUNIECIA]).length > 0
		})),
		zastepcza: zaznaczone(zrodlo, POLE_ZASTEPCZA)
	};
}

/**
 * The echo shape of the Cennik screen (05-UI-SPEC Contract 10).
 *
 * ALL STRINGS, INCLUDING THE TWO AMOUNTS, for the same reason `wartosciONas` echoes the two
 * kadra counts as strings: a value the server refused still has to be rendered back into
 * the control that holds it, and „2337abc" is not a number. Parsing here would either throw
 * away what the editor typed or invent a number they did not, and both of those are how a
 * refused save quietly loses work (Contract 10c: every typed value intact).
 */
export interface WartosciCennika {
	stawka: string;
	obnizka: string;
	naglowek: string;
	kwotaOpis: string;
	zus: string;
	wyzywienie: string;
	nieobecnosc: string;
	zastepcza: boolean;
}

export function wartosciCennika(zrodlo: ZrodloPol): WartosciCennika {
	return {
		stawka: tekst(zrodlo.get(POLE_STAWKI)),
		obnizka: tekst(zrodlo.get(POLE_OBNIZKI)),
		naglowek: tekst(zrodlo.get(POLE_NAGLOWKA)),
		kwotaOpis: tekst(zrodlo.get(POLE_KWOTY_OPIS)),
		zus: tekst(zrodlo.get(POLE_ZUS)),
		wyzywienie: tekst(zrodlo.get(POLE_WYZYWIENIA)),
		nieobecnosc: tekst(zrodlo.get(POLE_NIEOBECNOSCI)),
		zastepcza: zaznaczone(zrodlo, POLE_ZASTEPCZA)
	};
}

/** The position a remove OR A MOVE button asked for, or null. Read through the same bounds
 *  the collector uses, so an index outside the group can only ever mean „remove nothing" or
 *  „move nothing".
 *
 *  The two move actions of 05 D-22 reuse this unchanged rather than getting a bounding
 *  function of their own. The index a move button posts is untrusted input in exactly the
 *  same way a remove button's is, and this function already bounds it against the DENSE
 *  array the collector built from the fields that ACTUALLY ARRIVED, which is the existing
 *  mitigation for threat T-04.1-34. A second implementation would be that same threat with
 *  a second chance to get it wrong. */
export function indeksZadania(surowy: unknown, ile: number): number | null {
	if (typeof surowy !== 'string') return null;
	if (!/^[0-9]{1,3}$/.test(surowy.trim())) return null;
	const indeks = Number.parseInt(surowy.trim(), 10);
	return indeks >= 0 && indeks < ile ? indeks : null;
}

/** Where the page should put focus after an add or a remove (UI-SPEC Contract 7).
 *
 *  A FRESH OBJECT PER RESPONSE, which is what lets the group component tell one answer
 *  from the next: the attribute half of the focus move works only on a document the
 *  browser has just parsed, so the hydrated half has to run again on every answer, even
 *  when the destination is the same button as last time. */
/** Which way an item was moved. Named rather than a boolean, because the group component
 *  has to pick one of two BUTTONS from it and „true means up" is a comment waiting to rot. */
export type KierunekPrzeniesienia = 'gora' | 'dol';

export type ZadanieFokusu =
	/** The first control of the item at this position, which is the row that was just added. */
	| { cel: 'element'; indeks: number }
	/** The add button, which is where focus goes when the item it was in stops existing. */
	| { cel: 'dodaj' }
	/** The move BUTTON of the item now at this position, in this direction (05-UI-SPEC
	 *  Contract 9's focus rule).
	 *
	 *  Deliberately NOT the `element` variant with a new index. The effect that variant
	 *  drives focuses the item's first form CONTROL, and the selector it uses excludes
	 *  `<button>` by construction, on purpose, so that an add never focuses a hidden field.
	 *  Reusing it would silently put focus in the caption input after a move, and the second
	 *  press of „Przenieś wyżej" would then move nothing at all: the precise failure the
	 *  contract's focus rule exists to prevent.
	 *
	 *  The index is the item's NEW position, because that is where the editor's next press
	 *  has to land. The direction is carried because the button to focus is the one that
	 *  performed the move, and when it has become disabled (the item reached an end) the
	 *  group falls back to the opposite-direction button of the same item. */
	| { cel: 'przenies'; indeks: number; kierunek: KierunekPrzeniesienia };
