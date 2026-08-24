// Shared build-time news reader (NEWS-01; 03-RESEARCH.md Pattern 1/2,
// 03-PATTERNS.md aktualnosci.ts). Server-only: it reads the folder collection at
// build via import.meta.glob and derives each post's slug from the on-disk
// filename (never re-derived from fields — the filename is authoritative, which
// is what makes D-07 "title edits keep the URL" and D-08 "deleted posts 404"
// true for free). Dates parse from the stored ISO "YYYY-MM-DD" string and format via
// a pure genitive Polish month map (NEVER a runtime locale formatter — Cloudflare
// prerender locale data is not guaranteed). Kept free of Svelte/UI concerns so the list
// route (this plan), the [slug] route (Plan 02) and the homepage (Plan 04) all
// consume one source and cannot drift.

/** One photograph of a post's own gallery, in the key order the stored JSON uses.
 *
 *  DELIBERATELY THE SAME SHAPE as `ZdjecieGalerii` in $lib/galeria.ts, field for field and
 *  name for name, because both end up in the same `Lightbox` and a second vocabulary for
 *  one concept is how the two drift. All three fields are REQUIRED for the reason the
 *  facility gallery states about itself: the dialog is named by its caption through
 *  aria-labelledby, so an entry missing one would open an unlabelled dialog onto an
 *  unlabelled image, which is a WCAG failure on a public body's website. */
export interface ZdjecieWpisu {
	/** Bare basename inside src/lib/assets/uploads (04.1 P-20). */
	plik: string;
	/** The short visible caption under the tile, and the dialog's accessible name. */
	podpis: string;
	/** What is in the picture, for a screen reader. Never the same string as the caption. */
	alt: string;
}

export interface PostEntry {
	tytul: string;
	data: string; // stored ISO "YYYY-MM-DD" (CMS saves ISO so the slug substitutes it verbatim; CR-01)
	zajawka?: string;
	tresc: string; // markdown-subset string
	obraz?: string; // optional cover (basename or path under uploads)
	obraz_alt?: string;
	zdjecia?: ZdjecieWpisu[]; // optional post gallery, authored in a pull request (D-5 of 260824-qqa)
	placeholder?: boolean;
}

export interface PostWithMeta extends PostEntry {
	zdjecia: ZdjecieWpisu[]; // always an array here (possibly empty), so consumers need no guard
	slug: string; // = on-disk filename minus .json (D-07: fixed at creation)
	href: string; // /aktualnosci/{slug}
	iso: string; // "YYYY-MM-DD" for <time datetime> + sort key
	dataDisplay: string; // "1 sierpnia 2026" (Polish genitive, build-time)
	excerpt: string; // zajawka || first paragraph of tresc
}

// Polish GENITIVE case (UI-SPEC example "1 sierpnia 2026"), build-time pure — no
// runtime locale formatter (Cloudflare prerender/runtime locale data is not guaranteed).
const MIESIACE = [
	'stycznia',
	'lutego',
	'marca',
	'kwietnia',
	'maja',
	'czerwca',
	'lipca',
	'sierpnia',
	'września',
	'października',
	'listopada',
	'grudnia'
];

// Parse the stored ISO "YYYY-MM-DD" string into a sort key + Polish display.
// Accepts `unknown` and type-guards first: the reader consumes hand-edited /
// partially-committed git content, so `value` may be undefined, a number, or an
// object at build time — none of which may throw (WR-02). Out-of-range months
// AND days are rejected (the `\d{2}` regex alone admits 13 / 45, which would
// emit an invalid `<time datetime>` and corrupt the sort key — T-03-06-02).
export function parseData(value: unknown): { iso: string; display: string } | null {
	if (typeof value !== 'string') return null;
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
	if (!m) return null;
	const [, yyyy, mm, dd] = m;
	const monthIdx = Number(mm) - 1;
	if (monthIdx < 0 || monthIdx > 11) return null;
	const day = Number(dd);
	if (day < 1 || day > 31) return null;
	return {
		iso: `${yyyy}-${mm}-${dd}`,
		display: `${day} ${MIESIACE[monthIdx]} ${yyyy}`
	};
}

