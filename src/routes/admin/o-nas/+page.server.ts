// The O nas editor (CMS-02, D-07, D-10, D-11, D-13, D-15, D-17, P-25, P-26;
// 04.1-UI-SPEC Component Contracts 5, 6, 7, 8, 9 and 10). The largest editor in the phase:
// two narrative fields, two repeated lists, two numbers and a photo group, and exactly ONE
// commit for all of it.
//
// SIX OF THE SEVEN ACTIONS BELOW NEVER TOUCH GIT. The two add, the two remove and the two
// move actions read what was typed, change the LENGTH or the ORDER of one list and render
// the form again. They mint no token, they call no orchestrator, they write no blob and
// they produce no Cloudflare build (P-26). Only `zapisz` writes, and it calls the
// orchestrator exactly once, which is what makes D-11's „one page, one save, one commit"
// true however long the session was.
//
// THE JSON AND EVERY PENDING PICTURE TRAVEL IN ONE TREE (D-07). Two commits would be two
// builds, roughly four minutes, and a window in which the page lists a photograph nobody
// can load. The file list is built once, here, and handed over in one call.
//
// NAMED ACTIONS ONLY, INCLUDING THE SAVE: SvelteKit forbids mixing a default action with
// named ones, because posting to a named action without a redirect leaves the query
// parameter in the URL and the next default post would silently run the previous named
// action.
//
// THE HEAD SHA TRAVELS IN THE FORM, not in whatever the load last read (D-10). Adding a
// wartość is a round trip, the load runs again on the way back, and taking the fresh answer
// would quietly move the conflict baseline forward.
//
// STAFF NEVER TYPE A FILENAME (D-14, P-25). The name of a new picture is derived from its
// description inside the validator, against the set of names this build already carries,
// and a picture the panel itself named is replaced IN PLACE rather than renamed (P-21).
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not one sentence of content, not on the error
// path.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import oNas from '$lib/content/o-nas.json';
import {
	KOPIA_EKRAN_O_NAS,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	dodanoWiersz,
	przeniesionoWiersz,
	usunietoWiersz
} from '$lib/content/panel';
import {
	POLE_INDEKSU,
	POLE_SHA,
	ZNACZNIK_ZAPISANO,
	indeksZadania,
	wartosciONas,
	type KierunekPrzeniesienia,
	type WartosciONas,
	type ZadanieFokusu
} from '$lib/pola-strony';
import { readAktualnosci } from '$lib/server/aktualnosci';
import type { PlikDoZapisu } from '$lib/server/admin/commit';
import { serializujJson } from '$lib/server/admin/serializuj';
import { istniejaceNazwy, sciezkaOkladki, zdjecieONasDoUsuniecia } from '$lib/server/admin/uploads';
import { walidujONas } from '$lib/server/admin/walidacja/o-nas';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'o-nas';

/** Repository path of the one content file this screen writes. */
const SCIEZKA = 'src/lib/content/o-nas.json';

/** Everything an action hands back to the screen. One flat shape for all five, so the page
 *  reads one object and no branch can forget a member the others set. */
export interface WynikONasEkranu {
	/** Contract 10c: every typed value intact, after a refusal AND after an add or a remove,
	 *  INCLUDING a picture that was prepared but not yet saved. */
	wartosci: WartosciONas;
	/** Field errors keyed by the offending control's own name, indexed for a repeated one. */
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
	konflikt?: boolean;
	/** The two groups announce and move focus independently, because they are two lists and
	 *  an editor who added a wartość must not have focus thrown into the photo list. */
	statusWartosci?: string;
	zadanieWartosci?: ZadanieFokusu;
	statusZdjec?: string;
	zadanieZdjec?: ZadanieFokusu;
	/** The head the form was built from, carried across the round trip. */
	sha?: string;
}

/** The committed page as the form's echo shape. The screen opens on what is on the site. */
function wartosciZPliku(): WartosciONas {
	return {
		lead: oNas.lead,
		misja: oNas.misja,
		wartosci: oNas.wartosci.map((wartosc) => ({ tytul: wartosc.tytul, opis: wartosc.opis })),
		kadraOpis: oNas.kadra_opis,
		kadraOpiekunki: String(oNas.kadra_opiekunki),
		kadraPersonel: String(oNas.kadra_personel),
		obiektOpis: oNas.obiekt_opis,
		zdjecia: oNas.obiekt_zdjecia.map((zdjecie) => ({
			// A BARE BASENAME (P-20), even if a hand-edited file stored a path: the island
			// renders its preview by looking the name up in the same by-name map the public
			// page uses, and the hidden field carries this value back so a save that changes
			// only a sentence keeps the picture.
			plik: zdjecie.plik.split('/').pop() ?? '',
			alt: zdjecie.alt,
			// Nothing is pending and nothing is removed on a fresh load: both only ever come
			// back from a submission the editor made.
			dane: '',
			usunieto: false
		})),
		zastepcza: oNas.placeholder === true
	};
}

