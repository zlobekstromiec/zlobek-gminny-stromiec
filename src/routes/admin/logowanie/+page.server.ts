// The two-step e-mail-code login (SC1, CMS-01; 04.1-UI-SPEC Component Contract 2 and
// its login state matrix; threats T-04.1-03, T-04.1-04, T-04.1-05, T-04.1-17,
// T-04.1-18). Two form actions and nothing else: the screen needs no JavaScript, and
// the browser's own navigation is the whole client.
//
// ------------------------------------------------------------------------------
// P-08: WHY THE SEND IS DEFERRED HERE, WHEN src/lib/server/forms/mailer.ts BANS IT
// ------------------------------------------------------------------------------
// That module states, at length, that a send must be AWAITED and its real outcome
// returned, and it grep-bans the execution context's post-response hook so the rule is
// machine-checkable. The ban is real and it is not weakened by this file. It exists
// because a parent who is told their child's enrolment was sent, when the send failed,
// has lost something they cannot recover and will never know: the message is stored
// nowhere, and there is no retry they would think to perform. Its scope is exactly the
// two paths that carry such a message, src/lib/server/forms/ and src/routes/api/, and
// `grep -rc 'waitUntil'` over both still reports no match.
//
// A login code is a different object. It has a user-driven retry („Wyślij kod
// ponownie") that is visible on the same screen, it costs nothing to reissue, and a
// lost one is noticed within seconds by the person waiting for it. The rationale
// therefore does not transfer, while the reason to defer is severe: awaiting Resend
// only in the allowlisted branch makes the RESPONSE TIME an enumeration oracle
// (T-04.1-04), which is the exact property D-02 exists to remove and no amount of
// identical copy can fix. So this file, which is in neither banned path, hands the send
// to the post-response hook.
//
// Residual risk, accepted and named: a send failure is invisible inside that request.
// The UI covers it with the „Nie udało się wysłać kodu" panel reachable through a
// retry, and the response-time distribution check on the live deployment is owned by
// Plan 10 and listed in 04.1-VALIDATION.md „Not Inferable From Unit Tests" item 1.
//
// The STORE is still awaited. Deferring it too would close a second, much smaller
// timing gap (one KV write), at the cost of making the moment a code becomes
// exchangeable unobservable, which is a race the attempt-cap acceptance test would
// have to sleep through. That trade was not worth taking.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined at
// runtime on Cloudflare and produces a silent production-only failure, so its name is
// grep-banned across server code and is described here rather than written.
//
// Nothing here logs. An editor's address is personal data on a public body's system
// (RODO, C-03) and the body of the deferred message carries a live login code.
import { fail, redirect, type Actions, type RequestEvent } from '@sveltejs/kit';
import { bezpiecznyEmail, MAKS_EMAIL } from '$lib/server/forms/sanitize';
import { naLiscie, uchwytZAdresu } from '$lib/server/admin/allowlist';
import { podpiszSesje, ustawCiastko } from '$lib/server/admin/sesja';
import {
	podLimitemKodu,
	podLimitemProby,
	sprawdzKod,
	wygenerujKod,
	zapiszKod
} from '$lib/server/admin/kod';
import { wyslijKod } from '$lib/server/admin/mail-kod';
import { KOPIA_LOGOWANIE } from '$lib/content/panel';

/** Everything a rendered login state needs. One flat shape for both actions, so the
 *  page reads one object and the state matrix lives in exactly one place. */
export interface WynikLogowania {
	krok: 1 | 2;
	/** The typed address, echoed back so a typo is visible and never lost. */
	adres: string;
	/** Inline field error on the address input. */
	bladAdresu?: string;
	/** Inline field error on the code input. */
	bladKodu?: string;
	/** Alert panel above the form. Heading and body always travel together. */
	panelNaglowek?: string;
	panelTresc?: string;
}

/** Keep the raw typed value for re-rendering without letting an absurd payload into
 *  the DOM. The value is only ever placed in an input `value`, where the template
 *  escapes it, so this is a size bound and not an escaping measure. */
function zachowanaWartosc(surowa: FormDataEntryValue | null): string {
	return typeof surowa === 'string' ? surowa.slice(0, MAKS_EMAIL) : '';
}

/**
 * Run work after the response has been sent.
 *
 * This is the whole of P-08 in one place, so there is exactly one line in the file
 * that could ever be turned back into an await. The fallback path exists because the
 * execution context is a Cloudflare-only object: without it the work still runs, it
 * simply has no keep-alive guarantee. It is deliberately NOT awaited even then,
 * because awaiting would restore precisely the timing oracle this function removes.
 */
function poOdpowiedzi(event: RequestEvent, praca: Promise<unknown>): void {
	const ctx = event.platform?.ctx;
	if (ctx && typeof ctx.waitUntil === 'function') {
		ctx.waitUntil(praca);
		return;
	}
	void praca.catch(() => undefined);
}

