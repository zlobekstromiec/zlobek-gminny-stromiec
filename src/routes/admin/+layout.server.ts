// Data for the panel shell. Server-side rather than client-side on purpose: the
// panel follows the same zero-JS-by-default model as the public site (D-17), so
// the section name that builds the „{Sekcja}, panel redakcyjny" title is resolved
// here instead of read from a client store.
//
// Nothing here logs, and the full e-mail address never reaches this file: the gate
// in src/hooks.server.ts puts only the short handle into locals (D-04).
import type { LayoutServerLoad } from './$types';

/** Polish section names keyed by the first path segment under /admin, in the
 *  UI-SPEC nav order. This is the source of the „{Sekcja}, panel redakcyjny" page
 *  title that the shell builds through `tytulStrony` in src/lib/content/panel.ts.
 *  An unknown segment falls back to the neutral wordmark rather than leaking a raw
 *  path segment into the title. */
const SEKCJE: Record<string, string> = {
	'': 'Pulpit',
	logowanie: 'Logowanie',
	aktualnosci: 'Aktualności',
	'o-nas': 'O nas',
	'plan-dnia': 'Plan dnia',
	dokumenty: 'Dokumenty',
	nabor: 'Nabór',
	pomoc: 'Pomoc'
};

export const load: LayoutServerLoad = ({ locals, url }) => {
	const segment = url.pathname.replace(/^\/admin\/?/, '').split('/')[0] ?? '';
	return {
		// /admin/logowanie is the one child that reaches this load with no session,
		// because the gate exempts it, so locals.editor is genuinely unset there. An
		// empty string rather than a placeholder handle: the shell must render nothing
		// rather than something untrue.
		editor: locals.editor ?? '',
		sekcja: SEKCJE[segment] ?? 'Panel redakcyjny'
	};
};
