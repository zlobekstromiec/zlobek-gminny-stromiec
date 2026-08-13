// Shared build-time document resolver (DOCS-01; 02-RESEARCH.md Code Examples,
// 02-PATTERNS.md dokumenty route). Server-only: it reads the seed folder
// collection at build via import.meta.glob and computes each file's type + size
// from disk with node:fs statSync (D-14 — never stored or typed by staff, so the
// meta can never drift when a file is replaced). Kept free of Svelte/UI concerns
// so it can be reused by both /dokumenty and the homepage docs panel (Plan 03).
import { statSync } from 'node:fs';
import { join } from 'node:path';

export type Kategoria = 'rekrutacja' | 'statut' | 'rodo';

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
// appears once it holds at least one document (Phase 4).
const KOLEJNOSC: Kategoria[] = ['rekrutacja', 'statut', 'rodo'];
const NAGLOWEK: Record<Kategoria, string> = {
	rekrutacja: 'Rekrutacja',
	statut: 'Statut i uchwały',
	rodo: 'RODO'
};

function formatRozmiar(bytes: number): string {
	const kb = bytes / 1024;
	if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
	return `${Math.max(1, Math.round(kb))} KB`;
}

function withMeta(entry: DokumentEntry): DokumentWithMeta {
	// Files are served verbatim from static/, so their public path maps 1:1 to
	// static${plik} on disk at build time.
	const bytes = statSync(join(process.cwd(), 'static', entry.plik)).size;
	const typ = (entry.plik.split('.').pop() ?? '').toUpperCase();
	const rozmiar = formatRozmiar(bytes);
	return {
		...entry,
		typ,
		rozmiar,
		meta: `${typ} · ${rozmiar} · wersja z ${entry.wersja}`
	};
}

/** Read every seed entry and augment it with computed type/size meta (D-14). */
export function readDokumenty(): DokumentWithMeta[] {
	const modules = import.meta.glob<DokumentEntry>('$lib/content/dokumenty/*.json', {
		eager: true,
		import: 'default'
	});
	return Object.values(modules).map(withMeta);
}

/** Group entries by category in the fixed order, omitting empty groups (D-13). */
export function groupDokumenty(entries: DokumentWithMeta[]): DokumentGroup[] {
	return KOLEJNOSC.map((kategoria) => ({
		kategoria,
		naglowek: NAGLOWEK[kategoria],
		dokumenty: entries.filter((entry) => entry.kategoria === kategoria)
	})).filter((group) => group.dokumenty.length > 0);
}
