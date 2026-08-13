/**
 * Pre-boot setup for the self-hosted Sveltia admin. MUST run before
 * sveltia-cms.js evaluates (script order in index.html is load-bearing).
 *
 * 1. Seeds default preferences (light theme, Polish UI) into
 *    localStorage["sveltia-cms.prefs"] without overriding an explicit choice
 *    the user made later in Ustawienia.
 * 2. Mirrors the effective theme onto <html data-theme> before the CMS boots
 *    so OS-dark machines do not flash a dark frame.
 * 3. Seeds the Polish UI locale cache (localStorage["sveltia-cms.locale"])
 *    from locale-pl.js. The bundle checks this cache before fetching the
 *    locale from unpkg.com, which the /admin/* CSP blocks by design.
 */
(function () {
	'use strict';

	const PREFS_KEY = 'sveltia-cms.prefs';
	const LOCALE_KEY = 'sveltia-cms.locale';

	let prefs;
	try {
		prefs = JSON.parse(window.localStorage.getItem(PREFS_KEY));
	} catch {
		/* corrupted or unavailable storage; fall through to defaults */
	}
	if (!prefs || typeof prefs !== 'object') {
		prefs = {};
	}

	let changed = false;
	if (!('theme' in prefs)) {
		prefs.theme = 'light';
		changed = true;
	}
	if (!prefs.locale) {
		prefs.locale = 'pl';
		changed = true;
	}
	if (changed) {
		try {
			window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
		} catch {
			/* storage unavailable (private mode); the CMS falls back to defaults */
		}
	}

	const explicit = Boolean(prefs.theme) && prefs.theme !== 'auto';
	const theme = explicit
		? prefs.theme
		: window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	document.documentElement.dataset.theme = theme;
	if (explicit) {
		document.documentElement.dataset.autoTheming = 'false';
	}

	const pl = window.__SVELTIA_LOCALE_PL__;
	if (pl && pl.version && pl.strings) {
		const cache = Object.assign({ _locale: 'pl', _version: pl.version }, pl.strings);
		try {
			window.localStorage.setItem(LOCALE_KEY, JSON.stringify(cache));
		} catch {
			/* storage unavailable; the CMS will show English chrome */
		}
	}
})();
