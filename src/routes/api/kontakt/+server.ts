// POST /api/kontakt (CONTACT-03, FORM-01, FORM-02; 04-RESEARCH.md Pattern 1 and
// Code Example 6). The project's FIRST dynamic route: everything else prerenders.
// A thin adapter only. Every decision lives in obsluz() so this endpoint and the
// enrollment one cannot drift apart, and so the whole decision table is unit
// testable without a runtime.
//
// Secrets come from platform.env only. The Vite build-time env object is
// undefined at runtime on Cloudflare and produces a silent production-only
// failure, so its name is grep-banned across this directory and is therefore
// described here rather than written.
// Nothing here writes a body, a field value, an address or a client IP anywhere.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { obsluz } from '$lib/server/forms/handle';
import { walidujKontakt } from '$lib/server/forms/validate';
import { TEMAT_KONTAKT, wyslij, zbudujTrescKontakt } from '$lib/server/forms/mailer';
import { zweryfikujTurnstile } from '$lib/server/forms/turnstile';
import { podLimitem } from '$lib/server/forms/ratelimit';

// The ONE line that makes this route dynamic. src/routes/+layout.ts sets
// prerender = true for the whole site, so without this opt-out the prerender
// crawler tries to render a POST-only endpoint and the build fails.
export const prerender = false;

/** Body cap in bytes. Generous for a 2000-character message, small enough that an
 *  oversized payload is rejected before anything else runs. */
const MAKS_CIALO = 8192;

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const env = platform?.env;
	if (!env?.RESEND_API_KEY || !env?.TURNSTILE_SECRET_KEY) {
		// A missing binding cannot deliver the message, so it must not report success.
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
	// share a client IP without tripping the limiter. Production leaves
	// RATE_LIMIT_MAX unset, so the module defaults apply: 5 per hour per client and
	// 40 per day site-wide. An unset or unparseable value falls through to those
	// defaults rather than silently disabling the limiter.
	const przetworzony = Number.parseInt(env.RATE_LIMIT_MAX ?? '', 10);
	const limit = Number.isFinite(przetworzony) && przetworzony > 0 ? przetworzony : undefined;
	const dryRun = env.FORM_DRY_RUN === '1';
	const kv = env.FORMS_KV;

	const { wynik, status } = await obsluz(surowe, ip, {
		waliduj: walidujKontakt,
		temat: TEMAT_KONTAKT,
		zbudujTresc: zbudujTrescKontakt,
		replyTo: (dane) => dane.email,
		weryfikujTurnstile: (token, adres) => zweryfikujTurnstile(secret, token, adres),
		podLimitem: (adres) => podLimitem(kv, 'kontakt', adres, sol, limit, limit),
		wyslij: (temat, tresc, replyTo) => wyslij(apiKey, dryRun, temat, tresc, replyTo)
	});

	return json(wynik, { status });
};

// No fallback handler on purpose: an undefined method must keep returning the
// framework's 405, so there is no verb confusion (ASVS V13).
