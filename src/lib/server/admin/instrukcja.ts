// The printable instrukcja, read once at build time and prepared for the Pomoc screen
// (04.1-10 P-27; UI-SPEC „New Surfaces": /admin/pomoc).
//
// THERE IS ONE INSTRUKCJA AND IT LIVES IN docs/. The Pomoc route renders that document
// rather than restating it, which is the only arrangement in which the screen a staff
// member reads and the page they print cannot drift apart. The alternative, authoring the
// same twelve sections a second time in the copy module, would have produced two
// documents that agree on the day they are written and disagree on every day after.
//
// THE BYTES ARE INLINED BY THE BUNDLER, not read from disk. The panel is the Cloudflare
// Worker and a Worker has no filesystem, which is the same constraint that keeps
// src/lib/server/dokumenty.ts out of every admin route (04.1-08). `?raw` is a build-time
// transform, so what ships is a string constant.
//
// The parse runs ONCE per isolate, at module scope, rather than once per request. The
// document is about eleven kilobytes and the free Workers plan allows roughly ten
// milliseconds of CPU per request, so paying for the parse on every page view would be
// spending the request budget on an answer that cannot change between deployments.
//
// Nothing here logs and no secret is read: this module needs none.
import zrodlo from '../../../../docs/instrukcja-cms.md?raw';
import { renderInstrukcja } from '$lib/markdown';

/** The document's own first-level heading, and the only one it has. It becomes the h1 of
 *  the Pomoc screen, which is why it is removed from the body before rendering: the
 *  renderer starts at h2 precisely so the page has exactly one h1 and the structure below
 *  it never skips a level (UI-SPEC Accessibility Contract). */
function rozdziel(dokument: string): { tytul: string; tresc: string } {
	const linie = dokument.split('\n');
	const indeks = linie.findIndex((linia) => linia.startsWith('# '));
	// A document with no title is not a state this repository can reach (the file is
	// committed and pinned by tests/instrukcja.unit.ts), but answering with an empty title
	// and the whole body is the safe direction to be wrong in: the screen then renders the
	// document rather than nothing at all.
	if (indeks === -1) return { tytul: '', tresc: dokument };
	return {
		tytul: linie[indeks].slice(2).trim(),
		tresc: linie.slice(indeks + 1).join('\n')
	};
}

const rozdzielony = rozdziel(zrodlo);

/** Rendered as the Pomoc screen's h1. */
export const TYTUL_INSTRUKCJI = rozdzielony.tytul;

/** Sanitized block HTML of everything below the title, starting at h2. */
export const HTML_INSTRUKCJI = renderInstrukcja(rozdzielony.tresc);

/** The document verbatim, served by /admin/pomoc/instrukcja so a staff member can keep a
 *  copy on paper or on their own machine. Deliberately the SAME string the screen was
 *  built from, so „the printable version" is the thing that was printed and not a
 *  second export of it. */
export const ZRODLO_INSTRUKCJI = zrodlo;
