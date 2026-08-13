import type { PageServerLoad } from './$types';
import { readAktualnosci } from '$lib/server/aktualnosci';

// NEWS-01: build-time feed read. prerender = true is inherited from +layout.ts —
// no +server.ts, no prerender = false. The load runs once at build.
export const load: PageServerLoad = () => {
	return { posts: readAktualnosci() };
};
