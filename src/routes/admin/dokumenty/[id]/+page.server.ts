// Editing a dokument (CMS-02, D-07, D-10, D-14, P-23; 04.1-UI-SPEC Component Contracts 5, 9
// and 10).
//
// THE SLUG IS NEVER RECOMPUTED HERE, AND THAT IS THE WHOLE POINT OF THIS FILE. The save
// writes to the paths the ROUTE PARAMETER names and to nothing else, so correcting a
// document's name corrects the name and does not move its download address. That address is
// what somebody pasted into an e-mail to a parent, and regenerating it on every save would
// silently rename the file and 404 the link. The generator that names a NEW document is
// deliberately not imported into this module at all.
//
// THE ENTRY AND ITS FILE STAY CONSISTENT IN EVERY DIRECTION (D-07, T-04.1-33):
//  • no new file attached, so only the JSON is committed and the document keeps the file it
//    has. This is the case that works with SCRIPTING SWITCHED OFF, which is the honest half
//    of the P-22 deviation;
//  • a new file of the SAME type, so the JSON and the file are committed together and the
//    file is overwritten IN PLACE at the same path, which needs no deletion at all: one
//    commit cannot both write and remove one path (the P-21 lesson from Plan 04.1-07);
//  • a new file of a DIFFERENT type, so the path changes, and the old file is removed in the
//    SAME commit that stops pointing at it. Otherwise the repository would keep a file the
//    website serves and nothing references.
//
// PATH TRAVERSAL IS CLOSED BY CONSTRUCTION (T-04.1-31). The parameter is never concatenated
// into a path. It is used to LOOK UP an entry among the ones the reader returned, and that
// reader derives each slug from a real on-disk filename, so a fabricated slug matches
// nothing and the screen says it found nothing.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not the document name, not on the error path.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import {
	KOPIA_WALIDACJA,
	KOPIA_ZAPIS,
	POLA_DOKUMENT,
	opisZmianyDokumentu
} from '$lib/content/panel';
import { lataDoWyboru } from '$lib/daty';
import { opcjeKategorii } from '$lib/kategorie-dokumentow';
import {
	POLE_SHA,
	ZNACZNIK_ZAPISANO,
	wartosciDokumentu,
	type WartosciDokumentu
} from '$lib/pola-dokumentu';
import type { PlikDoZapisu } from '$lib/server/admin/commit';
import { readDokumentyPanelu, type DokumentPanelu } from '$lib/server/admin/dokumenty';
import { sciezkaDokumentu, sciezkaTresciDokumentu } from '$lib/server/admin/plik';
import { serializujJson } from '$lib/server/admin/serializuj';
import { walidujDokument, zPlikiem } from '$lib/server/admin/walidacja/dokumenty';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'dokumenty';

/** Everything a refused submission hands back to the screen. The same flat shape the create
 *  screen uses, so the two pages render one object and cannot drift. */
export interface WynikDokumentu {
	wartosci: WartosciDokumentu;
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
	/** Set only on the conflict branch, whose instruction is „copy your text and reload"
	 *  rather than „try again in a moment". */
	konflikt?: boolean;
}

/** Split a stored `DD.MM.YYYY` version into the three select values. The stored shape is
 *  fixed width and the options are plain numbers, so the leading zeros are dropped: „08"
 *  would match no option and the month would silently render as „Wybierz". */
function wartosciWersji(kropki: string): { dzien: string; miesiac: string; rok: string } {
	const [dzien, miesiac, rok] = kropki.split('.');
	return {
		dzien: String(Number(dzien)),
		miesiac: String(Number(miesiac)),
		rok: String(Number(rok))
	};
}

/** What is attached today, as text: the file's own name and its type. THE SIZE IS ABSENT
 *  because this route runs in the Worker, which has no filesystem to stat, and a size stored
 *  in the entry is exactly what D-14 forbids. The name is what an editor recognises anyway. */
function opisObecnegoPliku(wpis: DokumentPanelu): string {
	const nazwa = wpis.plik.split('/').pop() ?? wpis.plik;
	return `${nazwa} (${wpis.typ})`;
}

