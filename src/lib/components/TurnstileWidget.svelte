<script lang="ts">
	// Cloudflare Turnstile widget wrapper (FORM-02; 04-UI-SPEC.md Component Contract
	// 5; 04-RESEARCH.md Code Example 1 and Pitfall 4).
	//
	// Why a wrapper at all: the token is single-use and expires after 300 seconds, so
	// the parent island MUST be able to reset the widget after every failed submit.
	// Without that, a parent who fixes one validation error gets a second, unfixable
	// error on retry (`timeout-or-duplicate`), which is the single most common
	// Turnstile integration bug and lands squarely on D-12's promise that a failure
	// keeps every typed value and lets the parent try again.
	//
	// The loader is requested in the explicit-render mode with a named onload
	// callback, from inside svelte:head, so the tag lands in the prerendered HTML of
	// exactly the pages that mount this component and nowhere else. The host is
	// already allowed by the script-src, connect-src and frame-src directives added
	// to svelte.config.js in Plan 01.
	//
	// Every window access is guarded with the typeof pattern MobileNav.svelte
	// established: these pages prerender, so the module body also runs in Node.
	let {
		sitekey,
		onToken
	}: {
		sitekey: string;
		/** Called with the token on success, and with null whenever the held token
		 *  stops being valid (expiry, widget error, explicit reset), so the parent can
		 *  never send a stale one. */
		onToken: (token: string | null) => void;
	} = $props();

	// Local test seam (Plan 07). The live widget is hostname-scoped to the Pages
	// origin and the custom domain, so off those origins Cloudflare renders an
	// unknown-domain error and issues NO token at all. The Playwright suite serves the
	// built site on localhost and drives both form success paths, so with the live key
	// hard-coded every one of those runs would wait forever for a token that can never
	// arrive. Substituting Cloudflare's published always-passes dummy site key on
	// localhost keeps that suite meaningful.
	//
	// This CANNOT weaken production, and the reason is worth stating: the site key only
	// selects which widget challenges the visitor, while the decision to accept a
	// submission is made server-side by siteverify using the secret in
	// `platform.env.TURNSTILE_SECRET_KEY`, which in production is the LIVE secret. A
	// dummy token presented to the live secret is rejected, so forcing this branch in a
	// browser buys an attacker nothing: it fails closed, exactly like a mismatched pair.
	// The dummy key is a published Cloudflare constant, not a credential.
	const SITEKEY_TESTOWY = '1x00000000000000000000AA';
	const HOSTY_TESTOWE = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

	let kontener: HTMLDivElement | undefined = $state();
	/** Not $state: nothing renders from it, and the effect owns its whole lifetime. */
	let widgetId: string | undefined;

	/** Re-challenge and drop the held token. The parent calls this in EVERY
	 *  non-success branch of its submit handler, before re-enabling the button. */
	export function reset(): void {
		if (typeof window === 'undefined') return;
		if (widgetId !== undefined) window.turnstile?.reset(widgetId);
		onToken(null);
	}

	$effect(() => {
		if (typeof window === 'undefined' || !kontener) return;
		const cel = kontener;

		// Resolved inside the effect, which is browser-only, so the prerendered HTML
		// never depends on a hostname the build cannot know.
		const kluczEfektywny = HOSTY_TESTOWE.has(window.location.hostname) ? SITEKEY_TESTOWY : sitekey;

		const rysuj = () => {
			// Ładowarka jest skryptem trzeciej strony i może dojechać już po
			// odmontowaniu komponentu. Rysowanie w odpiętym kontenerze tworzy
			// osierocony widget, którego identyfikatora sprzątanie nie ma już jak
			// usunąć, bo wykonało się wcześniej.
			if (!cel.isConnected) return;

			widgetId = window.turnstile?.render(cel, {
				sitekey: kluczEfektywny,
				// Polish UI to match the rest of the page (SITE-06), light theme to match
				// the white form card.
				language: 'pl',
				theme: 'light',
				callback: (token: string) => onToken(token),
				// A form left open past the token lifetime re-challenges instead of
				// failing at submit time, and a widget error clears the token rather
				// than letting a broken challenge look like a passed one.
				'expired-callback': () => onToken(null),
				'error-callback': () => onToken(null)
			});
		};

		if (window.turnstile) rysuj();
		else window.__onTurnstileLoad = rysuj;

		// Efekt jest właścicielem całego życia tego, co zainstalował, więc globalny
		// callback odchodzi razem z widgetem, a porównanie tożsamości pilnuje, żeby
		// jedna instancja nie sprzątała po drugiej (przy istniejącym window.turnstile
		// komponent idzie szybką ścieżką i nie instaluje niczego).
		return () => {
			if (window.__onTurnstileLoad === rysuj) window.__onTurnstileLoad = undefined;
			if (widgetId !== undefined) window.turnstile?.remove(widgetId);
			widgetId = undefined;
		};
	});
</script>

<svelte:head>
	<script
		src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__onTurnstileLoad"
		defer
	></script>
</svelte:head>

<div class="slot" bind:this={kontener}></div>

<style>
	/* The slot reserves the widget's footprint BEFORE hydration so the arriving
	   iframe causes no layout shift. 65px is Cloudflare's own rendered widget height,
	   a vendor-fixed dimension we do not control, and it is the single declared
	   exception to this project's multiple-of-4 spacing rule (04-UI-SPEC §Spacing
	   Scale): rounding down to 64px clips the widget by 1px, rounding up to 68px
	   leaves dead space and still does not match. It is never used as a padding,
	   margin, gap or rhythm value anywhere else. */
	.slot {
		min-width: 300px;
		min-height: 65px;
	}
</style>
