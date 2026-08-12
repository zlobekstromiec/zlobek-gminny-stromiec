/**
 * Single source of the five main navigation links (SITE-03).
 *
 * Both the desktop `Header.svelte` and the mobile `MobileNav.svelte` drawer
 * consume this array so the five sections stay in lockstep. All labels are
 * Polish (SITE-06). Order and copy are locked by 01-UI-SPEC §Copywriting Contract.
 */
export type NavLink = {
	label: string;
	href: string;
};

export const navLinks: NavLink[] = [
	{ label: 'Aktualności', href: '/aktualnosci' },
	{ label: 'O nas', href: '/o-nas' },
	{ label: 'Rekrutacja', href: '/rekrutacja' },
	{ label: 'Dokumenty', href: '/dokumenty' },
	{ label: 'Kontakt', href: '/kontakt' }
];
