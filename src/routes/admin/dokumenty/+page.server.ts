// The dokumenty list (CMS-02; 04.1-UI-SPEC Component Contract 4).
//
// IT DELIBERATELY SHOWS MORE THAN THE PUBLIC PAGE DOES, which is the one place the panel and
// the website are allowed to disagree, and both halves of the disagreement are deliberate:
//
//  • EVERY CATEGORY RENDERS ITS HEADING, including an empty one. The public page omits an
//    empty group (D-13, the dormant RODO drawer); the panel must not, because a drawer with
//    no heading is a drawer an editor cannot see exists, and „where do I put this?" is
//    exactly the question this screen has to answer for somebody who opens it twice a month.
//  • AN ENTRY WHOSE FILE IS MISSING IS STILL LISTED. The public reader skips such an entry
//    with a build warning, which is right for a visitor and wrong here: that entry is
//    precisely the one somebody has to open and fix, and hiding it would leave a document
//    that exists in the repository, is invisible on the site and is unreachable in the panel.
//
// Both follow from reading through src/lib/server/admin/dokumenty.ts rather than through the
// public reader, and that module has a second, harder reason to exist: the public reader
// imports node:fs to compute each file's size at build time, and this route runs inside the
// Cloudflare Worker, which has no filesystem.
//
// Nothing here logs. No secret is read: this route needs none.
import { POLA_DOKUMENT } from '$lib/content/panel';
import { ZNACZNIK_USUNIETO, ZNACZNIK_ZAPISANO } from '$lib/pola-dokumentu';
import { grupujDokumentyPanelu, readDokumentyPanelu } from '$lib/server/admin/dokumenty';
import { slugAscii } from '$lib/server/admin/slug';
import type { PageServerLoad } from './$types';

/** Everything one row needs, and nothing else. */
export interface WierszDokumentu {
	slug: string;
	nazwa: string;
	typ: string;
	wersja: string;
	zastepcza: boolean;
}

/** Read the „just saved" marker, which carries the slug of the document that was written.
 *  It arrives from a URL and is therefore untrusted, so it is accepted only if it is already
 *  exactly what the generator would have produced. The check reuses that generator rather
 *  than restating its character class, so the two can never drift. */
function znacznikSlugu(surowy: string | null): string | undefined {
	if (surowy === null || surowy.length === 0) return undefined;
	return slugAscii(surowy, 200) === surowy ? surowy : undefined;
}

export const load: PageServerLoad = ({ url }) => {
	const wpisy = readDokumentyPanelu();
	return {
		// The headings are passed IN rather than read inside the grouper: they are Polish copy
		// and belong to the copy module, and they are positional against the shared category
		// order, which is the same order the category select offers.
		grupy: grupujDokumentyPanelu(wpisy, POLA_DOKUMENT.kategorieOpcje).map((grupa) => ({
			kategoria: grupa.kategoria,
			naglowek: grupa.naglowek,
			dokumenty: grupa.dokumenty.map((wpis): WierszDokumentu => ({
				slug: wpis.slug,
				nazwa: wpis.nazwa,
				typ: wpis.typ,
				wersja: wpis.wersja,
				zastepcza: wpis.placeholder === true
			}))
		})),
		/** True only when EVERY category is empty. The whole-list empty state is a different
		 *  sentence from the per-category note, and rendering both at once would say the same
		 *  thing four times. */
		pusto: wpisy.length === 0,
		/** Slug of the document a create just wrote, or undefined. POST then redirect then
		 *  GET: the panel is driven by a marker on a fresh GET, never by an action return, so
		 *  a refresh re-runs a read instead of committing a second time (D-11). */
		zapisano: znacznikSlugu(url.searchParams.get(ZNACZNIK_ZAPISANO)),
		/** Set by the confirmation page after a deletion. A separate marker, because
		 *  „Zapisano" and „Usunięto" are different sentences. */
		usunieto: url.searchParams.get(ZNACZNIK_USUNIETO) === '1'
	};
};

// THIS FILE EXPORTS NO ACTION, deliberately and permanently. A list screen that could delete
// would put a destructive control one mis-tap away on every row (Contract 4, threat
// T-04.1-27), and the confirmation page owns that operation. The absence is checked from the
// other side too, by the acceptance assertion that the rendered list contains no posting
// element at all.
