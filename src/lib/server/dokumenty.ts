// Shared build-time document resolver (DOCS-01; 02-RESEARCH.md Code Examples,
// 02-PATTERNS.md dokumenty route). Server-only: it reads the seed folder
// collection at build via import.meta.glob and computes each file's type + size
// from disk with node:fs statSync (D-14 — never stored or typed by staff, so the
// meta can never drift when a file is replaced). Kept free of Svelte/UI concerns
// so it can be reused by both /dokumenty and the homepage docs panel (Plan 03).
import { statSync } from 'node:fs';
import { join } from 'node:path';
// The `.ts` extension is the convention every module in this project that a unit suite
// loads directly already follows: `node --test` strips types natively and its resolver
// requires the real filename.
import { KATEGORIE, type Kategoria } from '../kategorie-dokumentow.ts';

// MOVED to src/lib/kategorie-dokumentow.ts by 04.1-08 and re-exported here, so nothing
// that already imported the type from this module had to change and exactly one
// declaration exists. The reason it had to move: this file imports node:fs, the editorial
// panel runs inside the Cloudflare Worker rather than at build time, and a Worker has no
// filesystem. The panel needs the union and the order; it must not need node:fs.
export type { Kategoria };

export interface DokumentEntry {
	nazwa: string;
	kategoria: Kategoria;
	plik: string;
	wersja: string;
	zrodlo_bip?: string;
	placeholder?: boolean;
}

export interface DokumentWithMeta extends DokumentEntry {
	typ: string;
	rozmiar: string;
	meta: string;
}

export interface DokumentGroup {
	kategoria: Kategoria;
	naglowek: string;
	dokumenty: DokumentWithMeta[];
}

// Fixed order + Polish headings. The RODO group stays dormant (D-13): it only
// appears once it holds at least one document (Phase 4). The order itself is the shared
// one, so the public grouping and the panel's list and category select cannot disagree.
const KOLEJNOSC: readonly Kategoria[] = KATEGORIE;
/** Exported by 04.1-08 so tests/admin-walidacja-dokumenty.unit.ts can assert that this
 *  table's keys are exactly the shared union, in the shared order. A heading map that
 *  drifted from the union would render a group with no name on the public page. */
export const NAGLOWEK: Record<Kategoria, string> = {
	rekrutacja: 'Rekrutacja',
	statut: 'Statut i uchwały',
	rodo: 'RODO'
};

function formatRozmiar(bytes: number): string {
	const kb = bytes / 1024;
	if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
	return `${Math.max(1, Math.round(kb))} KB`;
}

/** The metadata resolver, exported by 04.1-08 so the panel's validator suite can feed a
 *  freshly validated entry through the REAL reader rather than through a description of it
 *  (SC5). It reads the filesystem and therefore runs only at build time and under
 *  `node --test`, never inside the Worker. */
export function withMeta(entry: DokumentEntry): DokumentWithMeta | null {
	// `plik` is CMS-controlled content. Require the canonical /dokumenty/ prefix
	// and forbid traversal segments so the join below can never resolve outside
	// static/ (defense-in-depth; only .size is ever read).
	if (!entry.plik.startsWith('/dokumenty/') || entry.plik.includes('..')) {
		console.warn(`dokumenty: invalid plik path for "${entry.nazwa}" (${entry.plik}); skipping`);
		return null;
	}
	// Files are served verbatim from static/, so their public path maps 1:1 to
	// static${plik} on disk at build time. A missing file (e.g. deleted from the
	// Sveltia media library while its entry remains) must NOT abort the whole
	// prerender: skip the entry with a warning instead of failing the deploy.
	let bytes: number;
	try {
		bytes = statSync(join(process.cwd(), 'static', entry.plik)).size;
	} catch {
		console.warn(`dokumenty: missing file for "${entry.nazwa}" (${entry.plik}); skipping`);
		return null;
	}
	const typ = (entry.plik.split('.').pop() ?? '').toUpperCase();
	const rozmiar = formatRozmiar(bytes);
	return {
		...entry,
		typ,
		rozmiar,
		meta: `${typ} · ${rozmiar} · wersja z ${entry.wersja}`
	};
}

/** Read every seed entry and augment it with computed type/size meta (D-14).
 *  Entries whose file is missing or whose path is invalid are skipped (with a
 *  build warning) rather than failing the prerender of every consuming route. */
export function readDokumenty(): DokumentWithMeta[] {
	const modules = import.meta.glob<DokumentEntry>('$lib/content/dokumenty/*.json', {
		eager: true,
		import: 'default'
	});
	return Object.values(modules)
		.map(withMeta)
		.filter((entry): entry is DokumentWithMeta => entry !== null);
}

/** Group entries by category in the fixed order, omitting empty groups (D-13). */
export function groupDokumenty(entries: DokumentWithMeta[]): DokumentGroup[] {
	return KOLEJNOSC.map((kategoria) => ({
		kategoria,
		naglowek: NAGLOWEK[kategoria],
		dokumenty: entries.filter((entry) => entry.kategoria === kategoria)
	})).filter((group) => group.dokumenty.length > 0);
}
