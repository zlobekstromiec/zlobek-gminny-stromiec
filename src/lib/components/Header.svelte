<script lang="ts">
	// Persistent sticky header (SITE-03, UI-SPEC v1.3 §3). Real circular brand
	// emblem + two-line wordmark left, five section links right on >= md; below md
	// the links collapse to the MobileNav hamburger drawer. Active section is an
	// accent pill chip AND aria-current="page", never colour alone.
	import { page } from '$app/state';
	import { navLinks } from '$lib/nav';
	import MobileNav from './MobileNav.svelte';
	import logoMark from '$lib/assets/brand/logo-mark.png?enhanced';

	// Reactive current path for the active-link state (Svelte 5 runes).
	const pathname = $derived(page.url.pathname);
	function isActive(href: string): boolean {
		return pathname === href || pathname.startsWith(href + '/');
	}

	// Header gains shadow-sm once the page is scrolled.
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 4);
</script>

<svelte:window bind:scrollY />

<header class="site-header" class:scrolled>
	<div class="bar">
		<a class="wordmark" href="/">
			<span class="brand-mark">
				<enhanced:img src={logoMark} alt="" sizes="52px" />
			</span>
			<span class="wordmark-text">
				<span class="wordmark-name">Publiczny Żłobek w Stromcu</span>
				<span class="wordmark-tagline">Jednostka organizacyjna Gminy Stromiec</span>
			</span>
		</a>

		<!-- Desktop navigation (>= md). -->
		<nav class="desktop-nav" aria-label="Główna nawigacja">
			<ul>
				{#each navLinks as link (link.href)}
					<li>
						<a
							href={link.href}
							class="nav-link"
							aria-current={isActive(link.href) ? 'page' : undefined}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- Mobile drawer island (< md): the one hydrated interaction. -->
		<div class="mobile-slot">
			<MobileNav />
		</div>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--color-surface);
		border-bottom: 4px solid var(--color-accent);
		transition: box-shadow 150ms ease;
	}

	.site-header.scrolled {
		box-shadow:
			0 1px 2px rgb(15 23 42 / 0.06),
			0 1px 3px rgb(15 23 42 / 0.08);
	}

	.bar {
		max-width: 72rem;
		margin-inline: auto;
		height: 64px;
		padding-inline: 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	@media (min-width: 1024px) {
		.bar {
			height: 72px;
			padding-inline: 32px;
		}
	}

	@media (min-width: 768px) {
		.bar {
			padding-inline: 24px;
		}
	}

	.wordmark {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		min-height: 44px;
		text-decoration: none;
	}

	/* Brand emblem (v1.3 §3): the real mark is full-colour and self-contained, so
	   it sits directly on the header surface with no accent circle behind it and
	   no hard toy shadow. Decorative: the wordmark text names the link. */
	.brand-mark {
		flex: none;
		display: flex;
	}

	.brand-mark :global(img) {
		display: block;
		height: 52px;
		width: auto;
	}

	.wordmark-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.wordmark-name {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.1;
		color: var(--color-brand-blue);
	}

	.wordmark:hover .wordmark-name {
		text-decoration: underline;
	}

	/* 12px legalized for this single use (v1.2 §3). */
	.wordmark-tagline {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 12px;
		line-height: 1.2;
		color: var(--color-muted);
	}

	/* Desktop links: hidden below md, horizontal flex from md up. */
	.desktop-nav {
		display: none;
	}

	@media (min-width: 768px) {
		.desktop-nav {
			display: block;
		}
	}

	.desktop-nav ul {
		display: flex;
		align-items: center;
		gap: 4px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
		text-decoration: none;
	}

	.nav-link:hover {
		background: var(--color-tint-yellow);
		color: var(--color-ink);
	}

	/* Active section: accent pill chip AND aria-current (not colour alone).
	   Ink on accent: 6.82:1 (v1.2 pairing table). */
	.nav-link[aria-current='page'] {
		background: var(--color-accent);
		color: var(--color-ink);
		box-shadow: 0 3px 0 var(--color-accent-active);
	}

	/* Hamburger island only appears below md. */
	.mobile-slot {
		display: flex;
	}

	@media (min-width: 768px) {
		.mobile-slot {
			display: none;
		}
	}
</style>
