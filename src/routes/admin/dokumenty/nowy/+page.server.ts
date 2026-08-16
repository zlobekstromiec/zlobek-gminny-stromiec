// Creating a dokument (CMS-02, D-07, D-14, P-23; 04.1-UI-SPEC Component Contracts 5, 9
// and 10).
//
// THE SEQUENCE IS: validate, refuse a collision, serialize, save BOTH files as one commit,
// redirect. Everything expensive sits behind everything cheap, which is the ordering
// src/lib/server/admin/zapis.ts enforces structurally: an invalid submission costs a few
// comparisons and never reaches a token mint, let alone GitHub.
//
// THE ENTRY AND ITS FILE ARE ONE COMMIT, and that is D-07 rather than an optimisation. Two
// commits would be two Cloudflare builds, roughly four minutes, and a window in which the
// żłobek's website either lists a document nobody can download or serves a file nothing
// points at. The list of files handed to the orchestrator is built once, here, and the
// orchestrator is called exactly once.
//
// STAFF NEVER TYPE A FILENAME (D-14, P-23). A document's identity is the slug of its name,
// the JSON is that slug under the content directory, the file is that slug with the
// extension its accepted media type dictates, and the stored `plik` value is the canonical
// public path built from both. Nothing the request supplied reaches either path.
//
// P-23, AND IT IS A DATA-LOSS GUARD RATHER THAN A NICETY: if the generated slug is already
// taken, the create is REFUSED. Overwriting silently would replace a colleague's document
// with no trace an editor could see, and a random suffix would make the download address of
// a document unpredictable.
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
	opisDodaniaDokumentu
} from '$lib/content/panel';
import { lataDoWyboru } from '$lib/daty';
import { opcjeKategorii } from '$lib/kategorie-dokumentow';
import {
	POLE_SHA,
	ZNACZNIK_ZAPISANO,
	pusteWartosciDokumentu,
	wartosciDokumentu,
	type WartosciDokumentu
} from '$lib/pola-dokumentu';
import type { PlikDoZapisu } from '$lib/server/admin/commit';
import { readDokumentyPanelu } from '$lib/server/admin/dokumenty';
import { sciezkaDokumentu, sciezkaTresciDokumentu } from '$lib/server/admin/plik';
import { serializujJson } from '$lib/server/admin/serializuj';
import { walidujDokument, zPlikiem } from '$lib/server/admin/walidacja/dokumenty';
import { aktualnyShaGlowy, zapiszTresc } from '$lib/server/admin/zapis';
import type { PageServerLoad } from './$types';

/** Commit scope for D-04's `tresc(<zakres>): ...` subject. */
const ZAKRES = 'dokumenty';

/** Everything a refused submission hands back to the screen. One flat shape, so every branch
 *  of the action produces the same fields and the page reads one object. */
export interface WynikDokumentu {
	/** Contract 10c: every typed value intact, INCLUDING the prepared file. */
	wartosci: WartosciDokumentu;
	/** Field errors keyed by the control names, empty when the refusal is not a field
	 *  problem. The summary panel links to each one. */
	pola: Record<string, string>;
	panelNaglowek?: string;
	panelTresc?: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	// Today, pre-selected, because a document is usually added on or near the day its version
	// is dated. Read in UTC: on a Worker there is no local clock to read instead, and between
	// midnight and two in the morning Warsaw time this offers yesterday. The three selects are
	// right there and the value is visible before saving, which is the whole reason the date is
	// a visible control rather than a hidden field.
	const teraz = new Date();
	const rok = teraz.getUTCFullYear();
	return {
		wartosci: pusteWartosciDokumentu(
			String(teraz.getUTCDate()),
			String(teraz.getUTCMonth() + 1),
			String(rok)
		),
		lata: lataDoWyboru(rok),
		kategorie: opcjeKategorii(POLA_DOKUMENT.kategorieOpcje),
		/** Undefined when the head could not be read, which degrades to „save without the
		 *  conflict check" rather than to „this screen will not open". The reasoning is written
		 *  out at aktualnyShaGlowy in src/lib/server/admin/zapis.ts. */
		sha: await aktualnyShaGlowy(platform?.env)
	};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		const dane = await request.formData();
		// Captured BEFORE validation, so every refusal below can hand it straight back.
		const wartosci = wartosciDokumentu(dane);

