// Build-time load for the homepage (DOCS-01, D-18). prerender = true is inherited
// from +layout.ts, so this runs once at build (never at runtime): it re-sources
// the Recruitment docs panel from the SAME shared resolver as /dokumenty so the
// two pages can never drift (single source, D-18). It returns a curated subset,
// the real recruitment documents (kategoria === 'rekrutacja'), each carrying the
// Polish name, the computed type/size/wersja meta (D-14), and the real hosted file
// path. The full set stays on /dokumenty, reached via the panel's see-all link.
import type { PageServerLoad } from './$types';
import { readDokumenty } from '$lib/server/dokumenty';
import { readLatest } from '$lib/server/aktualnosci';

export const load: PageServerLoad = () => {
	const docs = readDokumenty()
		.filter((entry) => entry.kategoria === 'rekrutacja')
		// Curated homepage subset (D-18): the centrepiece panel shows at most two
		// rows, no matter how many rekrutacja documents an editor adds; the full
		// set always lives on /dokumenty behind the see-all link.
		//
		// WHICH TWO IS DECIDED BY THE ENTRY FILENAMES, and that is worth saying out loud
		// because it is invisible from here. `readDokumenty` preserves the order of
		// `import.meta.glob`, which is the alphabetical order of the files under
		// src/lib/content/dokumenty, so this slice takes the two alphabetically first
		// rekrutacja entries. Quick 260921-j9c added a third one and learned this the hard
		// way: filed as `druk-rezygnacji.json` it sorted ahead of both `rekrutacja-*`
		// entries and pushed the wniosek, the single document a parent comes here for, off
		// the homepage. It is filed as `rezygnacja-z-miejsca.json` for that reason alone.
		.slice(0, 2)
		.map((entry) => ({ name: entry.nazwa, meta: entry.meta, href: entry.plik }));
	// Curated homepage news feed (NEWS-01): the three newest posts for the
	// NewsPreview 3-column grid, re-sourced from the SAME shared aktualnosci reader
	// as /aktualnosci so the homepage and the list can never drift (single source,
	// mirrors the docs re-source above). The full set lives on /aktualnosci.
	const posts = readLatest(3);
	return { docs, posts };
};
