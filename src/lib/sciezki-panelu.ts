// The panel navigation's WIRING: the URL of every section chip, in the fixed UI-SPEC
// order (04.1-UI-SPEC Component Contract 1; 05-UI-SPEC Contract 12).
//
// WHY THIS IS A MODULE AND NOT AN ARRAY INSIDE THE COMPONENT. The list is
// INDEX-ALIGNED with NAWIGACJA in src/lib/content/panel.ts, and the shell pairs the two
// by position. A list one entry shorter therefore yields a chip whose href is
// `undefined`, which the browser resolves against the current URL and which looks, to
// anybody clicking it, like a screen that refuses to open. While the array lived inside
// a component nothing could import it, so nothing could ever assert the alignment.
// Here it is importable, and tests/admin-enumeracja.spec.ts asserts equal lengths, no
// empty entry, and a real 200 from every one of them.
//
// THIS MODULE CARRIES NO VISIBLE STRING, and that split is deliberate. A label is copy:
// it lives in src/lib/content/panel.ts and is swept there for the language contract. A
// path is wiring: it is never read out to an editor, and it is exactly what a copy
// sweep has no opinion about. src/lib/pola-strony.ts states the same boundary about
// control names.
//
// Pure: no I/O, no clock, no framework import. Safe on both sides of the client and
// server boundary, which is what lets both the shell component and a test load it.

/** Section URLs of the panel navigation, index-aligned with `NAWIGACJA`.
 *
 *  Frozen, so a screen that wanted „just one more entry at runtime" has to add it here,
 *  beside the label it belongs to, rather than somewhere a reader would never look. */
export const SCIEZKI_PANELU: readonly string[] = Object.freeze([
	'/admin',
	'/admin/aktualnosci',
	'/admin/o-nas',
	'/admin/galeria',
	'/admin/plan-dnia',
	'/admin/cennik',
	'/admin/dokumenty',
	'/admin/nabor',
	'/admin/pomoc'
]);

/** The landing screen, which every editor screen links back to and which the chip logic
 *  matches EXACTLY rather than by prefix: every other panel path starts with these six
 *  characters, so a prefix match would light the first chip up on every screen. */
export const SCIEZKA_STARTOWA = '/admin';
