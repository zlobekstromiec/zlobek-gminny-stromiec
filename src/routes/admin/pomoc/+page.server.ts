// The Pomoc screen: the instrukcja, rendered inside the panel (04.1-10 P-27).
//
// It loads a prepared constant rather than doing any work of its own. The document is
// inlined and parsed once per isolate in src/lib/server/admin/instrukcja.ts, and the
// reasoning for both halves of that lives there.
//
// This route sits UNDER THE ADMIN GATE like every other panel screen (T-04.1-37): the
// hook in src/hooks.server.ts exempts only /admin/logowanie, and tests/admin-auth.spec.ts
// already lists /admin/pomoc among the paths an unauthenticated request must not reach.
//
// Nothing here logs. No secret is read: this route needs none.
import { HTML_INSTRUKCJI, TYTUL_INSTRUKCJI } from '$lib/server/admin/instrukcja';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		tytul: TYTUL_INSTRUKCJI,
		tresc: HTML_INSTRUKCJI
	};
};

// THIS FILE EXPORTS NO ACTION, deliberately and permanently. Pomoc is a document.
