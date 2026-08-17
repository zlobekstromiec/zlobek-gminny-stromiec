// The day-plan editor (CMS-02, D-11, D-17, P-26; 04.1-UI-SPEC Component Contracts 5, 7, 9
// and 10). The smaller of the two singleton screens, and the clean proof of the repeatable
// pattern: one repeated pair of fields and nothing else in the way.
//
// FOUR OF THE FIVE ACTIONS BELOW NEVER TOUCH GIT, and that is the whole design (P-26).
// `dodajWiersz`, `usunWiersz` and the two move actions read what was typed, change the
// LENGTH or the ORDER of the list and render the form again. They mint no token, they call
// no orchestrator, they write no blob and they produce no Cloudflare build. Only `zapisz`
// writes, which is what makes D-11's „one page, one save, one commit" true no matter how
// many rows an editor adds or reorders first.
//
// THEY ARE SERVER ROUND TRIPS BECAUSE OF D-17. A row added by client code exists only in a
// browser that ran the code; this panel has to work with scripting switched off, so adding
// a row is an ordinary form submission carrying an ordinary form action.
//
// NAMED ACTIONS ONLY, INCLUDING THE SAVE. SvelteKit forbids mixing a default action with
// named ones, because posting to a named action without a redirect leaves the query
// parameter in the URL and the next default post would silently run the previous named
// action. The form therefore carries `action="?/zapisz"` and the two buttons override it
// with `formaction`.
//
// THE HEAD SHA TRAVELS IN THE FORM, not in whatever the load last read (D-10). An add is a
// round trip, the load runs again on the way back, and taking the fresh answer would
// quietly move the conflict baseline forward: a colleague's commit landing while an editor
// was adding rows would then be overwritten instead of refused. The value the browser
// carries is the state the form was BUILT from, which is exactly what the check needs.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and described here rather than written.
//
// Nothing here logs. Not the editor handle, not a single row of content, not on the error
// path.
import { fail, redirect, type Actions } from '@sveltejs/kit';
import planDnia from '$lib/content/day-plan.json';
import {
	KOPIA_EKRAN_PLANU,
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
	wartosciPlanuDnia,
	type KierunekPrzeniesienia,
	type WartosciPlanuDnia,
	type ZadanieFokusu
} from '$lib/pola-strony';
import { serializujJson } from '$lib/server/admin/serializuj';
import { walidujPlanDnia } from '$lib/server/admin/walidacja/plan-dnia';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'plan-dnia';

/** Repository path of the one file this screen writes. Written out here rather than
 *  composed, because there is exactly one of it and no route parameter anywhere near it. */
const SCIEZKA = 'src/lib/content/day-plan.json';

/** Everything an action hands back to the screen. One flat shape for all three, so the page
 *  reads one object and no branch can forget a member the others set. */
export interface WynikPlanuDnia {
	/** Contract 10c: every typed value intact, after a refusal AND after an add or a
	 *  remove, which is the only reason those two are allowed to exist at all. */
	wartosci: WartosciPlanuDnia;
	/** Field errors keyed by the offending control's own indexed name. Empty unless the
	 *  save was refused. */
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
	/** Set only on the conflict branch, whose instruction is „copy your text and reload"
	 *  rather than „try again in a moment". */
	konflikt?: boolean;
	/** What the group's polite status line announces (Contract 7). */
	status?: string;
	/** Where focus goes next (Contract 7). A fresh object per answer. */
	zadanie?: ZadanieFokusu;
	/** The head the form was built from, carried across the round trip so an add cannot
	 *  move the D-10 baseline. */
	sha?: string;
}

/** The committed plan as the form's echo shape. The screen opens on what is on the site. */
function wartosciZPliku(): WartosciPlanuDnia {
	return {
		wiersze: planDnia.rows.map((wiersz) => ({ godziny: wiersz.time, opis: wiersz.what })),
		zastepcza: planDnia.placeholder === true
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
		 *  fresh GET, never by an action return, so a refresh after a save re-runs a
		 *  harmless read instead of committing a second time (Contract 10, D-11). */
		zapisano: url.searchParams.get(ZNACZNIK_ZAPISANO) === '1'
	};
};

/** The head the browser carried back, or undefined. Absent means the check is SKIPPED,
 *  which is `zapiszAtomowo`'s documented behaviour and not a default invented here. */
function shaZFormularza(dane: FormData): string | undefined {
	const surowy = dane.get(POLE_SHA);
	return typeof surowy === 'string' && surowy.length > 0 ? surowy : undefined;
}

/** Move the row at the submitted POSITION one place in `kierunek`. Commits nothing: this is
 *  the add and remove pair with the list's ORDER changing instead of its length (05 D-22).
 *
 *  A day plan is read top to bottom by a parent, so its order IS its content, and an editor
 *  who put breakfast after the walk previously had to retype two rows to fix it.
 *
 *  Deliberately the same shape as the O nas photo move rather than a shared helper: the two
 *  read different echo shapes out of the form (`wartosciPlanuDnia` here, `wartosciONas`
 *  there) and touch different lists inside them, which is the same reason the two screens
 *  already have their own add and remove actions instead of one parameterised pair. */
