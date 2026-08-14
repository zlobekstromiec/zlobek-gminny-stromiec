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

		const rysuj = () => {
			widgetId = window.turnstile?.render(cel, {
				sitekey,
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

		return () => {
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
