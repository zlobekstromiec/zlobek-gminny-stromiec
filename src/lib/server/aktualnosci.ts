// Shared build-time news reader (NEWS-01; 03-RESEARCH.md Pattern 1/2,
// 03-PATTERNS.md aktualnosci.ts). Server-only: it reads the folder collection at
// build via import.meta.glob and derives each post's slug from the on-disk
// filename (never re-derived from fields — the filename is authoritative, which
// is what makes D-07 "title edits keep the URL" and D-08 "deleted posts 404"
// true for free). Dates parse from the stored "DD.MM.YYYY" string and format via
// a pure genitive Polish month map (NEVER a runtime locale formatter — Cloudflare
// prerender locale data is not guaranteed). Kept free of Svelte/UI concerns so the list
// route (this plan), the [slug] route (Plan 02) and the homepage (Plan 04) all
// consume one source and cannot drift.

export interface PostEntry {
	tytul: string;
	data: string; // stored "DD.MM.YYYY" (matches dokumenty `wersja`)
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

function parseData(ddmmyyyy: string): { iso: string; display: string } | null {
	const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(ddmmyyyy.trim());
	if (!m) return null;
	const [, dd, mm, yyyy] = m;
	const monthIdx = Number(mm) - 1;
	if (monthIdx < 0 || monthIdx > 11) return null;
	return {
		iso: `${yyyy}-${mm}-${dd}`,
		display: `${Number(dd)} ${MIESIACE[monthIdx]} ${yyyy}`
	};
}

/** Text before the first blank line, trimmed — the excerpt fallback. */
function firstParagraph(tresc: string): string {
	return tresc.split('\n\n')[0].trim();
}

/** Read every seed entry, derive slug/date/excerpt meta, and sort newest-first.
 *  A malformed entry (bad slug or unparseable date) is skipped with a build
 *  warning rather than aborting the whole prerender (dokumenty.ts precedent). */
export function readAktualnosci(): PostWithMeta[] {
	const modules = import.meta.glob<PostEntry>('$lib/content/aktualnosci/*.json', {
		eager: true,
		import: 'default'
	});
	const posts: PostWithMeta[] = [];
	for (const [path, entry] of Object.entries(modules)) {
		// Slug = on-disk filename (basename minus .json). NEVER re-derive from
		// data + tytul: the committed filename is authoritative (D-07/D-08).
		const slug = (path.split('/').pop() ?? '').replace(/\.json$/, '');
		const parsed = parseData(entry.data);
		if (!slug || !parsed) {
			console.warn(`aktualnosci: skipping "${path}" (bad slug or data)`);
			continue;
		}
		const excerpt = (entry.zajawka?.trim() || firstParagraph(entry.tresc)).trim();
		posts.push({
			...entry,
			slug,
			href: `/aktualnosci/${slug}`,
			iso: parsed.iso,
			dataDisplay: parsed.display,
			excerpt
		});
	}
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
