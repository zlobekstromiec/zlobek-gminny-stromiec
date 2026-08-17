// The Galeria validator (Phase 05, Plan 05-06; GALLERY-02, 05 D-21 to D-26; threats
// T-05-06-01, T-05-06-03, T-05-06-05, T-05-06-06).
//
// WHAT THIS FILE IS ACCOUNTABLE TO: src/lib/content/galeria.json, which a prerendered public
// page and the panel's own pulpit both read. The key set and the key order below are copied
// from the committed file, and tests/admin-walidacja-galeria.unit.ts asserts that against the
// real file rather than against a description of it, bytes included.
//
// THE TWO-PASS NAME RESERVATION IS REPRODUCED FROM ./o-nas.ts, NOT SHARED WITH IT, for the
// same reason the ownership rule in ../uploads.ts is reproduced rather than parameterised: the
// branch is the thing that decides which file a photograph is written to, and one generic copy
// would let a single careless edit change that decision for two screens at once. The gallery's
// version differs in two places anyway, and both differences are the point: it derives the
// name from the CAPTION rather than from the alt, and it has one more required field.
//
// THREE RULES LIVE HERE THAT NO SHARED READER CAN EXPRESS:
//
//  1. The twelve-photo cap (05 D-23), which is an EDITORIAL bound and not the work bound
//     MAKS_ELEMENTOW. The screen stops rendering the add button at the limit, but that is an
//     affordance: this is the check that answers a submission carrying thirteen anyway.
//  2. The caption is required on every item (05 D-25). It is the string the public page prints
//     under the picture, and it is also what the generated filename is derived from.
//  3. The alt is required whenever there is a picture at all (04.1 D-15), ON THE SERVER, which
//     is the only version of that rule the Deklaracja dostępności can rest on.
//
// EVERY VALUE THIS READS IS UNTRUSTED INPUT even though the person who sent it is
// authenticated, and one of them decides a path inside the repository. Staff never type a
// filename: the name is GENERATED from the caption in ../uploads.ts, against the set of names
// already taken, which arrives as an ARGUMENT rather than being read here. That keeps this
// module pure and every naming branch drivable under a plain test runner with no build and no
// browser.
//
// EVERY READER REJECTS, NONE REPAIRS, and the result is built KEY BY KEY from guarded locals,
// never by spreading the submitted data.
//
// Pure apart from the shared readers, the copy module and the two upload helpers: no fetch, no
// I/O, no clock. Nothing here logs, on any path.
//
// The relative imports carry an explicit `.ts` extension because
// tests/admin-walidacja-galeria.unit.ts loads this module directly under bare `node --test`,
// where the framework's path alias does not exist. Reaching for that alias here would make the
// whole validator undrivable without a browser.
import { KOPIA_WALIDACJA, tekstZaDlugi } from '../../../content/panel.ts';
import {
	MAKS_ZDJEC_GALERII,
	POLE_ALTU,
	POLE_DANYCH,
	POLE_PLIKU,
	POLE_PODPISU,
	POLE_USUNIECIA,
	POLE_ZASTEPCZA,
	PREFIKS_ZDJECIA_GALERII,
	nazwaPola,
	zbierzIndeksowane,
	type ZrodloPol
} from '../../../pola-strony.ts';
import { base64ZDataUrl, zaDuzeZdjecie } from '../obraz.ts';
import { PREFIKS_GALERII, bezpiecznaNazwaOkladki, nazwaZdjeciaGalerii } from '../uploads.ts';
import { MAKS_ALT } from './aktualnosci.ts';
import { BLAD_ZBYT_DLUGI, flaga, kodBledu, pusty, tekstOpcjonalny, tekstWymagany } from './pola.ts';

// Re-exported so a server caller keeps importing the whole vocabulary from the validator
// beside it while exactly one declaration exists.
export {
	MAKS_ZDJEC_GALERII,
	POLE_ALTU,
	POLE_DANYCH,
	POLE_PLIKU,
	POLE_PODPISU,
	POLE_USUNIECIA,
	POLE_ZASTEPCZA,
	PREFIKS_ZDJECIA_GALERII
};
// The alt cap is the aktualność one, imported rather than declared a third time: the same
// sentence describes the same kind of picture for the same readers.
export { MAKS_ALT };

/** Repository path of the one file this screen writes. Exported and pinned against the
 *  filesystem in the unit suite: a save that wrote a path nothing reads would report success to
 *  the editor, produce a real commit and a real Cloudflare build, and change nothing a parent
 *  can see. That failure is silent in every single layer. */
export const SCIEZKA_GALERIA = 'src/lib/content/galeria.json';

