// The delete confirmation page for one aktualność (04.1-UI-SPEC Component Contract 11;
// P-18, D-10, D-11, threats T-04.1-24 and T-04.1-27).
//
// PATH TRAVERSAL IS CLOSED BY CONSTRUCTION, not by a check on the slug (T-04.1-24). The
// route parameter is never concatenated into a path. It is used to LOOK UP an entry among
// the ones the public reader returned, and that reader derives each slug from a real
// on-disk filename, so a fabricated slug simply matches nothing and the screen says it
// found nothing. The path that is finally written comes from the entry, never from the
// request.
//
// DELETION IS A POST ON THIS PAGE AND NOTHING ELSE (T-04.1-27). The list links here and
// only here; a browser prefetching that link opens a question, not a deletion.
//
// P-18: the paths this action removes are produced by `sciezkiDoUsuniecia` below rather
// than written inline, because Plan 07 has to add the orphaned cover image to the SAME
// commit. That is a list append inside one function, not a rewrite of the action.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not the entry title, not on the error path.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { readAktualnosci, type PostWithMeta } from '$lib/server/aktualnosci';
import { KOPIA_ZAPIS, opisUsunieciaWpisu } from '$lib/content/panel';
import { POLE_SHA, ZNACZNIK_USUNIETO } from '$lib/pola-wpisu';
import { sciezkaWpisu } from '$lib/server/admin/slug';
import { okladkaDoUsuniecia } from '$lib/server/admin/uploads';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'aktualnosci';

/** Everything the confirmation screen renders in its refusal states. */
export interface WynikUsuniecia {
	panelNaglowek: string;
	panelTresc: string;
	/** Set only on the conflict branch, whose instruction is „reload" rather than „try
	 *  again in a moment". */
	konflikt?: boolean;
}

/**
 * Every repository path that disappears when this entry is deleted.
 *
 * One entry, one list, one commit: the entry and its picture must never leave the site in
 * two builds four minutes apart, and this is the append Plan 06 wrote the helper for.
 *
 * THE COVER IS ONLY REMOVED WHEN IT IS REALLY THIS ENTRY'S. `okladkaDoUsuniecia` decides
 * that, and it is deliberately conservative: it removes a file only when the name is the
 * one this entry's own stem generates, when no other entry points at it, and when it is
 * actually present in the build. Both seed images in this repository are rendered by the o
 * nas page as well, so a rule that asked only „does another aktualność use it" would have
 * deleted a picture a public page needs. An unreferenced leftover costs a few kilobytes in
 * a directory listing; a missing shared one breaks a page.
 */
function sciezkiDoUsuniecia(wpis: PostWithMeta, inne: readonly PostWithMeta[]): string[] {
	const sciezki = [sciezkaWpisu(wpis.slug)];
	const okladka = okladkaDoUsuniecia(
		wpis.slug,
		wpis.obraz,
		inne.map((post) => post.obraz)
	);
	if (okladka !== null) sciezki.push(okladka);
	return sciezki;
}

export const load: PageServerLoad = async ({ params, platform }) => {
	const wpis = readAktualnosci().find((post) => post.slug === params.slug);
	if (!wpis) {
		// „Nie znaleziono tej treści", not a 404 page: the editor arrived from the panel and
		// the useful answer is „this may already be gone, go back to the list and check".
		return { znaleziony: false as const };
	}
	return {
		znaleziony: true as const,
		tytul: wpis.tytul,
		data: wpis.dataDisplay,
		/** Undefined when the head could not be read, which degrades to „delete without the
		 *  conflict check" rather than to „this screen will not open". The reasoning is
		 *  written out at aktualnyShaGlowy in src/lib/server/admin/zapis.ts. */
		sha: await aktualnyShaGlowy(platform?.env)
	};
};

export const actions: Actions = {
	default: async ({ params, request, locals, platform }) => {
		const dane = await request.formData();

		// Resolved again on the POST rather than trusted from the load: the two requests are
		// separate, and this is the one that writes.
		const wszystkie = readAktualnosci();
		const wpis = wszystkie.find((post) => post.slug === params.slug);
		if (!wpis) {
			return fail(404, {
				panelNaglowek: KOPIA_ZAPIS.brakTresciNaglowek,
				panelTresc: KOPIA_ZAPIS.brakTresciTresc
			} satisfies WynikUsuniecia);
		}

		const oczekiwanySha = dane.get(POLE_SHA);
		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: opisUsunieciaWpisu(wpis.tytul),
			// Nothing is written. A deletion is a tree entry whose sha is null, which is why
			// it costs no blob and needs no mechanism of its own.
			pliki: [],
			usun: sciezkiDoUsuniecia(
				wpis,
				wszystkie.filter((post) => post.slug !== wpis.slug)
			),
			oczekiwanySha:
				typeof oczekiwanySha === 'string' && oczekiwanySha.length > 0 ? oczekiwanySha : undefined
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc,
				konflikt: true
			} satisfies WynikUsuniecia);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail zapiszTresc may carry is deliberately NOT rendered:
			// „the deployment is missing GITHUB_APP_PRIVATE_KEY" is not a sentence a żłobek
			// staff member can act on, and it is a sentence an attacker would enjoy.
			return fail(500, {
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikUsuniecia);
		}

		// 303 rather than 302, so the browser turns the POST into a GET. A refresh of the
		// resulting list can never replay the deletion, which would be a second commit and a
		// second Cloudflare build of the żłobek's website (D-11).
		redirect(303, `/admin/aktualnosci?${ZNACZNIK_USUNIETO}=1`);
	}
};
