// Single-post server load (NEWS-02; 03-RESEARCH.md Pattern 3). Prerendered
// (inherits prerender = true from +layout.ts). entries() feeds the crawler one
// route per real slug so every post becomes static HTML; the slug is the on-disk
// filename (readAktualnosci is the single source shared with the list and the
// homepage). An unknown slug throws error(404) so a deleted/renamed post 404s to
// the friendly +error.svelte page (D-08) rather than rendering an empty article.
import { error } from '@sveltejs/kit';
import { readAktualnosci } from '$lib/server/aktualnosci';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => readAktualnosci().map((p) => ({ slug: p.slug }));

export const load: PageServerLoad = ({ params }) => {
	const post = readAktualnosci().find((p) => p.slug === params.slug);
	if (!post) throw error(404, 'Nie znaleziono wpisu');
	return { post };
};
