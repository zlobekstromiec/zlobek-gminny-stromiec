// Ambient declarations for the Cloudflare Turnstile loader (FORM-02,
// 04-RESEARCH.md Code Example 1). Deliberately minimal and local: a wrapper
// typings package was rejected in 04-RESEARCH.md (§Alternatives Considered)
// because the entire surface this project touches is three methods and one
// loader callback, and a dependency for that is not worth the supply chain.
//
// Only the members src/lib/components/TurnstileWidget.svelte actually calls are
// declared. Widening this file later is a deliberate act, not an accident.
//
// Both members are OPTIONAL on purpose: the loader script is fetched from a third
// party and may be blocked, slow or offline, so every call site must handle its
// absence rather than assume the global exists (Component Contract 5: a failed
// widget surfaces as the Polish turnstile message with the phone fallback, never
// as a silently dead form).

/** Options passed to `turnstile.render`. The hyphenated callback names are
 *  Cloudflare's own API shape, which is why they are quoted. */
interface TurnstileOpcjeRender {
	sitekey: string;
	language?: string;
	theme?: 'light' | 'dark' | 'auto';
	callback?: (token: string) => void;
	'expired-callback'?: () => void;
	'error-callback'?: () => void;
}

interface TurnstileApi {
	/** Returns the widget id used by `reset` and `remove`, or undefined on failure. */
	render: (kontener: HTMLElement, opcje: TurnstileOpcjeRender) => string | undefined;
	reset: (widgetId: string) => void;
	remove: (widgetId: string) => void;
}

declare global {
	interface Window {
		turnstile?: TurnstileApi;
		/** Named loader callback: the script is requested in explicit-render mode, so
		 *  Cloudflare invokes this once the API is ready. The double underscore marks
		 *  it as an internal bridge, not a public site global. */
		__onTurnstileLoad?: () => void;
	}
}

export {};
