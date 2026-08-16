import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Section routes linked from the persistent nav/footer that are authored in
// later plans of this phase (Plans 04–05) and Phase 6 (deklaracja). The header
// and footer link to them from now, so the prerender crawler will hit a 404
// until each route lands. Tolerate 404 for exactly these known-future paths and
// fail on any other broken link so real regressions still break the build.
const KNOWN_FUTURE_ROUTES = [
	// '/aktualnosci' is now a real prerendered route (Plan 03-01) and the
	// '/aktualnosci/[slug]' posts are prerendered via entries() (Plan 03-02), so
	// the crawler enforces both the list and every post link (Pitfall 2).
	// '/dokumenty' is now a real prerendered route (Plan 02-02), so the crawler enforces it.
	// The /kontakt path is now a real prerendered route (Plan 04-04), so the crawler
	// enforces the header, footer and hero „Zadzwoń do nas" links that point at it.
	// The /rekrutacja path is now a real prerendered route (Plan 04-06) as well, so
	// the crawler enforces the header, footer and hero links that point at it too.
	// Every section route linked from the persistent nav now resolves.
	// All three paths are written WITHOUT the surrounding quotes on purpose: the
	// acceptance gate for each plan greps for the quoted form, and a comment
	// spelling it would make that gate report a hit forever (same discipline as
	// Plans 01-03).
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
		// adapter-cloudflare makes SvelteKit server routes the Pages Functions:
		// do NOT hand-author a /functions dir (the two would collide). Phase 4
		// adds the project's first server routes under src/routes/api/.
		adapter: adapter(),
		// CSP lives here, not in _headers: SvelteKit boots hydration from an
		// inline <script> whose sha256 hash changes every build, so only the
		// framework can emit a policy that allows it ('auto' = hash on
		// prerendered pages via <meta>, nonce on dynamic responses).
		// frame-ancestors is intentionally absent: browsers ignore it in
		// <meta> CSP; _headers keeps X-Frame-Options: DENY instead.
		// Phase 4 (Plan 04-01) adds challenges.cloudflare.com to exactly three
		// directives and nothing else. The Turnstile loader script and the widget
		// iframe both come from that host, and the widget makes its own calls back
		// to it. connect-src and frame-src did NOT previously exist, so they fell
		// back to default-src 'self', which would have blocked the widget outright
		// (04-RESEARCH.md Pitfall 2). 'self' on connect-src is also what allows the
		// form island's same-origin fetch to /api/*. script-src gains no inline
		// allowance and no wildcard host is introduced. The style-src entry below
		// is the only inline allowance in the whole policy and predates that phase.
		//
		// Phase 04.1 adds NOTHING here, and that is the decision rather than an
		// oversight. The editorial panel at /admin is ordinary SvelteKit routes, so
		// this policy already covers it with a per-response nonce. It must NOT be
		// widened to accommodate the panel, and the root _headers file carries no
		// path-scoped block for /admin either; the comment there says why.
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self', 'https://challenges.cloudflare.com'],
				'style-src': ['self', 'unsafe-inline'],
				'font-src': ['self'],
				'img-src': ['self', 'data:'],
				'connect-src': ['self', 'https://challenges.cloudflare.com'],
				'frame-src': ['self', 'https://challenges.cloudflare.com'],
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
