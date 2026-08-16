<script lang="ts">
	// Branded favicon set is linked from app.html (static/favicon.*): the old
	// scaffold svelte:head icon override is gone (review WR-01).
	import '../app.css';
	import { page } from '$app/state';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	// The admin panel is a tool, not a page of the website, and 04.1-UI-SPEC.md
	// Component Contract 1 gives it a SEPARATE shell with no TopBar, Header, Footer
	// or Wave. SvelteKit always applies this root layout to every route and the
	// `@` layout-reset syntax cannot escape it, so the panel is carved out here
	// instead. Without this branch /admin would render the public chrome AND two
	// <main id="main"> landmarks, one from this file and one from
	// src/routes/admin/+layout.svelte, which is a landmark and duplicate-id defect
	// rather than a cosmetic one.
	//
	// Only url.pathname is read, never url.searchParams: this file prerenders for
	// the whole public site and searchParams is unavailable during prerendering.
	const panel = $derived(page.url.pathname === '/admin' || page.url.pathname.startsWith('/admin/'));
</script>

{#if panel}
	<!-- src/routes/admin/+layout.svelte owns the panel's landmark shell. -->
	{@render children()}
{:else}
	<!-- Semantic landmark shell (WCAG 2.1 AA): the skip link is the first focusable
	     element, then exactly one <header>, one <main id="main">, one <footer>.
	     The single <nav aria-label="Główna nawigacja"> lives inside <Header>. -->
	<SkipLink />
	<TopBar />
	<Header />
	<main id="main">{@render children()}</main>
	<Footer />
{/if}
