// The Galeria editor (GALLERY-02; 05 D-21 to D-26; 05-UI-SPEC Contracts 8, 9 and 12, and
// 04.1-UI-SPEC Component Contracts 5, 7, 8, 9 and 10). The photo half of the O nas editor,
// moved wholesale onto a store and a screen of its own.
//
// FOUR OF THE FIVE ACTIONS BELOW NEVER TOUCH GIT. The add, the remove and the two move actions
// read what was submitted, change the LENGTH or the ORDER of the list and render the form
// again. They mint no token, they call no orchestrator, they write no blob and they produce no
// Cloudflare build (P-26). Only `zapisz` writes, and it calls the orchestrator exactly once.
//
// THE JSON AND EVERY PENDING PICTURE TRAVEL IN ONE TREE (04.1 D-07). Two commits would be two
// builds, roughly four minutes, and a window in which the page lists a photograph nobody can
// load. That is also why the whole list sits behind ONE „Zapisz" (D-21): twelve photographs in
// one sitting is one commit and one build against a free ceiling of 500 per month, where a
// screen per photograph would be twelve of each.
//
// NAMED ACTIONS ONLY, INCLUDING THE SAVE: SvelteKit forbids mixing a default action with named
// ones, because posting to a named action without a redirect leaves the query parameter in the
// URL and the next default post would silently run the previous named action.
//
// THE HEAD SHA TRAVELS IN THE FORM, not in whatever the load last read (04.1 D-10). Adding a
// photograph is a round trip, the load runs again on the way back, and taking the fresh answer
// would quietly move the conflict baseline forward. The stale-save refusal and its Polish
// conflict panel are REUSED VERBATIM and no behaviour on this screen depends on that leg
// behaving a particular way: it is one of the two untested legs this phase keeps isolated and
// named (05 D-37, 04.1 UAT row B4).
//
// STAFF NEVER TYPE A FILENAME (04.1 D-14, P-25). The name of a new picture is derived from its
// CAPTION inside the validator, against the set of names this build already carries.
//
// THE ONLY WRITER OF THE DELETION LIST IS THE LOOP CALLING `zdjecieGaleriiDoUsuniecia`. That
// function's four conditions are the ownership rule, and a second path from a stored filename
// to a deleted path would be a second, unreviewed answer to „may the panel remove this file".
//
// NO +server.ts LIVES UNDER /admin, HERE OR ANYWHERE, and nothing goes under static/admin/:
// the session gate covers pages and their POSTs by layout inheritance, while Cloudflare Pages
// resolves static assets BEFORE invoking the Worker, so a file there would shadow the panel
// and bypass the gate outright (T-05-06-07).
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at runtime
// on Cloudflare and produces a silent production-only failure, so its name is grep-banned
// across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not one caption, not on the error path.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import galeriaStore from '$lib/content/galeria.json';
import { czytajGalerie } from '$lib/galeria';
import {
	KOPIA_EKRAN_GALERII,
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	dodanoWiersz,
	przeniesionoZdjecie,
	usunietoWiersz
} from '$lib/content/panel';
import {
	POLE_INDEKSU,
	POLE_SHA,
	ZNACZNIK_ZAPISANO,
	indeksZadania,
	wartosciGalerii,
	type KierunekPrzeniesienia,
	type WartosciGalerii,
	type ZadanieFokusu
} from '$lib/pola-strony';
import { bazowaNazwa } from '$lib/zdjecia-nazwy';
import { readAktualnosci } from '$lib/server/aktualnosci';
import type { PlikDoZapisu } from '$lib/server/admin/commit';
import { serializujJson } from '$lib/server/admin/serializuj';
import {
	istniejaceNazwy,
	sciezkaOkladki,
	zdjecieGaleriiDoUsuniecia
} from '$lib/server/admin/uploads';
import { SCIEZKA_GALERIA, walidujGaleria } from '$lib/server/admin/walidacja/galeria';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for 04.1 D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'galeria';

/** Everything an action hands back to the screen. One flat shape for all five, so the page
 *  reads one object and no branch can forget a member the others set. */