function przeniesWiersz(dane: FormData, kierunek: KierunekPrzeniesienia): WynikPlanuDnia {
	const wartosci = wartosciPlanuDnia(dane);
	// Bounded against the set that ARRIVED, exactly as the remove action bounds it, so an
	// index outside this very submission can only ever mean „move nothing" (T-04.1-34).
	const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.wiersze.length);
	const docelowy = indeks === null ? -1 : kierunek === 'gora' ? indeks - 1 : indeks + 1;
	if (indeks === null || docelowy < 0 || docelowy >= wartosci.wiersze.length) {
		// Already at the requested end, or an index nobody rendered. Answer with the form as
		// it arrived, and say nothing: no move happened, so there is nothing to announce.
		return { wartosci, pola: {}, sha: shaZFormularza(dane) };
	}
	const [przenoszony] = wartosci.wiersze.splice(indeks, 1);
	wartosci.wiersze.splice(docelowy, 0, przenoszony);
	return {
		wartosci,
		pola: {},
		status: przeniesionoWiersz(indeks + 1, docelowy + 1),
		// A FRESH object naming the NEW position and the direction, so the group can put focus
		// back on the button that was just pressed.
		zadanie: { cel: 'przenies', indeks: docelowy, kierunek } satisfies ZadanieFokusu,
		sha: shaZFormularza(dane)
	};
}

export const actions: Actions = {
	/** Append one empty row. Commits NOTHING: the answer is the same form, one row longer,
	 *  with every typed value still in it. */
	dodajWiersz: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciPlanuDnia(dane);
		wartosci.wiersze.push({ godziny: '', opis: '' });
		const numer = wartosci.wiersze.length;
		return {
			wartosci,
			pola: {},
			status: dodanoWiersz(numer),
			// The new row is the last one, and focus belongs in its first control: an editor
			// who pressed „Dodaj wiersz" is about to type into it.
			zadanie: { cel: 'element', indeks: numer - 1 } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikPlanuDnia;
	},

	/** Remove the row at the submitted POSITION. Commits nothing either. */
	usunWiersz: async ({ request }) => {
		const dane = await request.formData();
		const wartosci = wartosciPlanuDnia(dane);
		// The position is client supplied and is bounded against the set that ARRIVED, so it
		// can only ever name a row of this very submission (T-04.1-34). Out of range means
		// „remove nothing", never „remove something else".
		const indeks = indeksZadania(dane.get(POLE_INDEKSU), wartosci.wiersze.length);
		if (indeks === null) {
			return { wartosci, pola: {}, sha: shaZFormularza(dane) } satisfies WynikPlanuDnia;
		}
		wartosci.wiersze.splice(indeks, 1);
		return {
			wartosci,
			pola: {},
			status: usunietoWiersz(indeks + 1),
			// The control the editor was in has stopped existing, so focus goes to the add
			// button rather than falling back to the top of the document.
			zadanie: { cel: 'dodaj' } satisfies ZadanieFokusu,
			sha: shaZFormularza(dane)
		} satisfies WynikPlanuDnia;
	},

	/** Move a row one place up. Commits nothing; only the ORDER of the echoed list changes,
	 *  and the head SHA travels back in the form so a round trip cannot move the conflict
	 *  baseline forward (D-10). */
	przeniesWGore: async ({ request }) => przeniesWiersz(await request.formData(), 'gora'),

	przeniesWDol: async ({ request }) => przeniesWiersz(await request.formData(), 'dol'),

	/** The ONE action that writes. Validate, serialize, save, redirect: everything expensive
	 *  behind everything cheap, the ordering src/lib/server/admin/zapis.ts enforces
	 *  structurally. */
	zapisz: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		// Captured BEFORE validation, so every refusal below hands it straight back.
		const wartosci = wartosciPlanuDnia(dane);

		const wynik = walidujPlanDnia(dane);
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc,
				sha: shaZFormularza(dane)
			} satisfies WynikPlanuDnia);
		}

		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: KOPIA_EKRAN_PLANU.opisZapisu,
			// Serialized HERE, by the caller, which is what makes an unvalidated save
			// inexpressible in zapiszTresc's signature. See its module header.
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
			} satisfies WynikPlanuDnia);
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
			} satisfies WynikPlanuDnia);
		}

		// 303 rather than 302, so the browser turns the POST into a GET. A refresh of the
		// resulting page can never replay the save, which would be a second commit and a
		// second Cloudflare build of the żłobek's website (D-11).
		redirect(303, `/admin/plan-dnia?${ZNACZNIK_ZAPISANO}=1`);
	}
};
