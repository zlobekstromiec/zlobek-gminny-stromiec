<script lang="ts">
	// The walking skeleton's single hydrated island (SITE-02 / A11Y baseline):
	// a keyboard-operable mobile navigation drawer. Below `md`, the five section
	// links collapse behind a hamburger that opens a role="dialog" panel with a
	// focus trap, ESC-to-close, focus restore, and body-scroll lock. Built from
	// native <button>/<a> elements — no hand-rolled click-divs. Motion respects
	// prefers-reduced-motion (UI-SPEC §Header/Nav mobile + §Motion).
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/state';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import { navLinks } from '$lib/nav';

	// Active section mirrors the header's accent pill (UI-SPEC v1.2 §3).
	const pathname = $derived(page.url.pathname);
	function isActive(href: string): boolean {
		return pathname === href || pathname.startsWith(href + '/');
	}

	const DRAWER_ID = 'mobile-nav-drawer';
	const DRAWER_MS = 220;

	let open = $state(false);

	let hamburgerEl: HTMLButtonElement | undefined = $state();
	let closeBtnEl: HTMLButtonElement | undefined = $state();
	let dialogEl: HTMLElement | undefined = $state();

	/** Slide/fade duration — 0 (instant) when the user prefers reduced motion. */
	function motionMs(): number {
		if (typeof window === 'undefined') return 0;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DRAWER_MS;
	}

	function openDrawer() {
		open = true;
	}
	function closeDrawer() {
		open = false;
	}

	// While open: lock body scroll and move focus to the close button. On close
	// (effect cleanup): release the scroll lock and restore focus to the hamburger.
	$effect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeBtnEl?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
			hamburgerEl?.focus();
		};
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeDrawer();
			return;
		}
		if (event.key !== 'Tab' || !dialogEl) return;

		// Bounded focus trap over the drawer's focusable elements.
		const focusables = Array.from(
			dialogEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
		).filter((el) => el.tabIndex !== -1);
		if (focusables.length === 0) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<button
	bind:this={hamburgerEl}
	type="button"
	class="hamburger"
	aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}
	aria-expanded={open}
	aria-controls={DRAWER_ID}
	onclick={openDrawer}
>
	<Menu size={24} aria-hidden="true" />
</button>

{#if open}
	<!-- Scrim: mouse-dismiss convenience. Keyboard users dismiss via the close
	     button (first focus) or ESC, so the static element carries no keyboard
	     handler by design. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="scrim" transition:fade={{ duration: motionMs() }} onclick={closeDrawer}></div>

	<div
		bind:this={dialogEl}
		id={DRAWER_ID}
		class="drawer"
		role="dialog"
		aria-modal="true"
		aria-label="Menu nawigacyjne"
		tabindex="-1"
		transition:fly={{ x: 320, duration: motionMs() }}
		onkeydown={handleKeydown}
	>
		<div class="drawer-head">
			<button
				bind:this={closeBtnEl}
				type="button"
				class="close-btn"
				aria-label="Zamknij menu"
				onclick={closeDrawer}
			>
				<X size={24} aria-hidden="true" />
			</button>
		</div>

		<nav aria-label="Nawigacja mobilna">
			<ul>
				{#each navLinks as link (link.href)}
					<li>
						<a
							class="drawer-link"
							href={link.href}
							aria-current={isActive(link.href) ? 'page' : undefined}
							onclick={closeDrawer}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
{/if}

<style>
	.hamburger,
	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: var(--color-ink);
		cursor: pointer;
	}

	.hamburger:hover,
	.close-btn:hover {
		color: var(--color-brand-blue);
	}

	.scrim {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgb(15 23 42 / 0.45);
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 70;
		display: flex;
		flex-direction: column;
		width: min(320px, 85vw);
		padding: 8px 16px 24px;
		background: var(--color-surface);
		box-shadow: 0 12px 28px rgb(15 23 42 / 0.12);
	}

	.drawer-head {
		display: flex;
		justify-content: flex-end;
		height: 64px;
		align-items: center;
	}

	.drawer nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.drawer-link {
		display: flex;
		align-items: center;
		min-height: 44px;
		width: 100%;
		padding: 8px 4px;
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-ink);
		text-decoration: none;
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.drawer-link:hover {
		color: var(--color-brand-blue);
		text-decoration: underline;
	}

	/* Active section: accent pill matching the header chip (never colour alone). */
	.drawer-link[aria-current='page'] {
		background: var(--color-accent);
		color: var(--color-ink);
		border-radius: var(--radius-sm);
		box-shadow: 0 3px 0 var(--color-accent-active);
	}

	/* Explicit instant show/hide when reduced motion is requested (the JS duration
	   is already 0; this also neutralises any inherited transition on the panel). */
	@media (prefers-reduced-motion: reduce) {
		.scrim,
		.drawer {
			transition: none;
		}
	}
</style>
