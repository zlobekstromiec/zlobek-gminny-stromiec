// Build-time load for /rekrutacja (RECRUIT-02, RECRUIT-05). The static-output flag
// is inherited from +layout.ts, so this runs once at build and never at runtime: it
// calls the SAME shared server-only resolver as /dokumenty and the homepage docs
// panel, then keeps the recruitment category.
//
// Nothing about file metadata or path safety is re-implemented here. The shared
// module already computes type and size from disk (D-14), requires the canonical
// /dokumenty/ prefix and rejects traversal segments, and reusing it is precisely
// what keeps this page's names, meta and hrefs identical to /dokumenty (RECRUIT-05).
// A second resolver would be a second place for those guards to drift.
//
// Unlike the homepage panel, this page returns the FULL filtered category: the
// homepage shows a curated two-row teaser, whereas a parent who came here to
// download the wniosek must see everything that exists.
import type { PageServerLoad } from './$types';
import { readDokumenty } from '$lib/server/dokumenty';

export const load: PageServerLoad = () => {
	return { wnioski: readDokumenty().filter((entry) => entry.kategoria === 'rekrutacja') };
};
