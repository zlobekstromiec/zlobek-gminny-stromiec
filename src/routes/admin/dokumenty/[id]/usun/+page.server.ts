// The delete confirmation page for one dokument (04.1-UI-SPEC Component Contract 11; D-07,
// D-10, D-11, threats T-04.1-27, T-04.1-31 and T-04.1-33).
//
// BOTH HALVES LEAVE IN ONE COMMIT. A document is an entry AND a file, and removing them
// separately would mean two commits, two Cloudflare builds, roughly four minutes, and a
// window in which the żłobek's website either lists a document nobody can download or serves
// a file nothing points at. `sciezkiDoUsuniecia` below builds one list and the action makes
// one call, which is the same shape the aktualność deletion uses for an entry and its cover.
//
// PATH TRAVERSAL IS CLOSED BY CONSTRUCTION, not by a check on the route parameter
// (T-04.1-31). The parameter is never concatenated into a path. It is used to LOOK UP an
// entry among the ones the reader returned, and that reader derives each slug from a real
// on-disk filename, so a fabricated slug matches nothing and the screen says it found
// nothing. Both written paths come from the ENTRY: the JSON path from the slug the reader
// derived, and the file path by stripping the canonical prefix off the value the entry
// stores. Nothing the request supplied reaches either join.
//
// DELETION IS A POST ON THIS PAGE AND NOTHING ELSE (T-04.1-27). The list links here and only
// here; a browser prefetching that link opens a question, not a deletion.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not the document name, not on the error path.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { KOPIA_ZAPIS, opisUsunieciaDokumentu } from '$lib/content/panel';
import { POLE_SHA, ZNACZNIK_USUNIETO } from '$lib/pola-dokumentu';
import { readDokumentyPanelu, type DokumentPanelu } from '$lib/server/admin/dokumenty';
import { sciezkaTresciDokumentu } from '$lib/server/admin/plik';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'dokumenty';

/** Everything the confirmation screen renders in its refusal states. */
export interface WynikUsunieciaDokumentu {
	panelNaglowek: string;
	panelTresc: string;
	/** Set only on the conflict branch, whose instruction is „reload" rather than „try again
	 *  in a moment". */
	konflikt?: boolean;
}

/**
 * Every repository path that disappears when this document is deleted.
 *
 * Two paths, always derived from the entry and never from the request. The file path is null
 * when the stored value is not one this panel could have produced, in which case there is
 * nothing here to remove and asking git to remove it would fail the whole atomic save and
 * leave the editor unable to delete the entry at all.
 */
function sciezkiDoUsuniecia(wpis: DokumentPanelu): string[] {
	const sciezki = [sciezkaTresciDokumentu(wpis.slug)];
	if (wpis.sciezkaPliku !== null) sciezki.push(wpis.sciezkaPliku);
	return sciezki;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	const wpis = readDokumentyPanelu().find((dokument) => dokument.slug === params.id);
	if (!wpis) {
		// „Nie znaleziono tej treści", not a 404 page: the editor arrived from the panel and
		// the useful answer is „this may already be gone, go back to the list and check".
		return { znaleziony: false as const };
	}
	return {
		znaleziony: true as const,
		nazwa: wpis.nazwa,
		/** Undefined when the head could not be read, which degrades to „delete without the
		 *  conflict check" rather than to „this screen will not open". The reasoning is written
		 *  out at aktualnyShaGlowy in src/lib/server/admin/zapis.ts. */
		sha: await aktualnyShaGlowy(platform?.env)
	};
};

export const actions: Actions = {
	default: async ({ params, request, locals, platform }) => {
		const dane = await request.formData();

		// Resolved again on the POST rather than trusted from the load: the two requests are
		// separate, and this is the one that writes.
		const wpis = readDokumentyPanelu().find((dokument) => dokument.slug === params.id);
		if (!wpis) {
			return fail(404, {
				panelNaglowek: KOPIA_ZAPIS.brakTresciNaglowek,
				panelTresc: KOPIA_ZAPIS.brakTresciTresc
			} satisfies WynikUsunieciaDokumentu);
		}

		const oczekiwanySha = dane.get(POLE_SHA);
		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: opisUsunieciaDokumentu(wpis.nazwa),
			// Nothing is written. A deletion is a tree entry whose sha is null, which is why it
			// costs no blob and needs no mechanism of its own.
			pliki: [],
			usun: sciezkiDoUsuniecia(wpis),
			oczekiwanySha:
				typeof oczekiwanySha === 'string' && oczekiwanySha.length > 0 ? oczekiwanySha : undefined
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc,
				konflikt: true
			} satisfies WynikUsunieciaDokumentu);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail zapiszTresc may carry is deliberately NOT rendered:
			// „the deployment is missing GITHUB_APP_PRIVATE_KEY" is not a sentence a żłobek
			// staff member can act on, and it is a sentence an attacker would enjoy.
			return fail(500, {
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikUsunieciaDokumentu);
		}

		// 303 rather than 302, so the browser turns the POST into a GET. A refresh of the
		// resulting list can never replay the deletion, which would be a second commit and a
		// second Cloudflare build of the żłobek's website (D-11).
		redirect(303, `/admin/dokumenty?${ZNACZNIK_USUNIETO}=1`);
	}
};