export const actions: Actions = {
	/**
	 * Step 1: accept an address and, if and only if it is on the allowlist, put a code
	 * in its inbox.
	 *
	 * T-04.1-03: past the field-validation branch this action has exactly ONE return.
	 * Both allowlist branches produce the same status, the same shape, the same fields
	 * and the same echoed address, because there is literally one `return` statement to
	 * produce them. There is no „nie znaleziono" string in src/lib/content/panel.ts to
	 * reach for, which is the copy module enforcing the same rule from the other side.
	 */
	wyslij: async (event) => {
		const dane = await event.request.formData();
		const surowy = dane.get('adres');
		const adres = bezpiecznyEmail(surowy);
		if (!adres) {
			const zachowany = zachowanaWartosc(surowy);
			return fail(400, {
				krok: 1,
				adres: zachowany,
				bladAdresu:
					zachowany.trim().length === 0
						? KOPIA_LOGOWANIE.bladAdresBrak
						: KOPIA_LOGOWANIE.bladAdresNiepoprawny
			} satisfies WynikLogowania);
		}

		const env = event.platform?.env;
		const sol = env?.RATE_LIMIT_SALT ?? '';
		// One clock read for the whole request, the ratelimit.ts single-clock rule.
		const teraz = Date.now();
		// One override raises BOTH ceilings, exactly as the two public endpoints do, so
		// the Playwright suite can share a client address. Unset in production, where
		// the constants in kod.ts apply.
		const przetworzony = Number.parseInt(env?.RATE_LIMIT_MAX ?? '', 10);
		const limit = Number.isFinite(przetworzony) && przetworzony > 0 ? przetworzony : undefined;

		// The limiter runs for EVERY address, before the allowlist is consulted, so its
		// cost is paid identically on both branches. Its refusal is the one response
		// that is allowed to differ, and it leaks nothing: the counter is keyed on the
		// client, never on the address, so it says „this device has asked a lot" and
		// nothing whatever about who is on the list.
		if (
			!(await podLimitemKodu(env?.FORMS_KV, event.getClientAddress(), sol, teraz, limit, limit))
		) {
			return fail(429, {
				krok: 1,
				adres,
				panelNaglowek: KOPIA_LOGOWANIE.limitNaglowek,
				panelTresc: KOPIA_LOGOWANIE.limitTresc
			} satisfies WynikLogowania);
		}

		if (naLiscie(adres, env?.ADMIN_EMAILS)) {
			const kod = wygenerujKod();
			const zapis = await zapiszKod(env?.FORMS_KV, adres, kod, sol, teraz);
			// A store failure is swallowed on purpose. Reporting it here would answer
			// „that address is on the list" to anyone who could provoke a KV error, and
			// the editor still has a recoverable path: the code they never receive reads
			// as „Kod stracił ważność" on exchange, whose instruction is „Wyślij kod
			// ponownie". That is the correct instruction for this state as well.
			if (zapis.ok) {
				poOdpowiedzi(
					event,
					wyslijKod(env?.RESEND_API_KEY ?? '', env?.PANEL_DRY_RUN === '1', adres, kod)
				);
			}
		}

		// THE single return. Do not add a second one below this line, and do not make
		// this object depend on anything the allowlist test decided.
		return { krok: 2, adres } satisfies WynikLogowania;
	},

	/**
	 * Step 2: exchange a code for a session.
	 *
	 * T-04.1-18: the address arrives in a hidden field, so it is client-supplied and is
	 * re-sanitized and re-checked against the allowlist before anything is signed. It
	 * could not be used to log in as somebody else even without that re-check, because
	 * the stored code hash is keyed on the address and a swapped one cannot match, but
	 * the boundary does not rest on a second module's key derivation.
	 */
	zaloguj: async (event) => {
		const dane = await event.request.formData();
		const adres = bezpiecznyEmail(dane.get('adres'));
		if (!adres) {
			// The hidden field was lost or tampered with. Back to step 1, which is the
			// only screen that can produce a usable one.
			return fail(400, {
				krok: 1,
				adres: '',
				bladAdresu: KOPIA_LOGOWANIE.bladAdresBrak
			} satisfies WynikLogowania);
		}

		const kod = zachowanaWartosc(dane.get('kod')).trim();
		if (kod.length === 0) {
			return fail(400, {
				krok: 2,
				adres,
				bladKodu: KOPIA_LOGOWANIE.bladKodBrak
			} satisfies WynikLogowania);
		}

		const env = event.platform?.env;
		const sol = env?.RATE_LIMIT_SALT ?? '';
		const teraz = Date.now();
		const przetworzony = Number.parseInt(env?.RATE_LIMIT_MAX ?? '', 10);
		const limit = Number.isFinite(przetworzony) && przetworzony > 0 ? przetworzony : undefined;

		// A GUESS AT A CREDENTIAL IS RATE LIMITED BEFORE IT IS CHECKED. Without this line
		// the only control on this action is MAKS_PROB inside sprawdzKod, and that cap is
		// a read-modify-write on KV: it bounds an editor mistyping and it does not bound a
		// burst, for the three reasons written above podLimitemProby. The budget is keyed
		// on the client and lives in a bucket of its own, so a flood of wrong codes cannot
		// consume the budget for asking for a new one, and it says nothing about who is on
		// the allowlist because it never sees the address.
		//
		// It fails CLOSED, unlike the send limiter in the action above and unlike
		// everything in ratelimit.ts. That module's fail-open degrade is right for a
		// parent's enquiry, where refusing costs a message stored nowhere; it is wrong
		// here, where failing open on a KV outage would remove the only rate limit in
		// front of a guess at a 10^6 space. It costs an editor nothing, because sprawdzKod
		// already refuses the login on the same outage: nobody logs in during a KV failure
		// either way, and the only thing this direction changes is that nobody guesses
		// during one either.
		if (
			!(await podLimitemProby(env?.FORMS_KV, event.getClientAddress(), sol, teraz, limit, limit))
		) {
			return fail(429, {
				krok: 2,
				adres,
				panelNaglowek: KOPIA_LOGOWANIE.limitNaglowek,
				panelTresc: KOPIA_LOGOWANIE.limitProbTresc
			} satisfies WynikLogowania);
		}

		const wynik = await sprawdzKod(env?.FORMS_KV, adres, kod, sol, teraz);

		if (!wynik.ok) {
			// The UI-SPEC login state matrix, one branch per outcome of the union.
			if (wynik.powod === 'zly-kod') {
				return fail(400, {
					krok: 2,
					adres,
					bladKodu: KOPIA_LOGOWANIE.bladKodNiepoprawny
				} satisfies WynikLogowania);
			}
			if (wynik.powod === 'wygasl') {
				return fail(400, {
					krok: 2,
					adres,
					panelNaglowek: KOPIA_LOGOWANIE.kodWygaslNaglowek,
					panelTresc: KOPIA_LOGOWANIE.kodWygaslTresc
				} satisfies WynikLogowania);
			}
			if (wynik.powod === 'za-duzo-prob') {
				// Step 2 stays visible with a working „Wyślij kod ponownie", because the
				// code is burned but the person is not locked out: an address lockout is
				// a denial of service handed to anyone who knows a staff e-mail.
				return fail(429, {
					krok: 2,
					adres,
					panelNaglowek: KOPIA_LOGOWANIE.zaDuzoProbNaglowek,
					panelTresc: KOPIA_LOGOWANIE.zaDuzoProbTresc
				} satisfies WynikLogowania);
			}
			return fail(500, {
				krok: 2,
				adres,
				panelNaglowek: KOPIA_LOGOWANIE.wysylkaBladNaglowek,
				panelTresc: KOPIA_LOGOWANIE.wysylkaBladTresc
			} satisfies WynikLogowania);
		}

		const sekret = env?.ADMIN_SESSION_SECRET;
		// The allowlist is re-checked at the moment the session is minted, not only at
		// the moment the code was issued, so an address removed in between never gets
		// one. It is reported as an expired code rather than as a refusal, because
		// „that address is not allowed" is the one sentence D-02 forbids this screen to
		// say, and „Wyślij kod ponownie" is a harmless instruction for somebody who is
		// genuinely no longer an editor.
		//
		// A missing signing secret lands in the same family failure panel as a KV
		// error. It fails CLOSED, which is the direction every branch in this flow
		// fails, and it reuses that copy rather than inventing a new sentence: the
		// panel already says „try again shortly, and if it keeps happening contact
		// whoever gave you access", which is exactly the right advice for an
		// unconfigured deployment.
		if (typeof sekret !== 'string' || sekret.trim().length === 0) {
			return fail(500, {
				krok: 2,
				adres,
				panelNaglowek: KOPIA_LOGOWANIE.wysylkaBladNaglowek,
				panelTresc: KOPIA_LOGOWANIE.wysylkaBladTresc
			} satisfies WynikLogowania);
		}
		if (!naLiscie(adres, env?.ADMIN_EMAILS)) {
			return fail(400, {
				krok: 2,
				adres,
				panelNaglowek: KOPIA_LOGOWANIE.kodWygaslNaglowek,
				panelTresc: KOPIA_LOGOWANIE.kodWygaslTresc
			} satisfies WynikLogowania);
		}

		ustawCiastko(
			event.cookies,
			await podpiszSesje(sekret, adres, uchwytZAdresu(adres), Date.now())
		);
		// 303 rather than 302, so the browser turns the POST into a GET and a refresh of
		// the pulpit can never replay the exchange of a code that no longer exists.
		redirect(303, '/admin');
	}
};
