// The dokumenty reader the PANEL uses (Phase 04.1, Plan 04.1-08; CMS-02).
//
// WHY IT IS NOT `readDokumenty` FROM src/lib/server/dokumenty.ts, which is the module every
// public consumer uses and which Plan 04.1-06 made the rule for the aktualności list. Two
// reasons, and the first one is not negotiable:
//
//  1. THAT MODULE IMPORTS node:fs. It stats every document on disk to compute its size
//     (D-14), which is correct for a page that is PRERENDERED at build time in Node. The
//     panel is not prerendered: its routes run inside the Cloudflare Worker, this deployment
//     enables only the async-local-storage compatibility flag, and a Worker has no
//     filesystem. Importing that reader here would put node:fs in the Worker bundle.
//  2. THE PANEL MUST SHOW MORE THAN THE SITE DOES. `withMeta` SKIPS an entry whose file is
//     missing and `groupDokumenty` OMITS a category with nothing in it. Both are right for a
//     visitor and wrong for an editor: an entry the site refuses to publish is exactly the
//     one somebody has to open and fix, and a category that renders no heading is a drawer an
//     editor cannot see exists (UI-SPEC Component Contract 4).
//
// So this reader returns EVERYTHING the entry glob holds and hides nothing. What it cannot
// do is report a file's SIZE, which is why the panel's row meta is the type and the version
// date and not the three-part public one: a size shown here could only be a stored number,
// and a stored size is exactly what D-14 forbids because it cannot be corrected when a file
// is replaced.
//
// THE SLUG IS DERIVED FROM THE ON-DISK FILENAME, never from the fields, exactly as the
// aktualności reader derives its own. That is what makes „editing a document's name keeps
// its download URL" true for free, and it is also the path-traversal defence: a fabricated
// slug in a route parameter matches no entry and the screen says it found nothing.
//
// Nothing here logs. Pure apart from the build-time glob, which is a compile-time
// substitution rather than a filesystem read at runtime.
import { KATEGORIE, jestKategoria, type Kategoria } from '../../kategorie-dokumentow.ts';
import type { DokumentEntry } from '../dokumenty.ts';
import { sciezkaZPubliczej } from './plik.ts';

/** One row of the panel's list, plus everything its editor screen needs. */
export interface DokumentPanelu extends DokumentEntry {
	/** The on-disk filename stem: this document's identity in every panel URL. */
	slug: string;
	/** Upper-case extension of the stored path, computed exactly as the public reader
	 *  computes it, so the label an editor sees is the label a visitor sees. */
	typ: string;
	/** Repository path of the file, or null when the stored value is not one this panel
	 *  could have produced. Null is what a deletion checks before asking git to remove
	 *  anything. */
	sciezkaPliku: string | null;
}

/** One category group, INCLUDING an empty one. */
export interface GrupaPanelu {
	kategoria: Kategoria;
	naglowek: string;
	dokumenty: DokumentPanelu[];
}

/**
 * Every document entry in the build the panel is running on.
 *
 * THE ANSWER IS THE LAST BUILD, NEVER THE REPOSITORY, which is the two-minute window every
 * reading screen in this panel lives with and says out loud (D-18). A document saved a
 * minute ago is not here yet, which is why a create redirects to the list with an honest
 * „Zapisano" panel rather than to a screen that would have to read it back.
 */
export function readDokumentyPanelu(): DokumentPanelu[] {
	const moduly = import.meta.glob<DokumentEntry>('$lib/content/dokumenty/*.json', {
		eager: true,
		import: 'default'
	});
	return Object.entries(moduly)
		.map(([sciezka, wpis]): DokumentPanelu => {
			const nazwaPliku = sciezka.split('/').pop() ?? '';
			return {
				...wpis,
				slug: nazwaPliku.replace(/\.json$/u, ''),
				typ: (wpis.plik.split('.').pop() ?? '').toUpperCase(),
				sciezkaPliku: sciezkaZPubliczej(wpis.plik)
			};
		})
		.sort((a, b) => a.nazwa.localeCompare(b.nazwa, 'pl'));
}

/**
 * Group by category in the fixed order, keeping EVERY category (Component Contract 4).
 *
 * The headings arrive as an argument rather than being read here, because they are Polish
 * copy and this module is server plumbing: they live in src/lib/content/panel.ts where the
 * Polish-only sweep governs them. They are positional against the shared category order,
 * which is asserted rather than assumed by the caller's own suite.
 *
 * An entry whose stored category is not one of the three is not grouped, exactly as the
 * public grouper does not group it. That state is unreachable through the panel, because the
 * validator reads the category from the same union, and it is reachable only by a hand edit.
 */
export function grupujDokumentyPanelu(
	wpisy: readonly DokumentPanelu[],
	naglowki: readonly string[]
): GrupaPanelu[] {
	return KATEGORIE.map((kategoria, i) => ({
		kategoria,
		naglowek: naglowki[i] ?? kategoria,
		dokumenty: wpisy.filter((wpis) => jestKategoria(wpis.kategoria) && wpis.kategoria === kategoria)
	}));
}
