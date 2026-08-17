// Data for the panel shell. Server-side rather than client-side on purpose: the
// panel follows the same zero-JS-by-default model as the public site (D-17), so
// the section name that builds the „{Sekcja}, panel redakcyjny" title is resolved
// here instead of read from a client store.
//
// Nothing here logs, and the full e-mail address never reaches this file: the gate
// in src/hooks.server.ts puts only the short handle into locals (D-04).
//
// THE SECTION NAMES ARE NOT DECLARED HERE, and that is not tidiness. They are Polish
// visible strings (they end up in the browser tab), so they belong in the copy module
// and have to be swept there; and SvelteKit restricts which names a `+layout.server.ts`
// may export, so the map could not simply be exported from where it used to sit. Plan
// 05-05 moved it to src/lib/content/panel.ts, which is also what made
// tests/admin-enumeracja.spec.ts able to assert that every panel route has an entry.
import { SEKCJE_PANELU } from '$lib/content/panel';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	const segment = url.pathname.replace(/^\/admin\/?/, '').split('/')[0] ?? '';
	return {
		// /admin/logowanie is the one child that reaches this load with no session,
		// because the gate exempts it, so locals.editor is genuinely unset there. An
		// empty string rather than a placeholder handle: the shell must render nothing
		// rather than something untrue.
		editor: locals.editor ?? '',
		sekcja: SEKCJE_PANELU[segment] ?? 'Panel redakcyjny'
	};
};
