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

export interface PostEntry {
	tytul: string;
	data: string; // stored ISO "YYYY-MM-DD" (CMS saves ISO so the slug substitutes it verbatim; CR-01)
	zajawka?: string;
	tresc: string; // markdown-subset string
	obraz?: string; // optional cover (basename or path under uploads)
	obraz_alt?: string;
	placeholder?: boolean;
}

export interface PostWithMeta extends PostEntry {
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

/** Text before the first blank line, trimmed — the excerpt fallback. Only ever
 *  called after a `typeof entry.tresc === 'string'` guard in postFromEntry. */
function firstParagraph(tresc: string): string {
	return tresc.split('\n\n')[0].trim();
}

/** Map one on-disk entry to a PostWithMeta, or skip it with a build warning
 *  (never throw) when its slug, tytul, data, or excerpt source is malformed —
 *  the `dokumenty.ts` `withMeta` precedent applied to hand-edited news JSON so a
 *  single bad post can never abort the whole-site prerender (WR-02). */
export function postFromEntry(path: string, entry: PostEntry): PostWithMeta | null {
	// Slug = on-disk filename (basename minus .json). NEVER re-derive from
	// data + tytul: the committed filename is authoritative (D-07/D-08).
	const slug = (path.split('/').pop() ?? '').replace(/\.json$/, '');
	if (!slug) {
		console.warn(`aktualnosci: skipping "${path}" (bad slug)`);
		return null;
	}
	if (typeof entry.tytul !== 'string' || entry.tytul.trim() === '') {
		console.warn(`aktualnosci: skipping "${path}" (missing tytul)`);
		return null;
	}
	const parsed = parseData(entry.data);
	if (!parsed) {
		console.warn(`aktualnosci: skipping "${path}" (missing or invalid data)`);
		return null;
	}
	const zajawka = typeof entry.zajawka === 'string' ? entry.zajawka.trim() : '';
	let excerpt: string;
	if (zajawka) {
		excerpt = zajawka;
	} else if (typeof entry.tresc === 'string') {
		excerpt = firstParagraph(entry.tresc);
	} else {
		console.warn(`aktualnosci: skipping "${path}" (missing tresc and zajawka)`);
		return null;
	}
	return {
		...entry,
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