export interface WynikGaleriiEkranu {
	/** Contract 10c: every typed value intact, after a refusal AND after an add, a remove or a
	 *  move, INCLUDING a picture that was prepared but not yet saved. */
	wartosci: WartosciGalerii;
	/** Field errors keyed by the offending control's own indexed name. */
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
	konflikt?: boolean;
	status?: string;
	zadanie?: ZadanieFokusu;
	/** The head the form was built from, carried across the round trip. */
	sha?: string;
}

/** The committed gallery as the form's echo shape, read through the SAME reader that feeds the
 *  public page and the pulpit counter, so all three can only ever agree. */
function wartosciZPliku(): WartosciGalerii {
	return {
		zdjecia: czytajGalerie(galeriaStore).map((zdjecie) => ({
			// A BARE BASENAME (04.1 P-20), even if a hand-edited file stored a path: the island
			// renders its preview by looking the name up in the same by-name map the public page
			// uses, and the hidden field carries this value back so a save that changes only a
			// caption keeps the picture.
			plik: bazowaNazwa(zdjecie.plik),
			podpis: zdjecie.podpis,
			alt: zdjecie.alt,
			// Nothing is pending and nothing is removed on a fresh load: both only ever come back
			// from a submission the editor made.
			dane: '',
			usunieto: false
		})),
		zastepcza: galeriaStore.placeholder === true
	};
}

export const load: PageServerLoad = async ({ platform, url }) => {
	return {
		wartosci: wartosciZPliku(),
		/** Undefined when the head could not be read, which degrades to „save without the
		 *  conflict check" rather than to „this screen will not open". */
		sha: await aktualnyShaGlowy(platform?.env),
		/** POST then redirect then GET, so a refresh after a save re-runs a harmless read
		 *  instead of committing a second time (Contract 10, 04.1 D-11). */
		zapisano: url.searchParams.get(ZNACZNIK_ZAPISANO) === '1'
	};
};

function shaZFormularza(dane: FormData): string | undefined {
	const surowy = dane.get(POLE_SHA);
	return typeof surowy === 'string' && surowy.length > 0 ? surowy : undefined;
}

/** Move the photograph at the submitted POSITION one place in `kierunek`. Commits nothing and
 *  writes no file: this is the add and remove pair with the list's ORDER changing instead of
 *  its length (05 D-22).
 *
 *  Both move actions go through here rather than being written twice, because the two differ by
 *  one sign and a duplicated off-by-one is the whole failure mode. */
function przeniesZdjecie(dane: FormData, kierunek: KierunekPrzeniesienia): WynikGaleriiEkranu {
	const wartosci = wartosciGalerii(dane);
	// Bounded against the set that ARRIVED, exactly as the remove action bounds it, so an index
	// outside this very submission can only ever mean „move nothing" (T-04.1-34, T-05-06-03).
	const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.zdjecia.length);
	const docelowy = indeks === null ? -1 : kierunek === 'gora' ? indeks - 1 : indeks + 1;
	if (indeks === null || docelowy < 0 || docelowy >= wartosci.zdjecia.length) {
		// Already at the requested end, or an index nobody rendered. Answer with the form as it
		// arrived, and say nothing: no move happened, so there is nothing to announce.
		return { wartosci, pola: {}, sha: shaZFormularza(dane) };
	}
	const [przenoszone] = wartosci.zdjecia.splice(indeks, 1);
	wartosci.zdjecia.splice(docelowy, 0, przenoszone);
	return {
		wartosci,
		pola: {},
		status: przeniesionoZdjecie(indeks + 1, docelowy + 1),
		// A FRESH object naming the NEW position and the direction, which is what lets the group
		// component put focus back on the button that was just pressed.
		zadanie: { cel: 'przenies', indeks: docelowy, kierunek } satisfies ZadanieFokusu,
		sha: shaZFormularza(dane)
	};
}

