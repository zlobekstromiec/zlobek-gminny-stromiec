// Editing an aktualność (CMS-02, D-07, D-10; 04.1-UI-SPEC Component Contracts 5, 9
// and 10).
//
// THE FILENAME IS NEVER RECOMPUTED HERE, AND THAT IS THE WHOLE POINT OF THIS FILE. The
// save writes to the path the ROUTE PARAMETER names and to nothing else, so a title edit
// keeps the entry's URL. The generator that names a NEW entry is deliberately not imported
// into this module at all: the filename is the public address of a post, staff share it,
// search engines hold it, and regenerating it on every save would silently rename the
// file, orphan the old address and leave anybody who kept the link with a 404. Phase 3
// already made the on-disk filename authoritative (D-07, D-08); this file is where that
// stays true or stops being true.
//
// The generator's NAME is deliberately not spelled out above, because the acceptance gate
// for this file is a literal grep for it and a comment naming it would make that gate
// permanently red. The same wording problem was already solved this way in 04-02,
// 04.1-02 and 04.1-03.
//
// PATH TRAVERSAL IS CLOSED BY CONSTRUCTION (T-04.1-24). The parameter is never
// concatenated into a path. It is used to LOOK UP an entry among the ones the public
// reader returned, and that reader derives each slug from a real on-disk filename, so a
// fabricated slug matches nothing and the screen says it found nothing. The path finally
// written is built from the entry, not from the request.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not the title, not the body, not on the error
// path.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { readAktualnosci } from '$lib/server/aktualnosci';
import { KOPIA_WALIDACJA, KOPIA_ZAPIS, opisZmianyWpisu } from '$lib/content/panel';
import { POLE_SHA, ZNACZNIK_ZAPISANO, wartosciWpisu, type WartosciWpisu } from '$lib/pola-wpisu';
import { lataDoWyboru } from '$lib/daty';
import { sciezkaWpisu } from '$lib/server/admin/slug';
import { serializujJson } from '$lib/server/admin/serializuj';
import { walidujWpis } from '$lib/server/admin/walidacja/aktualnosci';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'aktualnosci';

/** Everything a refused submission hands back to the screen. The same flat shape the
 *  create screen uses, so the two pages render one object and cannot drift. */
export interface WynikWpisu {
	wartosci: WartosciWpisu;
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
	/** Set only on the conflict branch, whose instruction is „copy your text and reload"
	 *  rather than „try again in a moment". */
	konflikt?: boolean;
}

/** Split a stored ISO date into the three select values. The stored shape is fixed width
 *  and the options are plain numbers, so the leading zeros are dropped: „08" would match
 *  no option and the month would silently render as „Wybierz". */
function wartosciDaty(iso: string): { dzien: string; miesiac: string; rok: string } {
	const [rok, miesiac, dzien] = iso.split('-');
	return {
		dzien: String(Number(dzien)),
		miesiac: String(Number(miesiac)),
		rok: String(Number(rok))
	};
}

export const load: PageServerLoad = async ({ params, platform, url }) => {
	const wpis = readAktualnosci().find((post) => post.slug === params.slug);
	if (!wpis) {
		// „Nie znaleziono tej treści", not a 404 page: the editor arrived from the panel and
		// the useful answer is „this may already be gone, go back to the list and check".
		return { znaleziony: false as const };
	}

	const data = wartosciDaty(wpis.iso);
	return {
		znaleziony: true as const,
		slug: wpis.slug,
		wartosci: {
			tytul: wpis.tytul,
			...data,
			// The AUTHORED zajawka, never the derived excerpt. The reader falls back to the
			// first paragraph of the body when there is none, and pre-filling that would turn
			// an empty optional field into a duplicated opening paragraph on the next save.
			zajawka: wpis.zajawka ?? '',
			tresc: wpis.tresc,
			zastepcza: wpis.placeholder === true
		} satisfies WartosciWpisu,
		// The entry's own year is folded in, so a post written in a past year still opens
		// showing the date it was actually published with.
		lata: lataDoWyboru(new Date().getUTCFullYear(), Number(data.rok)),
		/** Undefined when the head could not be read, which degrades to „save without the
		 *  conflict check" rather than to „this screen will not open". */
		sha: await aktualnyShaGlowy(platform?.env),
		/** POST then redirect then GET: the success panel is driven by a query marker on a
		 *  fresh GET, never by an action return, so a refresh after a save re-runs a harmless
		 *  read instead of committing a second time (D-11). */
		zapisano: url.searchParams.get(ZNACZNIK_ZAPISANO) === '1'
	};
};

export const actions: Actions = {
	default: async ({ params, request, locals, platform }) => {
		const dane = await request.formData();
		const wartosci = wartosciWpisu(dane);

		// Resolved again on the POST rather than trusted from the load: the two requests are
		// separate, and this is the one that writes.
		const wpis = readAktualnosci().find((post) => post.slug === params.slug);
		if (!wpis) {
			return fail(404, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.brakTresciNaglowek,
				panelTresc: KOPIA_ZAPIS.brakTresciTresc
			} satisfies WynikWpisu);
		}

		const wynik = walidujWpis(dane);
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc
			} satisfies WynikWpisu);
		}

		const oczekiwanySha = dane.get(POLE_SHA);
		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: opisZmianyWpisu(wynik.dane.tytul),
			// THE ENTRY'S OWN PATH, from its own slug. Not a name derived from the submitted
			// title and date, which is what would rename the file and break the URL.
			pliki: [{ sciezka: sciezkaWpisu(wpis.slug), tresc: serializujJson(wynik.dane) }],
			oczekiwanySha:
				typeof oczekiwanySha === 'string' && oczekiwanySha.length > 0 ? oczekiwanySha : undefined
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc,
				konflikt: true
			} satisfies WynikWpisu);
		}

		if (zapis.stan === 'blad') {
			return fail(500, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikWpisu);
		}

		// Back to THIS entry, at THIS slug. The redirect target is the proof that a title
		// change did not move the post.
		redirect(303, `/admin/aktualnosci/${wpis.slug}?${ZNACZNIK_ZAPISANO}=1`);
	}
};
