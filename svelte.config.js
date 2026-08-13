import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Section routes linked from the persistent nav/footer that are authored in
// later plans of this phase (Plans 04–05) and Phase 6 (deklaracja). The header
// and footer link to them from now, so the prerender crawler will hit a 404
// until each route lands. Tolerate 404 for exactly these known-future paths and
// fail on any other broken link so real regressions still break the build.
const KNOWN_FUTURE_ROUTES = [
	'/aktualnosci',
	// '/o-nas' is now a real prerendered route (Plan 02-01), so the crawler enforces it.
	'/rekrutacja',
	'/dokumenty',
	'/kontakt',
	// Footer v2 shortcuts (UI-SPEC v1.2): pages authored in Phases 4-5.
	'/cennik',
	'/galeria',
	'/dojazd'
	// '/deklaracja-dostepnosci' and '/polityka-prywatnosci' are real prerendered
	// stubs, so the crawler enforces those footer links.
];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Cloudflare Pages: build output → .svelte-kit/cloudflare.
		// adapter-cloudflare makes SvelteKit server routes the Pages Functions —
		// do NOT hand-author a /functions dir (none exist in Phase 1).
		adapter: adapter(),
		// CSP lives here, not in _headers: SvelteKit boots hydration from an
		// inline <script> whose sha256 hash changes every build, so only the
		// framework can emit a policy that allows it ('auto' = hash on
		// prerendered pages via <meta>, nonce on dynamic responses).
		// frame-ancestors is intentionally absent — browsers ignore it in
		// <meta> CSP; _headers keeps X-Frame-Options: DENY instead.
		// Phases 2–4 extend these directives (Sveltia /admin, Turnstile, Resend).
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self'],
				'img-src': ['self', 'data:'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'object-src': ['none']
			}
		},
		prerender: {
			handleHttpError: ({ status, path, message }) => {
				const known = KNOWN_FUTURE_ROUTES.some(
					(route) => path === route || path.startsWith(route + '/')
				);
				if (status === 404 && known) return; // link resolves once the route is built
				throw new Error(message);
			}
		}
	}
};

export default config;