/** Text before the first blank line, trimmed — the excerpt fallback. Unreachable
 *  with a non-string: postFromEntry only calls it with an already-guarded
 *  `tresc` local, never with a raw field off the on-disk entry. */
function firstParagraph(tresc: string): string {
	return tresc.split('\n\n')[0].trim();
}

/** Return `value` when it is a string with non-whitespace content, otherwise
 *  undefined. Returns the ORIGINAL string, never the trimmed one, so Markdown
 *  body whitespace is preserved. This is the single narrowing primitive of the
 *  reader: every field postFromEntry emits passes through it (or through
 *  parseData), which is what stops an unvalidated value reaching a consumer. */
function readString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/** Upper bound on one post's gallery. The array is authored by hand in a pull request
 *  rather than by a bounded form, so nothing else stops a paste from putting a hundred
 *  full-width photographs on one prerendered page. Twelve is the cap the facility gallery
 *  already carries, reused rather than re-argued. */
export const MAKS_ZDJEC_WPISU = 12;

/**
 * One post's gallery: every entry that is whole, capped, never throwing.
 *
 * SKIPS the bad entry and keeps the good ones, which is the same trade the facility
 * gallery makes: dropping one photograph costs a tile, whereas rejecting the whole array
 * would silently strip a gallery a person can see is there, and rendering an entry with a
 * missing alt would ship an unlabelled image. Anything that is not an array at all (a
 * string, an object, a hand-edited null) yields an empty gallery rather than a throw, for
 * the reason the whole module exists: this content is hand edited and partially committed,
 * and one bad value must not abort the site-wide prerender (WR-02).
 */
export function readZdjecia(value: unknown): ZdjecieWpisu[] {
	if (!Array.isArray(value)) return [];
	const zdjecia: ZdjecieWpisu[] = [];
	for (const wpis of value) {
		if (zdjecia.length >= MAKS_ZDJEC_WPISU) break;
		// A member holding null, an array, a bare string or a number would throw on the
		// first property access, before any field guard could run.
		if (typeof wpis !== 'object' || wpis === null || Array.isArray(wpis)) continue;
		const rekord = wpis as Record<string, unknown>;
		const plik = readString(rekord.plik);
		const podpis = readString(rekord.podpis);
		const alt = readString(rekord.alt);
		if (plik === undefined || podpis === undefined || alt === undefined) continue;
		// Constructed key by key from guarded locals, never spread from `wpis`.
		zdjecia.push({ plik, podpis, alt });
	}
	return zdjecia;
}

/** Map one on-disk entry to a PostWithMeta, or skip it with a build warning
 *  (never throw) when it is malformed — the `dokumenty.ts` `withMeta` precedent
 *  applied to hand-edited news JSON so a single bad post can never abort the
 *  whole-site prerender (WR-02).
 *
 *  `entry` is typed `unknown` on purpose. The PostEntry compile-time shape is a
 *  lie for git-CMS content that staff hand-edit and partially commit, and three
 *  successive crash shapes reached production behind that lie. Typing the
 *  parameter `unknown` makes the compiler enforce a guard on every field, and the
 *  result is CONSTRUCTED key by key (never spread from the raw entry) so nothing
 *  unvalidated can leak through.
 *
 *  This reader is therefore the single validation boundary of the news pipeline:
 *  consumers may rely on `tresc` being a non-empty string (so `renderPost` can
 *  never receive undefined during the entries()-driven prerender) and on `obraz`
 *  / `obraz_alt` being `string | undefined` (so the cover basename split never
 *  runs on a non-string, and a bad cover degrades into the D-01 tint fallback).
 *  Neither NewsCard.svelte nor the [slug] route needs its own guard. */
