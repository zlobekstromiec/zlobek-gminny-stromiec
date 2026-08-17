// The W skrócie editor (05-UI-SPEC Contract 11; 05 D-32, D-33). This is the „Ustawienia
// strony" work Phase 04.1 deferred with the words „revisit after Phase 5", so it is the
// REVERSAL of that deferral rather than new scope. The driving fact: the opening hours are a
// live placeholder the żłobek could not fix without a developer.
//
// THE WHOLE SEQUENCE IS: validate, serialize, save, redirect. Everything expensive lives
// behind everything cheap, which is the ordering src/lib/server/forms/handle.ts establishes
// and src/lib/server/admin/zapis.ts enforces structurally. Built on the
// src/routes/admin/nabor/ singleton template and modelled directly on its nearest sibling,
// src/routes/admin/cennik/.
//
// D-10 IS FREE HERE, and that is the point of reading the head on load: the SHA the editor's
// browser carries in a hidden field is the state the form was built from, so comparing it
// before the write is the difference between „refuse and keep both edits" and „silently
// overwrite a colleague". The field is client supplied and therefore untrusted, but it
// cannot be abused: a forged value can only make the save FAIL, never make it overwrite
// more, because GitHub itself enforces the ref update with force false.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and is described here rather than written.
//
// Nothing here logs. Not the editor handle, not one submitted value, not on the error path.
//
// ONE NAMED ACTION, not a default one. SvelteKit forbids mixing a default action with named
// ones on a single page, and every other editor screen in this panel is named.
//
// NO +server.ts LIVES UNDER /admin, HERE OR ANYWHERE. The session gate covers pages and
// their POSTs by layout inheritance; a standalone endpoint is the one construct that would
// sit outside it (T-05-09-07).
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { KOPIA_W_SKROCIE, KOPIA_WALIDACJA, KOPIA_ZAPIS } from '$lib/content/panel';
import {
	POLE_SHA,
	ZNACZNIK_ZAPISANO,
	wartosciWSkrocie,
	type WartosciWSkrocie
} from '$lib/pola-strony';
import { serializujJson } from '$lib/server/admin/serializuj';
import { SCIEZKA_W_SKROCIE, walidujWSkrocie } from '$lib/server/admin/walidacja/w-skrocie';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import { W_SKROCIE } from '$lib/w-skrocie';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'w-skrocie';

/** Everything a rendered state of this screen needs. ONE flat shape, so the page reads one
 *  object and every branch of the action produces the same fields. */
export interface WynikWSkrocie {
	/** Contract 10c: every typed value intact after a refusal. */
	wartosci: WartosciWSkrocie;
	/** Field errors keyed by the offending control's own name. */
	pola: Record<string, string>;
	/** Alert panel above the form. Heading and body always travel together. */
	panelNaglowek?: string;
	panelTresc?: string;
	/** Set only on the conflict branch, which is the one refusal whose instruction is
	 *  „reload this page" rather than „try again". */
	konflikt?: boolean;
	/** The head the form was built from, carried across the round trip. */
	sha?: string;
}

/** The committed store as the form's echo shape, read through the SAME validated view the
 *  homepage renders from, so the screen opens on exactly what is on the site.
 *
 *  The number of places becomes a string here because the echo shape is all strings: see its
 *  declaration in src/lib/pola-strony.ts for why a refused value has to survive as typed. */
function wartosciZPliku(): WartosciWSkrocie {
	return {
		godziny: W_SKROCIE.godziny.godziny,
		dniPelne: W_SKROCIE.godziny.dniPelne,
		dniSkrot: W_SKROCIE.godziny.dniSkrot,
		weekend: W_SKROCIE.godziny.weekend,
		godzinyZastepcza: W_SKROCIE.godzinyZastepcze,
		miejsca: String(W_SKROCIE.miejsca),
		dopisek: W_SKROCIE.dopisek,
		miejscaZastepcza: W_SKROCIE.miejscaZastepcze
	};
}

export const load: PageServerLoad = async ({ platform, url }) => {
	return {
		wartosci: wartosciZPliku(),
		/** Undefined when the head could not be read. That degrades to „save without the
		 *  conflict check" rather than to „this screen will not open"; the reasoning is
		 *  written out at aktualnyShaGlowy in src/lib/server/admin/zapis.ts. */
		sha: await aktualnyShaGlowy(platform?.env),
		/** POST then redirect then GET: the success panel is driven by a query marker on a
		 *  fresh GET, never by an action return, so a refresh after a save re-runs a harmless
		 *  read instead of committing a second time (Contract 10, D-11). */
		zapisano: url.searchParams.get(ZNACZNIK_ZAPISANO) === '1'
	};
};

function shaZFormularza(dane: FormData): string | undefined {
	const surowy = dane.get(POLE_SHA);
	return typeof surowy === 'string' && surowy.length > 0 ? surowy : undefined;
}

export const actions: Actions = {
	zapisz: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		// Captured BEFORE validation, so every refusal below hands it straight back.
		const wartosci = wartosciWSkrocie(dane);

		// CHEAPEST FIRST. An unvalidated request costs a handful of comparisons and never
		// reaches a token mint, let alone GitHub.
		const wynik = walidujWSkrocie(dane);
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc,
				sha: shaZFormularza(dane)
			} satisfies WynikWSkrocie);
		}

		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: KOPIA_W_SKROCIE.opisZapisu,
			// Serialized HERE, by the caller, which is what makes an unvalidated save
			// inexpressible in zapiszTresc's signature. See its module header.
			pliki: [{ sciezka: SCIEZKA_W_SKROCIE, tresc: serializujJson(wynik.dane) }],
			oczekiwanySha: shaZFormularza(dane)
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc,
				konflikt: true
			} satisfies WynikWSkrocie);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail that zapiszTresc may carry is deliberately NOT
			// rendered. „The deployment is missing GITHUB_APP_PRIVATE_KEY" is not a sentence a
			// żłobek staff member can act on, and it is a sentence an attacker would enjoy.
			return fail(500, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikWSkrocie);
		}

		// 303 rather than 302, so the browser turns the POST into a GET. A refresh of the
		// resulting page can never replay the save, which on this screen would mean a second
		// commit and a second Cloudflare build of the żłobek's website (D-11).
		redirect(303, `/admin/w-skrocie?${ZNACZNIK_ZAPISANO}=1`);
	}
};