export const load: PageServerLoad = async ({ platform, url }) => {
	return {
		wartosci: wartosciZPliku(),
		/** Undefined when the head could not be read, which degrades to „save without the
		 *  conflict check" rather than to „this screen will not open". */
		sha: await aktualnyShaGlowy(platform?.env),
		/** POST then redirect then GET, so a refresh after a save re-runs a harmless read
		 *  instead of committing a second time (Contract 10, D-11). */
		zapisano: url.searchParams.get(ZNACZNIK_ZAPISANO) === '1'
	};
};

function shaZFormularza(dane: FormData): string | undefined {
	const surowy = dane.get(POLE_SHA);
	return typeof surowy === 'string' && surowy.length > 0 ? surowy : undefined;
}

/** Move the photo at the submitted POSITION one place in `kierunek`. Commits nothing and
 *  writes no file: this is the add and remove pair with the list's ORDER changing instead
 *  of its length (05 D-22).
 *
 *  Both move actions go through here rather than being written twice, because the two
 *  differ by one sign and a duplicated off-by-one is the whole failure mode. */
function przeniesZdjecie(dane: FormData, kierunek: KierunekPrzeniesienia): WynikONasEkranu {
	const wartosci = wartosciONas(dane);
	// Bounded against the set that ARRIVED, exactly as the remove action bounds it, so an
	// index outside this very submission can only ever mean „move nothing" (T-04.1-34).
	const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.zdjecia.length);
	const docelowy = indeks === null ? -1 : kierunek === 'gora' ? indeks - 1 : indeks + 1;
	if (indeks === null || docelowy < 0 || docelowy >= wartosci.zdjecia.length) {
		// Already at the requested end, or an index nobody rendered. Answer with the form as
		// it arrived, and say nothing: no move happened, so there is nothing to announce.
		return { wartosci, pola: {}, sha: shaZFormularza(dane) };
	}
	const [przenoszone] = wartosci.zdjecia.splice(indeks, 1);
	wartosci.zdjecia.splice(docelowy, 0, przenoszone);
	return {
		wartosci,
		pola: {},
		statusZdjec: przeniesionoWiersz(indeks + 1, docelowy + 1),
		// A FRESH object naming the NEW position and the direction, which is what lets the
		// group component put focus back on the button that was just pressed.
		zadanieZdjec: { cel: 'przenies', indeks: docelowy, kierunek } satisfies ZadanieFokusu,
		sha: shaZFormularza(dane)
	};
}

