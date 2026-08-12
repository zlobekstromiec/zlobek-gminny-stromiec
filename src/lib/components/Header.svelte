<script lang="ts">
	// Persistent sticky header (SITE-03). Wordmark left, five section links right
	// on >= md; below md the links collapse to the MobileNav hamburger drawer
	// (wired in Task 2). Active section is signalled by a 3px brand-blue bottom bar
	// AND aria-current="page" — never colour alone (UI-SPEC §Header/Nav link states).
	import { page } from '$app/state';
	import { navLinks } from '$lib/nav';

	// Reactive current path for the active-link state (Svelte 5 runes).
	const pathname = $derived(page.url.pathname);
	function isActive(href: string): boolean {
		return pathname === href || pathname.startsWith(href + '/');
	}

	// Header gains shadow-sm + a hairline border once the page is scrolled.
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 4);
</script>

<svelte:window bind:scrollY />

<header class="site-header" class:scrolled>
	<div class="bar">
		<a class="wordmark" href="/">Żłobek Gminny Stromiec</a>

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

		<!-- Mobile drawer island (< md) — the one hydrated interaction.
		     MobileNav mounts here; the component + wiring land in Task 2. -->
		<div class="mobile-slot">
			<!-- MobileNav placeholder (Task 2) -->
		</div>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--color-surface);
		border-bottom: 1px solid transparent;
		transition:
			box-shadow 150ms ease,
			border-color 150ms ease;
	}

	.site-header.scrolled {
		border-bottom-color: var(--color-border-subtle);
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
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 20px;
		line-height: 1.1;
		color: var(--color-brand-blue);
		text-decoration: none;
		/* 44px hit area (WCAG 2.5.5). */
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}

	.wordmark:hover {
		text-decoration: underline;
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
		gap: 24px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		position: relative;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 2px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
		text-decoration: none;
	}

	.nav-link:hover {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	/* Active section: 3px brand-blue bottom bar AND aria-current (not colour alone). */
	.nav-link[aria-current='page'] {
		color: var(--color-brand-blue);
	}

	.nav-link[aria-current='page']::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 6px;
		height: 3px;
		background: var(--color-brand-blue);
		border-radius: 9999px;
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