export function postFromEntry(path: string, entry: unknown): PostWithMeta | null {
	// Slug = on-disk filename (basename minus .json). NEVER re-derive from
	// data + tytul: the committed filename is authoritative (D-07/D-08).
	const slug = (path.split('/').pop() ?? '').replace(/\.json$/, '');
	if (!slug) {
		console.warn(`aktualnosci: skipping "${path}" (bad slug)`);
		return null;
	}
	// A post JSON holding null, an array, a bare string or a number would throw on
	// the first property access, before any field guard could run (T-03-07-04).
	if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
		console.warn(`aktualnosci: skipping "${path}" (entry is not a JSON object)`);
		return null;
	}
	const record = entry as Record<string, unknown>;
	const tytul = readString(record.tytul);
	if (!tytul) {
		console.warn(`aktualnosci: skipping "${path}" (missing tytul)`);
		return null;
	}
	const parsed = parseData(record.data);
	if (!parsed) {
		console.warn(`aktualnosci: skipping "${path}" (missing or invalid data)`);
		return null;
	}
	// UNCONDITIONAL, and before any excerpt logic. The previous version validated
	// tresc only in the excerpt fallback branch, so a present zajawka skipped the
	// guard entirely and marked.parse(undefined) aborted the whole build
	// (T-03-07-01). A post with no body is not a post.
	const tresc = readString(record.tresc);
	if (!tresc) {
		console.warn(`aktualnosci: skipping "${path}" (missing or non-string tresc)`);
		return null;
	}
	// Optional fields degrade to undefined instead of rejecting the post: a wrong
	// cover costs the image, not the article (D-01 tint fallback, T-03-07-02).
	const zajawka = readString(record.zajawka);
	const obraz = readString(record.obraz);
	const obraz_alt = readString(record.obraz_alt);
	// Always an ARRAY out, never undefined, so the page needs no `?? []` and cannot forget
	// one. An absent, malformed or wholly-rejected gallery is the empty array, and the page
	// renders no gallery section at all for it.
	const zdjecia = readZdjecia(record.zdjecia);
	const excerpt = zajawka ? zajawka.trim() : firstParagraph(tresc);
	// Constructed key by key from guarded locals only — never `...entry`, which is
	// how unvalidated fields survived two prior fixes (T-03-07-03).
	return {
		tytul,
		data: parsed.iso,
		zajawka,
		tresc,
		obraz,
		obraz_alt,
		zdjecia,
		placeholder: record.placeholder === true,
		slug,
		href: `/aktualnosci/${slug}`,
		iso: parsed.iso,
		dataDisplay: parsed.display,
		excerpt
	};
}

/** Read every seed entry, derive slug/date/excerpt meta, and sort newest-first.
 *  A malformed entry (bad slug or unparseable date) is skipped with a build
 *  warning rather than aborting the whole prerender (dokumenty.ts precedent). */
export function readAktualnosci(): PostWithMeta[] {
	const modules = import.meta.glob<PostEntry>('$lib/content/aktualnosci/*.json', {
		eager: true,
		import: 'default'
	});
	const posts = Object.entries(modules)
		.map(([path, entry]) => postFromEntry(path, entry))
		.filter((post): post is PostWithMeta => post !== null);
	// NEWS-01: newest first. Tie-break on slug so order is deterministic across
	// builds. D-03: every entry renders; the date is sort/display metadata only
	// (no future-date filter — a static git site never rebuilds when a date
	// arrives, which would silently strand a scheduled post).
	return posts.sort((a, b) =>
		b.iso === a.iso ? b.slug.localeCompare(a.slug) : b.iso.localeCompare(a.iso)
	);
}

/** The n newest posts for the homepage curated subset (used by Plan 04). */
export function readLatest(n = 3): PostWithMeta[] {
	return readAktualnosci().slice(0, n);
}