export const actions: Actions = {
	/** Append one empty photo item. Commits nothing, and writes no file: an item with no picture
	 *  is refused by the save until the editor chooses one or removes the item. */
	dodajZdjecie: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciGalerii(dane);
		wartosci.zdjecia.push({ plik: '', podpis: '', alt: '', dane: '', usunieto: false });
		const numer = wartosci.zdjecia.length;
		return {
			wartosci,
			pola: {},
			status: dodanoWiersz(numer),
			zadanie: { cel: 'element', indeks: numer - 1 } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikGaleriiEkranu;
	},

	/** Remove the photo item at the submitted POSITION. Commits nothing and DELETES NOTHING: the
	 *  file leaves the repository only when the save that stops pointing at it runs, and only if
	 *  the panel generated its name in the first place. */
	usunZdjecie: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciGalerii(dane);
		const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.zdjecia.length);
		if (indeks === null) {
			return { wartosci, pola: {}, sha: shaZFormularza(dane) } satisfies WynikGaleriiEkranu;
		}
		wartosci.zdjecia.splice(indeks, 1);
		return {
			wartosci,
			pola: {},
			status: usunietoWiersz(indeks + 1),
			zadanie: { cel: 'dodaj' } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikGaleriiEkranu;
	},

	/** Move a photograph one place up. Commits nothing; only the ORDER of the echoed list
	 *  changes, and the head SHA travels back in the form so a round trip cannot move the
	 *  conflict baseline forward (04.1 D-10). */
	przeniesWGore: async ({ request }) => przeniesZdjecie(await request.formData(), 'gora'),

	przeniesWDol: async ({ request }) => przeniesZdjecie(await request.formData(), 'dol'),

	/** The ONE action that writes, and it writes once. */
	zapisz: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		// Captured BEFORE validation, so every refusal below hands it straight back, the prepared
		// pictures included.
		const wartosci = wartosciGalerii(dane);

		// The names this build already carries. Read HERE rather than inside the validator, which
		// keeps that module pure and every naming branch drivable under a plain test runner. The
		// answer is the LAST BUILD, which is safe in this direction: a name committed two minutes
		// ago is not in it, and the worst that costs is a numeric suffix on a picture that could
		// have reused a free name.
		const wynik = walidujGaleria(dane, istniejaceNazwy());
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc,
				sha: shaZFormularza(dane)
			} satisfies WynikGaleriiEkranu);
		}

		// ONE FILE LIST, ONE CALL. The JSON goes FIRST, so a person reading the commit sees the
		// gallery before its pictures.
		const pliki: PlikDoZapisu[] = [
			{ sciezka: SCIEZKA_GALERIA, tresc: serializujJson(wynik.dane) },
			...wynik.zdjecia.map((zdjecie) => ({
				sciezka: sciezkaOkladki(zdjecie.nazwa),
				// PASSED THROUGH UNCHANGED. The browser produced this encoding while the editor was
				// looking at the preview, and nothing on the server reads, decodes or re-encodes
				// it: see the header of src/lib/server/admin/obraz.ts.
				tresc: zdjecie.base64,
				base64: true
			}))
		];

		// A picture leaves the repository in the SAME commit that stops pointing at it, so the
		// site never carries a file nothing references. The still-used list is this screen's own
		// remaining filenames PLUS every aktualność cover, so a picture shared with a post is
		// never removed. `zdjecieGaleriiDoUsuniecia` is the only thing that may put a path in
		// this array, and it refuses any name the panel did not generate: the two pictures placed
		// here by hand carry no gallery prefix, so they are unreachable by construction and an
		// editor who removes one from the list simply stops publishing it.
		const nadalUzywane = [
			...wynik.dane.zdjecia.map((zdjecie) => zdjecie.plik),
			...readAktualnosci().map((wpis) => wpis.obraz)
		];
		const usun: string[] = [];
		for (const stare of czytajGalerie(galeriaStore)) {
			const doUsuniecia = zdjecieGaleriiDoUsuniecia(stare.plik, nadalUzywane);
			if (doUsuniecia !== null && !usun.includes(doUsuniecia)) usun.push(doUsuniecia);
		}

		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			// The description names the SCREEN rather than a photograph: one save carries the
			// whole list, and a session here can add, remove and reorder in one go.
			opis: KOPIA_EKRAN_GALERII.opisZapisu,
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
			} satisfies WynikGaleriiEkranu);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail zapiszTresc may carry is deliberately NOT rendered.
			return fail(500, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikGaleriiEkranu);
		}

		// 303 rather than 302, so the browser turns the POST into a GET and a refresh can never
		// replay the save (04.1 D-11).
		redirect(303, `/admin/galeria?${ZNACZNIK_ZAPISANO}=1`);
	}
};
