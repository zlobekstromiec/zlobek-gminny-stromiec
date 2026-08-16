// The ONE gate in front of the admin panel (SC1; 04.1-01-PLAN.md threats
// T-04.1-01, T-04.1-02 and T-04.1-09). It lives in a hook rather than in each
// route on purpose: handle() runs before routing, so a single check covers pages
// AND form actions AND paths that have no route yet, and no screen added by a
// later plan can forget to check.
//
// Secrets come from platform.env only. The Vite build-time env object is undefined
// at runtime on Cloudflare and produces a silent production-only failure, so its
// name is grep-banned across server code and is therefore described here rather
// than written.
//
// Every branch below fails CLOSED. That is a deliberate divergence from the
// documented fail-open degrade in src/lib/server/forms/ratelimit.ts: the rate
// limiter is an abuse control sitting behind Turnstile, where refusing a parent's
// enrollment would cost more than it protects, whereas this file IS the
// authentication boundary and a missing binding must open nothing.
//
// Nothing here logs an address, a handle or a cookie value (RODO, C-03).
import { redirect, type Handle } from '@sveltejs/kit';
import {
	NAZWA_CIASTKA,
	podpiszSesje,
	ustawCiastko,
	weryfikujSesje,
	wymagaOdnowienia
} from '$lib/server/admin/sesja';
import { naLiscie } from '$lib/server/admin/allowlist';

/** Where a refused request lands. `powod` drives the neutral band panel on the
 *  login screen: an expired session is expected, not a failure (UI-SPEC login
 *  state matrix), so it is never presented as an error. */
const CEL_ODMOWY = '/admin/logowanie?powod=wygasla';

/** The only admin paths reachable without a session. Matched as a whole path or a
 *  whole path segment, so a route such as /admin/logowanie-cos cannot inherit the
 *  exemption by prefix alone. */
const PUBLICZNE = ['/admin/logowanie'];

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// Everything outside the panel is untouched: the rest of the site prerenders to
	// static HTML and must not pay for this gate.
	if (pathname !== '/admin' && !pathname.startsWith('/admin/')) return resolve(event);
	if (PUBLICZNE.some((sciezka) => pathname === sciezka || pathname.startsWith(`${sciezka}/`))) {
		return resolve(event);
	}

	const env = event.platform?.env;
	const sekret = env?.ADMIN_SESSION_SECRET;
	// One clock read for the whole request, so the verify and the renewal decision
	// cannot disagree (the ratelimit.ts single-clock rule).
	const teraz = Date.now();
	const sesja = await weryfikujSesje(sekret, event.cookies.get(NAZWA_CIASTKA), teraz);

	// The allowlist re-check is what makes a stateless cookie revocable: removing an
	// address from ADMIN_EMAILS and rebuilding logs that person out on their next
	// request rather than up to 30 days later (D-02, D-03). Deleting it leaves this
	// file type-clean, which is exactly why a Playwright case pins it.
	if (!sesja || !naLiscie(sesja.adres, env?.ADMIN_EMAILS)) {
		if (event.request.method !== 'GET') {
			// Fails CLOSED, and returns a response rather than throwing: a thrown
			// redirect from a non-GET request is handled by the action machinery, and
			// an expired session must never silently swallow a POST.
			return new Response(null, { status: 303, headers: { location: CEL_ODMOWY } });
		}
		// Fails CLOSED. Throws, so nothing downstream of this line ever runs.
		redirect(303, CEL_ODMOWY);
	}

	// Only the short non-personal handle crosses into the app (D-04). The full
	// address stays inside the signed cookie payload.
	event.locals.editor = sesja.uchwyt;

	// D-03 renew-on-use, at the P-02 cadence: only once more than the threshold of
	// the life has elapsed, so most page views emit no Set-Cookie at all. Set before
	// resolve() so SvelteKit attaches it to whatever response the route produces.
	if (typeof sekret === 'string' && wymagaOdnowienia(sesja, teraz)) {
		ustawCiastko(event.cookies, await podpiszSesje(sekret, sesja.adres, sesja.uchwyt, teraz));
	}

	return resolve(event);
};
