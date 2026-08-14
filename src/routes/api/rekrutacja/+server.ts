// POST /api/rekrutacja (RECRUIT-03, RECRUIT-04, FORM-01, FORM-02; 04-RESEARCH.md
// Pattern 1 and Code Example 6; 04-PATTERNS.md). The project's SECOND dynamic
// route, and a near-exact sibling of /api/kontakt: it differs only in the
// dependencies it injects.
//
// The duplication is deliberate. Factoring the two endpoints into one handler with
// a form-name parameter was considered and rejected: every security-relevant
// decision (the cheap-checks-first ordering, the fail-closed Turnstile call, the
// rate limit, the constant recipient) already lives in the shared orchestrator that
// both endpoints call and neither reimplements, so two thin,
// readable, independently reviewable files are worth twenty duplicated lines and a
// shared handler would only add a branch where the two forms could diverge
// (T-04-25).
//
// Secrets come from platform.env only. The Vite build-time env object is
// undefined at runtime on Cloudflare and produces a silent production-only
// failure, so its name is grep-banned across this directory and is therefore
// described here rather than written.
// Nothing here writes a body, a field value, an address or a client IP anywhere.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { obsluz } from '$lib/server/forms/handle';
import { walidujZgloszenie } from '$lib/server/forms/validate';
import { TEMAT_ZGLOSZENIE, wyslij, zbudujTrescZgloszenie } from '$lib/server/forms/mailer';
import { zweryfikujTurnstile } from '$lib/server/forms/turnstile';
import { podLimitem } from '$lib/server/forms/ratelimit';
import { nazwaMiesiaca } from '$lib/content/forms';

// The ONE line that makes this route dynamic. src/routes/+layout.ts sets
// prerender = true for the whole site, so without this opt-out the prerender
// crawler tries to render a POST-only endpoint and the build fails.
export const prerender = false;

/** Body cap in bytes, identical to the contact endpoint. Generous for a
 *  2000-character message, small enough that an oversized payload is rejected
 *  before anything else runs. */
const MAKS_CIALO = 8192;

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const env = platform?.env;
	if (!env?.RESEND_API_KEY || !env?.TURNSTILE_SECRET_KEY) {
		// A missing binding cannot deliver the enquiry, so it must not report success.
		return json({ ok: false, code: 'wysylka' }, { status: 502 });
	}

	// Cheapest checks first: wrong content type, then declared size, then real size.
	if (!(request.headers.get('content-type') ?? '').includes('application/json')) {
		return json({ ok: false, code: 'walidacja' }, { status: 400 });
	}
	const zadeklarowany = Number(request.headers.get('content-length') ?? '0');
	if (Number.isFinite(zadeklarowany) && zadeklarowany > MAKS_CIALO) {
		return json({ ok: false, code: 'walidacja' }, { status: 400 });
	}
	const surowe = await request.text();
	if (new TextEncoder().encode(surowe).byteLength > MAKS_CIALO) {
		return json({ ok: false, code: 'walidacja' }, { status: 400 });
	}

	const ip = getClientAddress();
	const secret = env.TURNSTILE_SECRET_KEY;
	const apiKey = env.RESEND_API_KEY;
	const sol = env.RATE_LIMIT_SALT ?? '';
	// One override raises BOTH ceilings, which is what lets the Playwright suite
	// share a client address without tripping the limiter. Production leaves
	// RATE_LIMIT_MAX unset, so the module defaults apply: 5 per hour per client and
	// 40 per day site-wide. An unset or unparseable value falls through to those
	// defaults rather than silently disabling the limiter.
	const przetworzony = Number.parseInt(env.RATE_LIMIT_MAX ?? '', 10);
	const limit = Number.isFinite(przetworzony) && przetworzony > 0 ? przetworzony : undefined;
	const dryRun = env.FORM_DRY_RUN === '1';
	const kv = env.FORMS_KV;

	const { wynik, status } = await obsluz(surowe, ip, {
		waliduj: walidujZgloszenie,
		temat: TEMAT_ZGLOSZENIE,
		zbudujTresc: (dane) => zbudujTrescZgloszenie(dane, nazwaMiesiaca),
		replyTo: (dane) => dane.email,
		weryfikujTurnstile: (token, adres) => zweryfikujTurnstile(secret, token, adres),
		// The form name is part of the KV key, and THAT is what gives the enrollment
		// form its own counter: a busy contact form can never lock a parent out of an
		// enrollment enquiry, or the other way round (T-04-26).
		podLimitem: (adres) => podLimitem(kv, 'rekrutacja', adres, sol, limit, limit),
		wyslij: (temat, tresc, replyTo) => wyslij(apiKey, dryRun, temat, tresc, replyTo)
	});

	return json(wynik, { status });
};

// No fallback handler on purpose: an undefined method must keep returning the
// framework's 405, so there is no verb confusion (ASVS V13).