export const actions: Actions = {
	/** Append one empty wartość. Commits nothing. */
	dodajWartosc: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciONas(dane);
		wartosci.wartosci.push({ tytul: '', opis: '' });
		const numer = wartosci.wartosci.length;
		return {
			wartosci,
			pola: {},
			statusWartosci: dodanoWiersz(numer),
			zadanieWartosci: { cel: 'element', indeks: numer - 1 } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikONasEkranu;
	},

	/** Remove the wartość at the submitted POSITION. Commits nothing. */
	usunWartosc: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciONas(dane);
		// Bounded against the set that ARRIVED, so the index can only ever name an item of
		// this very submission (T-04.1-34).
		const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.wartosci.length);
		if (indeks === null) {
			return { wartosci, pola: {}, sha: shaZFormularza(dane) } satisfies WynikONasEkranu;
		}
		wartosci.wartosci.splice(indeks, 1);
		return {
			wartosci,
			pola: {},
			statusWartosci: usunietoWiersz(indeks + 1),
			zadanieWartosci: { cel: 'dodaj' } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikONasEkranu;
	},

	/** Append one empty photo item. Commits nothing, and writes no file: an item with no
	 *  picture is refused by the save until the editor chooses one or removes the item. */
	dodajZdjecie: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciONas(dane);
		wartosci.zdjecia.push({ plik: '', alt: '', dane: '', usunieto: false });
		const numer = wartosci.zdjecia.length;
		return {
			wartosci,
			pola: {},
			statusZdjec: dodanoWiersz(numer),
			zadanieZdjec: { cel: 'element', indeks: numer - 1 } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikONasEkranu;
	},

	/** Remove the photo item at the submitted POSITION. Commits nothing and DELETES NOTHING:
	 *  the file leaves the repository only when the save that stops pointing at it runs. */
	usunZdjecie: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciONas(dane);
		const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.zdjecia.length);
		if (indeks === null) {
			return { wartosci, pola: {}, sha: shaZFormularza(dane) } satisfies WynikONasEkranu;
		}
		wartosci.zdjecia.splice(indeks, 1);
		return {
			wartosci,
			pola: {},
			statusZdjec: usunietoWiersz(indeks + 1),
			zadanieZdjec: { cel: 'dodaj' } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikONasEkranu;
	},

	/** Move a photo one place up. Commits nothing; only the ORDER of the echoed list changes,
	 *  and the head SHA travels back in the form so a round trip cannot move the conflict
	 *  baseline forward (D-10). */
	przeniesWGore: async ({ request }) => przeniesZdjecie(await request.formData(), 'gora'),

	przeniesWDol: async ({ request }) => przeniesZdjecie(await request.formData(), 'dol'),

	/** The ONE action that writes, and it writes once. */
	zapisz: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		// Captured BEFORE validation, so every refusal below hands it straight back, the
		// prepared pictures included.
		const wartosci = wartosciONas(dane);

		// The names this build already carries. Read HERE rather than inside the validator,
		// which keeps that module pure and every naming branch drivable under a plain test
		// runner. The answer is the LAST BUILD, which is safe in this direction: a name
		// committed two minutes ago is not in it, and the worst that costs is a numeric
		// suffix on a picture that could have reused a free name.
		const wynik = walidujONas(dane, istniejaceNazwy());
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc,
				sha: shaZFormularza(dane)
			} satisfies WynikONasEkranu);
		}

		// ONE FILE LIST, ONE CALL. The JSON goes FIRST, so a person reading the commit sees
		// the page before its pictures.
		const pliki: PlikDoZapisu[] = [
			{ sciezka: SCIEZKA, tresc: serializujJson(wynik.dane) },
			...wynik.zdjecia.map((zdjecie) => ({
				sciezka: sciezkaOkladki(zdjecie.nazwa),
				// PASSED THROUGH UNCHANGED. The browser produced this encoding while the editor
				// was looking at the preview, and nothing on the server reads, decodes or
				// re-encodes it: see the header of src/lib/server/admin/obraz.ts.
				tresc: zdjecie.base64,
				base64: true
			}))
		];

		// A picture leaves the repository in the SAME commit that stops pointing at it, so
		// the site never carries a file nothing references. `zdjecieONasDoUsuniecia` is what
		// decides whether the file is really this page's to remove: it refuses any name the
		// panel did not generate, because both pictures placed here by hand are rendered by
		// a seeded aktualność as well, and it refuses a name anything still points at.
		const nadalUzywane = [
			...wynik.dane.obiekt_zdjecia.map((zdjecie) => zdjecie.plik),
			...readAktualnosci().map((wpis) => wpis.obraz)
		];
		const usun: string[] = [];
		for (const stare of oNas.obiekt_zdjecia) {
			const doUsuniecia = zdjecieONasDoUsuniecia(stare.plik, nadalUzywane);
			if (doUsuniecia !== null && !usun.includes(doUsuniecia)) usun.push(doUsuniecia);
		}

		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			// The description names the PAGE rather than a field: D-11 makes one page one
			// commit, and a session here can touch nine groups of content at once.
			opis: KOPIA_EKRAN_O_NAS.opisZapisu,
			pliki,
			usun: usun.length > 0 ? usun : undefined,
			oczekiwanySha: shaZFormularza(dane)
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc,
				konflikt: true
			} satisfies WynikONasEkranu);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail zapiszTresc may carry is deliberately NOT rendered.
			return fail(500, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikONasEkranu);
		}

		// 303 rather than 302, so the browser turns the POST into a GET and a refresh can
		// never replay the save (D-11).
		redirect(303, `/admin/o-nas?${ZNACZNIK_ZAPISANO}=1`);
	}
};
