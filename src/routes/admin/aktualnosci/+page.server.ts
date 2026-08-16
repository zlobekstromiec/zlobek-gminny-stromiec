// The aktualności list (CMS-02; 04.1-UI-SPEC Component Contract 4).
//
// IT READS THROUGH `readAktualnosci`, THE PUBLIC READER, and not through a listing of
// its own. That is the whole point: the panel and the public site then cannot disagree
// about what a valid post is, about which posts exist, or about what order they appear
// in. An entry the reader skips as malformed is an entry the panel does not show either,
// which is honest, because showing it would promise an edit screen for something the
// website is not publishing.
//
// CONSEQUENCE WORTH STATING PLAINLY: that reader globs the content folder at BUILD time,
// so this list is the state of the last Cloudflare build and not the state of the
// repository this second. A post saved a minute ago is not here yet. That is the same
// two-minute delay every panel surface already promises out loud (D-18), and it is why a
// create redirects here with a „Zapisano" panel carrying a link to the new page rather
// than pretending the entry is already listed.
//
// Nothing here logs. No secret is read: this route needs none.
import { readAktualnosci } from '$lib/server/aktualnosci';
import { slugAscii } from '$lib/server/admin/slug';
import { ZNACZNIK_USUNIETO, ZNACZNIK_ZAPISANO } from '$lib/pola-wpisu';
import type { PageServerLoad } from './$types';

/** Everything one row needs, and nothing else. The full `PostWithMeta` carries the body
 *  of every post, and shipping all of them into the rendered page would put the whole
 *  collection in the HTML of a list that shows titles. */
export interface WierszWpisu {
	slug: string;
	tytul: string;
	data: string;
	zastepcza: boolean;
}

/** Read the „just saved" marker, which carries the slug of the entry that was written.
 *  It arrives from a URL and is therefore untrusted, so it is accepted only if it is
 *  already exactly what the generator would have produced. A crafted value cannot do
 *  much here, since the link is always built under /aktualnosci/, but a marker that
 *  cannot be forged is one fewer thing to reason about. The check reuses the generator
 *  rather than restating its character class, so the two can never drift. */
function znacznikSlugu(surowy: string | null): string | undefined {
	if (surowy === null || surowy.length === 0) return undefined;
	return slugAscii(surowy, 200) === surowy ? surowy : undefined;
}

export const load: PageServerLoad = ({ url }) => {
	return {
		// Newest first, exactly as /aktualnosci orders it, because the reader sorts and
		// this route does not re-sort. An editor comparing the two screens sees one order.
		wpisy: readAktualnosci().map((post): WierszWpisu => ({
			slug: post.slug,
			tytul: post.tytul,
			data: post.dataDisplay,
			zastepcza: post.placeholder === true
		})),
		/** Slug of the entry a create just wrote, or undefined. POST then redirect then
		 *  GET: the panel is driven by a marker on a fresh GET, never by an action return,
		 *  so a refresh re-runs a read instead of committing a second time (D-11). */
		zapisano: znacznikSlugu(url.searchParams.get(ZNACZNIK_ZAPISANO)),
		/** Set by the confirmation page after a deletion. A separate marker from the one
		 *  above, because „Zapisano" and „Usunięto" are different sentences. */
		usunieto: url.searchParams.get(ZNACZNIK_USUNIETO) === '1'
	};
};

// THIS FILE EXPORTS NO ACTION, deliberately and permanently. A list screen that could
// delete would put a destructive control one mis-tap away on every row (Contract 4,
// threat T-04.1-27), and the confirmation page owns that operation. The absence is
// checked from the other side too, by the acceptance assertion that the rendered list
// contains no posting element at all.