export const load: PageServerLoad = async ({ params, platform, url }) => {
	const wpis = readDokumentyPanelu().find((dokument) => dokument.slug === params.id);
	if (!wpis) {
		// „Nie znaleziono tej treści", not a 404 page: the editor arrived from the panel and the
		// useful answer is „this may already be gone, go back to the list and check".
		return { znaleziony: false as const };
	}

	const wersja = wartosciWersji(wpis.wersja);
	return {
		znaleziony: true as const,
		slug: wpis.slug,
		obecnyPlik: opisObecnegoPliku(wpis),
		wartosci: {
			nazwa: wpis.nazwa,
			kategoria: wpis.kategoria,
			...wersja,
			zrodlo: wpis.zrodlo_bip ?? '',
			zastepcza: wpis.placeholder === true,
			// Nothing is pending on a fresh load: a data URL only ever exists between an editor
			// choosing a file and the save that follows.
			plik: '',
			plikNazwa: '',
			plikRozmiar: ''
		} satisfies WartosciDokumentu,
		// The document's own version year is folded in, so an archival document still opens
		// showing the year it is really dated with.
		lata: lataDoWyboru(new Date().getUTCFullYear(), Number(wersja.rok)),
		kategorie: opcjeKategorii(POLA_DOKUMENT.kategorieOpcje),
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
		const wartosci = wartosciDokumentu(dane);

		// Resolved again on the POST rather than trusted from the load: the two requests are
		// separate, and this is the one that writes.
		const wpis = readDokumentyPanelu().find((dokument) => dokument.slug === params.id);
		if (!wpis) {
			return fail(404, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.brakTresciNaglowek,
				panelTresc: KOPIA_ZAPIS.brakTresciTresc
			} satisfies WynikDokumentu);
		}

		// A file is NOT required here: this document already has one, and „no new file" is what
		// a metadata-only correction looks like on the wire. That is the case the P-22
		// deviation promises still works with scripting switched off.
		const wynik = walidujDokument(dane, false);
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc
			} satisfies WynikDokumentu);
		}

		// The stored path stays the one this document already has unless a new file arrived,
		// and even then only its extension may change: the slug comes from the route parameter,
		// never from the submitted name.
		const nowe = wynik.plik;
		const sciezki = nowe === undefined ? null : sciezkaDokumentu(wpis.slug, nowe.rozszerzenie);
		const sciezkaPubliczna = sciezki === null ? wpis.plik : sciezki.publiczna;
		const zapisywanyWpis = zPlikiem(wynik.dane, sciezkaPubliczna);

		const pliki: PlikDoZapisu[] = [
			{ sciezka: sciezkaTresciDokumentu(wpis.slug), tresc: serializujJson(zapisywanyWpis) }
		];
		if (nowe !== undefined && sciezki !== null) {
			pliki.push({
				sciezka: sciezki.repo,
				// Passed through unchanged: nothing here decodes or re-encodes the bytes.
				tresc: nowe.base64,
				base64: true
			});
		}

		// The old file is removed ONLY when the new one lands somewhere else, which happens
		// exactly when the type changed. When the path is the same, the write IS the
		// replacement, and listing that path as a deletion in the same tree would ask one commit
		// to both write and remove one file.
		const usun: string[] = [];
		if (sciezki !== null && wpis.sciezkaPliku !== null && wpis.sciezkaPliku !== sciezki.repo) {
			usun.push(wpis.sciezkaPliku);
		}

		const oczekiwanySha = dane.get(POLE_SHA);
		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: opisZmianyDokumentu(wynik.dane.nazwa),
			pliki,
			usun: usun.length > 0 ? usun : undefined,
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
			} satisfies WynikDokumentu);
		}

		if (zapis.stan === 'blad') {
			return fail(500, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikDokumentu);
		}

		// Back to THIS document, at THIS slug. The redirect target is the proof that a name
		// change did not move the file.
		redirect(303, `/admin/dokumenty/${wpis.slug}?${ZNACZNIK_ZAPISANO}=1`);
	}
};