		// A file is REQUIRED on a create: a document entry with no file is exactly the entry
		// the public reader skips with a warning and nobody ever sees.
		const wynik = walidujDokument(dane, true);
		if (!wynik.ok) {
			return fail(400, {
				wartosci,
				pola: wynik.pola,
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc
			} satisfies WynikDokumentu);
		}

		// P-23. Compared against the entries the reader returns, so „already exists" means the
		// same thing here as it does on the website.
		if (readDokumentyPanelu().some((dokument) => dokument.slug === wynik.slug)) {
			return fail(409, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.kolizjaDokumentNaglowek,
				panelTresc: KOPIA_ZAPIS.kolizjaDokumentTresc
			} satisfies WynikDokumentu);
		}

		// `wynik.plik` is present by construction here: it is required on a create and its
		// absence would have been refused above. The check is what says that to the compiler.
		if (wynik.plik === undefined) {
			return fail(400, {
				wartosci,
				pola: { plik: KOPIA_WALIDACJA.plikBrak },
				panelNaglowek: KOPIA_WALIDACJA.podsumowanieNaglowek,
				panelTresc: KOPIA_WALIDACJA.podsumowanieTresc
			} satisfies WynikDokumentu);
		}

		const sciezki = sciezkaDokumentu(wynik.slug, wynik.plik.rozszerzenie);
		const wpis = zPlikiem(wynik.dane, sciezki.publiczna);

		// TWO FILES, ONE LIST, ONE CALL. The JSON goes FIRST, so a person reading the commit
		// sees the document before its bytes.
		const pliki: PlikDoZapisu[] = [
			{ sciezka: sciezkaTresciDokumentu(wynik.slug), tresc: serializujJson(wpis) },
			{
				sciezka: sciezki.repo,
				// PASSED THROUGH UNCHANGED. The browser produced this encoding while the editor was
				// looking at the file name, and nothing on the server reads, decodes or re-encodes
				// it: see the header of src/lib/server/admin/plik.ts for the reason.
				tresc: wynik.plik.base64,
				base64: true
			}
		];

		const oczekiwanySha = dane.get(POLE_SHA);
		const zapis = await zapiszTresc({
			env: platform?.env,
			uchwyt: locals.editor,
			zakres: ZAKRES,
			opis: opisDodaniaDokumentu(wynik.dane.nazwa),
			// Serialized HERE, by the caller, which is what makes an unvalidated save
			// inexpressible in zapiszTresc's signature. See its module header.
			pliki,
			oczekiwanySha:
				typeof oczekiwanySha === 'string' && oczekiwanySha.length > 0 ? oczekiwanySha : undefined
		});

		if (zapis.stan === 'konflikt') {
			return fail(409, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.konfliktNaglowek,
				panelTresc: KOPIA_ZAPIS.konfliktTresc
			} satisfies WynikDokumentu);
		}

		if (zapis.stan === 'blad') {
			// The missing-binding detail zapiszTresc may carry is deliberately NOT rendered:
			// „the deployment is missing GITHUB_APP_PRIVATE_KEY" is not a sentence a żłobek staff
			// member can act on, and it is a sentence an attacker would enjoy.
			return fail(500, {
				wartosci,
				pola: {},
				panelNaglowek: KOPIA_ZAPIS.bladNaglowek,
				panelTresc: KOPIA_ZAPIS.bladTresc
			} satisfies WynikDokumentu);
		}

		// 303 TO THE LIST, and deliberately NOT to the edit screen of the document that was
		// just written. The panel reads its content through a build-time glob, so the new file
		// does not exist for anything to read until Cloudflare has rebuilt: an edit screen for
		// it would answer „nie znaleziono tej treści" for the next two minutes, which is the
		// opposite of what just happened. The list says „Zapisano", repeats the two-minute
		// promise and links to the public documents page. This is the same correction Plan
		// 04.1-06 had to make for aktualności, for the same reason.
		//
		// 303 rather than 302 so the browser turns the POST into a GET: a refresh of the
		// resulting page can never replay the save, which would be a second commit and a second
		// Cloudflare build of the żłobek's website (D-11).
		redirect(303, `/admin/dokumenty?${ZNACZNIK_ZAPISANO}=${wynik.slug}`);
	}
};
