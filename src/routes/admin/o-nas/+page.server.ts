// The O nas editor (CMS-02, D-10, D-11, D-13, D-17, P-26; 04.1-UI-SPEC Component
// Contracts 5, 6, 7 and 10): two narrative fields, one repeated list, two numbers and the
// facility description, and exactly ONE commit for all of it.
//
// THE PHOTO HALF LEFT THIS ROUTE IN PLAN 05-07, and where it went matters. The żłobek's
// photographs, their alt text, their ordering and their file writes are now owned by
// /admin/galeria alone, which is why the header this file used to carry has changed in two
// places. It said that four of the five actions never touch git, and it said that the JSON
// and every pending picture travel in one tree (D-07). The first is still true of the two
// actions that remain; the second is now a statement about the GALLERY route and is written
// out in its own header. THIS route writes exactly ONE file: src/lib/content/o-nas.json.
//
// BOTH LIST ACTIONS BELOW NEVER TOUCH GIT. The add and the remove read what was typed,
// change the LENGTH of the wartości list and render the form again. They mint no token,
// they call no orchestrator, they write no blob and they produce no Cloudflare build (P-26).
// Only `zapisz` writes, and it calls the orchestrator exactly once, which is what makes
// D-11's „one page, one save, one commit" true however long the session was.
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
	usunietoWiersz
} from '$lib/content/panel';
import {
	POLE_INDEKSU,
	POLE_SHA,
	ZNACZNIK_ZAPISANO,
	indeksZadania,
	wartosciONas,
	type WartosciONas,
	type ZadanieFokusu
} from '$lib/pola-strony';
import { serializujJson } from '$lib/server/admin/serializuj';
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
	/** Contract 10c: every typed value intact, after a refusal AND after an add or a remove. */
	wartosci: WartosciONas;
	/** Field errors keyed by the offending control's own name, indexed for a repeated one. */
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
	konflikt?: boolean;
	/** The wartości group announces and moves focus on its own. */
	statusWartosci?: string;
	zadanieWartosci?: ZadanieFokusu;
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

	/** The ONE action that writes, and it writes once. */
	zapisz: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		// Captured BEFORE validation, so every refusal below hands it straight back, the
		// prepared pictures included.
		const wartosci = wartosciONas(dane);

		// No set of existing filenames travels in any more: this screen names no file,
		// because it writes none but its own JSON (Plan 05-07).
		const wynik = walidujONas(dane);
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc,
				sha: shaZFormularza(dane)
			} satisfies WynikONasEkranu);
		}

		// ONE FILE, ONE CALL. This screen writes its own JSON and nothing else, and it removes
		// nothing: no path on this page names a file any more, so there is no deletion set to
		// build and no picture that could be orphaned by a save here (Plan 05-07).
		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			// The description names the PAGE rather than a field: D-11 makes one page one
			// commit, and a session here can touch eight groups of content at once.
			opis: KOPIA_EKRAN_O_NAS.opisZapisu,
			pliki: [{ sciezka: SCIEZKA, tresc: serializujJson(wynik.dane) }],
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
