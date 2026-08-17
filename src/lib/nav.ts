/**
 * Single source of the six main navigation links (SITE-03).
 *
 * Both the desktop `Header.svelte` and the mobile `MobileNav.svelte` drawer
 * consume this array so the six sections stay in lockstep. All labels are
 * Polish (SITE-06). The order and the count are locked by 01-UI-SPEC
 * Amendment v1.7 §1, which supersedes the „Links (5, Polish)" Header contract
 * and the Copywriting Contract nav row. Cennik sits after Rekrutacja because
 * cost is part of the enrolment decision.
 *
 * Galeria is deliberately NOT a nav destination: the gallery is a section of
 * `/o-nas` reached at `#galeria` and surfaced as a footer shortcut (05 D-19).
 */
export type NavLink = {
	label: string;
	href: string;
};

export const navLinks: NavLink[] = [
	{ label: 'Aktualności', href: '/aktualnosci' },
	{ label: 'O nas', href: '/o-nas' },
	{ label: 'Rekrutacja', href: '/rekrutacja' },
	{ label: 'Cennik', href: '/cennik' },
	{ label: 'Dokumenty', href: '/dokumenty' },
	{ label: 'Kontakt', href: '/kontakt' }
];
