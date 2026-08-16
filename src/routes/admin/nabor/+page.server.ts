// The recruitment switch (CMS-02, D-16; 04.1-UI-SPEC Component Contracts 5, 9, 10 and
// 13). The first screen in this project that changes the live public website from a
// browser, and deliberately the simplest content in the phase: one boolean, so the write
// path built in Plan 04 is proven with nothing else in the way.
//
// THE WHOLE SEQUENCE IS: validate, serialize, save, redirect. Everything expensive lives
// behind everything cheap, which is the ordering src/lib/server/forms/handle.ts
// establishes and src/lib/server/admin/zapis.ts enforces structurally.
//
// D-10 IS FREE HERE, and that is the point of reading the head on load: the SHA the
// editor's browser carries in a hidden field is the state the form was built from, so
// comparing it before the write is the difference between „refuse and keep both edits"
// and „silently overwrite a colleague". The field is client-supplied and therefore
// untrusted, but it cannot be abused: a forged value can only make the save FAIL, never
// make it overwrite more, because GitHub itself enforces the ref update with force false.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and is described here rather than written.
//
// Nothing here logs. Not the editor handle, not the submitted state, not on the error
// path: this file runs on a public body's system and the panel's whole RODO posture is
// that an edit leaves no trace anywhere except the commit it was meant to produce.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import nabor from '$lib/content/nabor.json';
import { KOPIA_NABOR, KOPIA_WALIDACJA, KOPIA_ZAPIS } from '$lib/content/panel';
import { POLE_STAN, stanZWartosci, walidujNabor } from '$lib/server/admin/walidacja/nabor';
import { SCIEZKA_NABOR } from '$lib/stan-naboru';
import { serializujJson } from '$lib/server/admin/serializuj';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'nabor';

/** Everything a rendered state of this screen needs. One flat shape, so the page reads
 *  one object and every branch of the action produces the same fields. */
export interface WynikNaboru {
	/** The submitted state, echoed back so a refused save never loses the editor's
	 *  choice. This is the „every typed value intact" of Contract 10c, which on this
	 *  screen is one radio. */
	stan: string;
	/** Inline field error under the fieldset. */
	bladStanu?: string;
	/** Alert panel above the form. Heading and body always travel together. */
	panelNaglowek?: string;
	panelTresc?: string;
	/** Set only on the conflict branch, which is the one refusal whose instruction is
	 *  „reload this page" rather than „try again". */
	konflikt?: boolean;
}

export const load: PageServerLoad = async ({ platform, url }) => {
	return {
		/** Current committed value, read from the same import the public page consumes. */
		stan: stanZWartosci(nabor.otwarty),
		/** Undefined when the head could not be read. That degrades to „save without the
		 *  conflict check" rather than to „this screen will not open"; the reasoning is
		 *  written out at aktualnyShaGlowy in src/lib/server/admin/zapis.ts. */
		sha: await aktualnyShaGlowy(platform?.env),
		/** POST then redirect then GET: the success panel is driven by a query marker on a
		 *  fresh GET, never by an action return, so a refresh after a save re-runs a
		 *  harmless read instead of committing a second time (Contract 10, D-11). */
		zapisano: url.searchParams.get('zapisano') === '1'
	};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		const surowy = dane.get(POLE_STAN);

		// CHEAPEST FIRST. An unvalidated request costs one comparison and never reaches a
		// token mint, let alone GitHub.
		const wynik = walidujNabor(surowy);
		if (!wynik.ok) {
			return fail(400, {
				// An unusable submitted value must not be echoed back into a radio: it would
				// check neither option and the editor would see no state at all. Fall back to
				// what is actually committed, which is the honest answer to „what is the
				// nabór right now".
				stan: stanZWartosci(nabor.otwarty),
				bladStanu: wynik.pola[POLE_STAN],
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc
			} satisfies WynikNaboru);
		}

		const wybrany = stanZWartosci(wynik.dane.otwarty);
		const oczekiwanySha = dane.get('sha');

		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: wynik.dane.otwarty ? KOPIA_NABOR.opisZapisuOtwarty : KOPIA_NABOR.opisZapisuZamkniety,
			// Serialized HERE, by the caller, which is what makes an unvalidated save
			// inexpressible in zapiszTresc's signature. See its module header.
			pliki: [{ sciezka: SCIEZKA_NABOR, tresc: serializujJson(wynik.dane) }],
			oczekiwanySha:
				typeof oczekiwanySha === 'string' && oczekiwanySha.length > 0 ? oczekiwanySha : undefined
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				stan: wybrany,
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc,
				konflikt: true
			} satisfies WynikNaboru);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail that zapiszTresc may carry is deliberately NOT
			// rendered. „The deployment is missing GITHUB_APP_PRIVATE_KEY" is not a sentence
			// a żłobek staff member can act on, and it is a sentence an attacker would enjoy.
			return fail(500, {
				stan: wybrany,
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikNaboru);
		}

		// 303 rather than 302, so the browser turns the POST into a GET. A refresh of the
		// resulting page can never replay the save, which on this screen would mean a
		// second commit and a second Cloudflare build of the żłobek's website (D-11).
		redirect(303, '/admin/nabor?zapisano=1');
	}
};