/** The visible caption. Short by intent: it is a room name printed under a tile, and the cap is
 *  what stops a pasted paragraph from becoming both the caption and the filename core. Named
 *  rather than inlined, because the refusal an editor reads quotes the cap the server actually
 *  enforced (T-04.1-26). */
export const MAKS_PODPISU = 80;

/** Exactly the shape one entry of src/lib/content/galeria.json holds, in its key order. */
export interface ZdjecieGaleriiDane {
	plik: string;
	podpis: string;
	alt: string;
}

/** Exactly the shape src/lib/content/galeria.json holds, in its key order. */
export interface GaleriaDane {
	placeholder: boolean;
	zdjecia: ZdjecieGaleriiDane[];
}

/** A picture that arrived on this submission and still has to be written. The name is already
 *  decided, so the route composes no filename of its own. */
export interface NoweZdjecieGalerii {
	/** Basename inside the uploads directory, generated by `nazwaZdjeciaGalerii` or reused in
	 *  place (04.1 P-21). */
	nazwa: string;
	/** The base64 payload, already stripped of its prefix and never decoded. */
	base64: string;
}

/** What a validated Galeria submission carries. The success arm widens the stored content with
 *  the pending pictures, because those are not stored content yet: they are extra files the
 *  route has to commit in the SAME tree as the JSON (04.1 D-07). */
export type WynikGalerii =
	| { ok: true; dane: GaleriaDane; zdjecia: NoweZdjecieGalerii[] }
	| { ok: false; pola: Record<string, string> };

/** Required text, with the two refusals the error table distinguishes: „nothing here" and „too
 *  long", the second one quoting the cap that was actually enforced. Same helper shape as
 *  `czytajWymagany` in ./o-nas.ts. */
function czytajPodpis(surowy: unknown): { wartosc: string | null; blad?: string } {
	const wartosc = tekstWymagany(surowy, MAKS_PODPISU);
	if (wartosc !== null) return { wartosc };
	return {
		wartosc: null,
		blad:
			kodBledu(surowy, wartosc, MAKS_PODPISU) === BLAD_ZBYT_DLUGI
				? tekstZaDlugi(MAKS_PODPISU)
				: KOPIA_WALIDACJA.podpisBrak
	};
}

/**
 * Read one submitted gallery.
 *
 * `zajete` is every basename that must not be handed to a new picture: the names present in the
 * build the panel is running on. It arrives as an argument rather than being read here so this
 * module touches no build-time glob. The names of the pictures KEPT by this submission are
 * added to it as they are admitted, so two new photographs sharing a caption cannot be given
 * one name and one file.
 *
 * EVERY FIELD IS READ BEFORE ANYTHING IS REFUSED (Contract 10a: one summary, every offending
 * control linked from it).
 */
