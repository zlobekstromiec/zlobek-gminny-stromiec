import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// THE CRAWLER NOW ENFORCES EVERY INTERNAL LINK, WITH NO EXCEPTION LIST.
//
// This file used to carry, right here, an array of known-future paths and a
// matching branch in the prerender error handler that tolerated a 404 on any of
// them. It existed because the persistent nav and footer linked to section pages
// that later plans would author, so the crawler hit a 404 on each of them until
// that plan landed. Every one of those paths has since either become a real
// prerendered route or been repointed at a section of a page that exists, and
// plan 05-07 removed the last entry together with the array and the branch that
// consumed it. Nothing is tolerated any more: a link that does not resolve fails
// `vite build`, which runs inside Playwright's webServer and inside every
// Cloudflare Pages deploy.
//
// That is deliberately the harder failure. A failed build leaves the previous
// deployment live, which this project prefers over publishing a broken link.
//
// THE GATE HERE IS `npm run build`, NEVER A GREP. Neither the retired constant nor
// any retired path is written out above, following the repository rule recorded at
// 04-02: a comment explaining a removal must not make the grep enforcing that
// removal report a permanent false positive.

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
			// No tolerance branch: every broken internal link fails the build. See the
			// note at the head of this file for what stood here and why it is gone.
			handleHttpError: ({ message }) => {
				throw new Error(message);
			}
		}
	}
};

export default config;
