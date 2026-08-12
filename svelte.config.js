import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Section routes linked from the persistent nav/footer that are authored in
// later plans of this phase (Plans 04–05) and Phase 6 (deklaracja). The header
// and footer link to them from now, so the prerender crawler will hit a 404
// until each route lands. Tolerate 404 for exactly these known-future paths and
// fail on any other broken link so real regressions still break the build.
const KNOWN_FUTURE_ROUTES = [
	'/aktualnosci',
	'/o-nas',
	'/rekrutacja',
	'/dokumenty',
	'/kontakt',
	'/deklaracja-dostepnosci'
];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Cloudflare Pages: build output → .svelte-kit/cloudflare.
		// adapter-cloudflare makes SvelteKit server routes the Pages Functions —
		// do NOT hand-author a /functions dir (none exist in Phase 1).
		adapter: adapter(),
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