export function walidujGaleria(zrodlo: ZrodloPol, zajete: ReadonlySet<string>): WynikGalerii {
	const pola: Record<string, string> = {};

	const surowe = zbierzIndeksowane(zrodlo, PREFIKS_ZDJECIA_GALERII, [
		POLE_PLIKU,
		POLE_PODPISU,
		POLE_ALTU,
		POLE_DANYCH,
		POLE_USUNIECIA
	]);

	// D-23, ON THE SERVER AND AUTHORITATIVE. Keyed to the file control of the FIRST item over
	// the limit, so the validation summary links to a control that is really on the page and
	// so the editor is taken to the first photograph they have to deal with rather than to the
	// top of a list of thirteen.
	if (surowe.length > MAKS_ZDJEC_GALERII) {
		pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, MAKS_ZDJEC_GALERII, POLE_DANYCH)] =
			KOPIA_WALIDACJA.limitZdjecPrzekroczony;
	}

	// TWO PASSES OVER THE ITEMS. The first admits the names the submission KEEPS, so the second
	// cannot hand one of them to a new picture. A single pass would let item 2 be named over the
	// file item 5 is still pointing at.
	const wolne = new Set<string>(zajete);
	const stare: (string | undefined | null)[] = surowe.map((zdjecie) => {
		const surowa = zdjecie[POLE_PLIKU];
		if (pusty(surowa)) return undefined;
		const nazwa = bezpiecznaNazwaOkladki(surowa);
		if (nazwa !== null) wolne.add(nazwa);
		return nazwa;
	});

	const zdjecia: ZdjecieGaleriiDane[] = [];
	const noweZdjecia: NoweZdjecieGalerii[] = [];
	for (let i = 0; i < surowe.length; i++) {
		const surowyPlik = stare[i];
		if (surowyPlik === null) {
			pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, i, POLE_PLIKU)] = KOPIA_WALIDACJA.zdjecieZlyTyp;
		}

		const surowyDane = surowe[i][POLE_DANYCH];
		// `undefined` means nothing was chosen, `null` means something arrived and was refused.
		// Collapsing the two would silently drop a picture the editor watched appear in the
		// preview.
		const nowyBase64 = pusty(surowyDane) ? undefined : base64ZDataUrl(surowyDane);
		if (nowyBase64 === null) {
			// Two refusals, two instructions: „shrink it" and „choose a different file" are not
			// interchangeable to the person reading them (WCAG 3.3.3).
			pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, i, POLE_DANYCH)] = zaDuzeZdjecie(surowyDane)
				? KOPIA_WALIDACJA.zdjecieZaDuze
				: KOPIA_WALIDACJA.zdjecieZlyTyp;
		}

		const usuniete = flaga(surowe[i][POLE_USUNIECIA]);
		// A new picture WINS over the flag: choosing a file after pressing „Usuń zdjęcie" is an
		// editor changing their mind, and the island clears the flag when it happens.
		const maNowe = typeof nowyBase64 === 'string';
		const zachowajStare = !maNowe && !usuniete && typeof surowyPlik === 'string';
		const jestZdjecie = maNowe || zachowajStare;
		// An item with no picture at all has nothing to publish. It is reachable in one click
		// („Usuń zdjęcie" inside the control), so it gets an instruction naming BOTH ways out
		// rather than a silent drop, and the gallery's wording says the whole item goes with it.
		if (!jestZdjecie && pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, i, POLE_DANYCH)] === undefined) {
			pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, i, POLE_DANYCH)] = KOPIA_WALIDACJA.zdjecieGaleriiBrak;
		}

		// THE CAPTION IS REQUIRED ON EVERY ITEM, picture or no picture, unlike the alt below.
		// It is the one field an editor can fill in before choosing a file, it is what the
		// generated filename is derived from, and an item that has one is an item somebody
		// meant to keep.
		const podpis = czytajPodpis(surowe[i][POLE_PODPISU]);
		if (podpis.blad !== undefined) {
			pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, i, POLE_PODPISU)] = podpis.blad;
		}

		const alt = tekstOpcjonalny(surowe[i][POLE_ALTU], MAKS_ALT);
		if (jestZdjecie) {
			if (alt === null) {
				pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, i, POLE_ALTU)] = tekstZaDlugi(MAKS_ALT);
			} else if (alt === undefined) {
				pola[nazwaPola(PREFIKS_ZDJECIA_GALERII, i, POLE_ALTU)] = KOPIA_WALIDACJA.altBrak;
			}
		}

		if (!jestZdjecie || typeof alt !== 'string' || podpis.wartosc === null) continue;

		if (maNowe && typeof nowyBase64 === 'string') {
			// P-21 applied to this list: a picture the panel itself named is REPLACED IN PLACE, at
			// the name it already has, so one commit never both writes and removes one path. A
			// name the panel did not generate is never overwritten, because a hand-placed file may
			// be shared: both pictures in this repository today are rendered by a seeded
			// aktualność as well.
			const wMiejscu =
				typeof surowyPlik === 'string' && surowyPlik.startsWith(PREFIKS_GALERII)
					? surowyPlik
					: undefined;
			const nazwa = wMiejscu ?? nazwaZdjeciaGalerii(podpis.wartosc, alt, wolne);
			wolne.add(nazwa);
			noweZdjecia.push({ nazwa, base64: nowyBase64 });
			// KEY BY KEY, in the committed file's order: plik, podpis, alt.
			const zdjecie: ZdjecieGaleriiDane = { plik: nazwa, podpis: podpis.wartosc, alt };
			zdjecia.push(zdjecie);
			continue;
		}

		// Kept: `zachowajStare` is what narrowed the basename to a string.
		if (typeof surowyPlik === 'string') {
			const zdjecie: ZdjecieGaleriiDane = {
				plik: surowyPlik,
				podpis: podpis.wartosc,
				alt
			};
			zdjecia.push(zdjecie);
		}
	}

	// One refusal point. Every reader above records a message when it refuses, so a failure here
	// always travels with a non-empty map, which is the promise the failure arm makes.
	if (Object.keys(pola).length > 0) return { ok: false, pola };

	// KEY BY KEY, in the order src/lib/content/galeria.json uses: placeholder, zdjecia.
	const dane: GaleriaDane = {
		placeholder: flaga(zrodlo.get(POLE_ZASTEPCZA)),
		zdjecia
	};

	return { ok: true, dane, zdjecia: noweZdjecia };
}
