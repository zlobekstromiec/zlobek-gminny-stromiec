// Resolving a stored picture value to the file the build actually carries (Phase 05, Plan
// 05-06).
//
// WHY IT IS IN $lib AND NOT $lib/server. The sixth occurrence of the boundary
// src/lib/zdjecia.ts, src/lib/stan-naboru.ts and src/lib/pola-strony.ts each record:
// SvelteKit refuses at build time to bundle anything under src/lib/server/ into client code,
// and the public /o-nas page, the panel's photo island and the server's upload helpers all
// need the SAME resolution rule. Three implementations of one rule are three chances for the
// page to look a picture up under a key the panel never wrote.
//
// WHAT IT REPLACES. The `split('/').pop()` idiom was duplicated verbatim in three files, and
// this phase would otherwise have made it four. It is one line, which is exactly why nobody
// noticed that the three copies had already stopped meaning the same thing to a reader: two
// of them fall back to the original value and one of them does not.
//
// THE GLOB DELIBERATELY STAYS AT EACH CALL SITE, and no call to it appears in this file.
// Vite analyses that build-time helper STATICALLY and its arguments must be literals where it
// is written, so it cannot be moved behind a function here; its name is described rather than
// written, following the repository rule (04-02) that a comment explaining a constraint must
// not make the grep enforcing it report a permanent false positive. Each consumer keeps its
// own inline call and passes the RESULT to the mapper below. That also lets the two sides
// glob DIFFERENTLY on purpose:
// src/lib/server/admin/uploads.ts globs WITHOUT the enhanced query, because the server only
// ever reads the KEYS and must not pull processed image assets into the Worker bundle, while
// the two rendering consumers glob WITH it because they need the pictures themselves.
//
// This module carries NO visible string: nothing here is ever rendered. Pure: no I/O, no
// clock, no framework import. Safe on both sides of the boundary.

/** The final path segment of a stored value, or the value itself when it carries no
 *  separator.
 *
 *  The panel stores a BARE BASENAME (04.1 P-20) and this function is what keeps every reader
 *  working unchanged if a hand-edited file ever stores a full path instead. The lookup being
 *  BY NAME is also the path-traversal defence recorded at the head of
 *  src/lib/server/admin/uploads.ts: an unknown name is simply absent from the map, which
 *  yields a fallback rather than a read of an arbitrary path. */
export function bazowaNazwa(wartosc: string): string {
	return wartosc.split('/').pop() ?? wartosc;
}

/** An already-obtained glob record, re-keyed by basename.
 *
 *  Takes the RESULT of the build-time glob, never the pattern: see the module header for why
 *  the glob itself cannot move in here. Generic in the value, so the same mapper serves the
 *  processed `Picture` objects the two rendering consumers want and the plain asset URLs the
 *  server's name-only glob produces. */
export function wedlugBazowejNazwy<T>(pliki: Record<string, T>): Record<string, T> {
	const wedlugNazwy: Record<string, T> = {};
	for (const [sciezka, modul] of Object.entries(pliki)) {
		const nazwa = sciezka.split('/').pop();
		if (nazwa) wedlugNazwy[nazwa] = modul;
	}
	return wedlugNazwy;
}
