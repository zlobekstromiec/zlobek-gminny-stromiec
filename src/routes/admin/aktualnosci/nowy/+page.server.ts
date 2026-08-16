// Creating an aktualność (CMS-02, D-14, P-16, P-17; 04.1-UI-SPEC Component Contracts 5,
// 9 and 10).
//
// THE SEQUENCE IS: validate, name the file, refuse a collision, serialize, save, redirect.
// Everything expensive sits behind everything cheap, which is the ordering
// src/lib/server/forms/handle.ts establishes and src/lib/server/admin/zapis.ts enforces
// structurally: an invalid submission costs a few comparisons and never reaches a token
// mint, let alone GitHub.
//
// THE FILENAME IS GENERATED HERE AND ONLY HERE (D-14, P-16). Staff never type one. The
// name is the date plus the slug of the title, and once it exists it is the entry's public
// URL forever: the edit screen writes back to the name in its route parameter and never
// recomputes it, which is why the generator is imported HERE and in no other route.
//
// P-17, AND IT IS A DATA-LOSS GUARD RATHER THAN A NICETY: if the generated name is already
// taken, the create is REFUSED. Overwriting silently would destroy a colleague's post with
// no trace an editor could see, and a random suffix would make the address of a post
// unpredictable, which is the one thing D-07 exists to prevent.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not the title, not the body, not on the error
// path: the panel's whole RODO posture is that an edit leaves no trace anywhere except the
// commit it was meant to produce.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { readAktualnosci } from '$lib/server/aktualnosci';
import { KOPIA_WALIDACJA, KOPIA_ZAPIS, opisDodaniaWpisu } from '$lib/content/panel';
import {
	POLE_SHA,
	ZNACZNIK_ZAPISANO,
	pusteWartosciWpisu,
	wartosciWpisu,
	type WartosciWpisu
} from '$lib/pola-wpisu';
import { lataDoWyboru } from '$lib/daty';
import { ROZSZERZENIE_WPISU, nazwaPlikuWpisu, sciezkaWpisu } from '$lib/server/admin/slug';
import { serializujJson } from '$lib/server/admin/serializuj';
import { walidujWpis } from '$lib/server/admin/walidacja/aktualnosci';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'aktualnosci';

/** Everything a refused submission hands back to the screen. One flat shape, so every
 *  branch of the action produces the same fields and the page reads one object. */
export interface WynikWpisu {
	/** Contract 10c: every typed value intact. */
	wartosci: WartosciWpisu;
	/** Field errors keyed by the control names, empty when the refusal is not a field
	 *  problem. The summary panel links to each one. */
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	// Today, pre-selected, because almost every entry is published on the day it is
	// written. Read in UTC: on a Worker there is no local clock to read instead, and
	// between midnight and two in the morning Warsaw time this offers yesterday. The three
	// selects are right there and the value is visible before saving, which is the whole
	// reason the date is a visible control rather than a hidden field.
	const teraz = new Date();
	const rok = teraz.getUTCFullYear();
	return {
		wartosci: pusteWartosciWpisu(
			String(teraz.getUTCDate()),
			String(teraz.getUTCMonth() + 1),
			String(rok)
		),
		lata: lataDoWyboru(rok),
		/** Undefined when the head could not be read, which degrades to „save without the
		 *  conflict check" rather than to „this screen will not open". The reasoning is
		 *  written out at aktualnyShaGlowy in src/lib/server/admin/zapis.ts. */
		sha: await aktualnyShaGlowy(platform?.env)
	};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		// Captured BEFORE validation, so every refusal below can hand it straight back.
		const wartosci = wartosciWpisu(dane);

		const wynik = walidujWpis(dane);
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc
			} satisfies WynikWpisu);
		}

		const nazwa = nazwaPlikuWpisu(wynik.dane.data, wynik.dane.tytul);
		const slug = nazwa.slice(0, -ROZSZERZENIE_WPISU.length);

		// P-17. Compared against the entries the PUBLIC reader returns, so „already exists"
		// means the same thing here as it does on the website.
		if (readAktualnosci().some((post) => post.slug === slug)) {
			return fail(409, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.kolizjaNaglowek,
				panelTresc: KOPIA_ZAPIS.kolizjaTresc
			} satisfies WynikWpisu);
		}

		const oczekiwanySha = dane.get(POLE_SHA);
		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: opisDodaniaWpisu(wynik.dane.tytul),
			// Serialized HERE, by the caller, which is what makes an unvalidated save
			// inexpressible in zapiszTresc's signature. See its module header.
			pliki: [{ sciezka: sciezkaWpisu(slug), tresc: serializujJson(wynik.dane) }],
			oczekiwanySha:
				typeof oczekiwanySha === 'string' && oczekiwanySha.length > 0 ? oczekiwanySha : undefined
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc
			} satisfies WynikWpisu);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail zapiszTresc may carry is deliberately NOT rendered:
			// „the deployment is missing GITHUB_APP_PRIVATE_KEY" is not a sentence a żłobek
			// staff member can act on, and it is a sentence an attacker would enjoy.
			return fail(500, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikWpisu);
		}

		// 303 TO THE LIST, carrying the new slug, and deliberately NOT to the edit screen of
		// the entry that was just written. The panel reads its content through the same
		// build-time reader the public site uses, so the new file does not exist for anything
		// to read until Cloudflare has rebuilt: an edit screen for it would answer „nie
		// znaleziono tej treści" for the next two minutes, which is the opposite of what
		// just happened. The list says „Zapisano", repeats the two-minute promise and links
		// straight to the new public page, which is the honest version of the same journey.
		//
		// 303 rather than 302 so the browser turns the POST into a GET: a refresh of the
		// resulting page can never replay the save, which would be a second commit and a
		// second Cloudflare build of the żłobek's website (D-11).
		redirect(303, `/admin/aktualnosci?${ZNACZNIK_ZAPISANO}=${slug}`);
	}
};
