// The printable instrukcja, served verbatim so a staff member can keep their own copy
// (04.1-10 P-27, and the „visible link to the printable document" of Component
// Contract 3's Pomoc card).
//
// It serves the SAME STRING the Pomoc screen was rendered from, so the copy somebody
// prints and the screen somebody reads cannot say different things. That is the whole
// point of P-27 and it is why this handler does no formatting of its own.
//
// IT SITS UNDER THE ADMIN GATE like every other panel path. The hook in
// src/hooks.server.ts runs before routing, so an endpoint is covered by exactly the same
// check as a page and could not opt out of it even by accident.
//
// Nothing here logs. No secret is read: this route needs none.
import { ZRODLO_INSTRUKCJI } from '$lib/server/admin/instrukcja';
import type { RequestHandler } from './$types';

/** Plain ASCII, because a filename with Polish diacritics has to be encoded twice over in
 *  this header and the encodings disagree across browsers. The document names itself in
 *  Polish on its first line, which is where a person actually reads a title. */
const NAZWA_PLIKU = 'instrukcja-panelu-redakcyjnego.md';

export const GET: RequestHandler = () => {
	return new Response(ZRODLO_INSTRUKCJI, {
		headers: {
			// text/markdown so the bytes are what they are, charset stated explicitly
			// because the document is full of Polish diacritics.
			'content-type': 'text/markdown; charset=utf-8',
			'content-disposition': `attachment; filename="${NAZWA_PLIKU}"`,
			// The instrukcja changes only when the site is rebuilt, and a stale copy of a
			// manual is worse than a fresh request. No store, like every panel response.
			'cache-control': 'no-store'
		}
	});
};
