// Build-time load for /dokumenty (DOCS-01). prerender = true is inherited from
// +layout.ts, so this runs once at build (never at runtime): it calls the shared
// server-only resolver to read the seed collection, compute each file's type/size
// meta from disk (D-14), and group entries in the fixed category order with empty
// groups omitted (D-13). The returned data is a plain serializable object.
import type { PageServerLoad } from './$types';
import { groupDokumenty, readDokumenty } from '$lib/server/dokumenty';

export const load: PageServerLoad = () => {
	return { grupy: groupDokumenty(readDokumenty()) };
};
