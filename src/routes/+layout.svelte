<script lang="ts">
	// Branded favicon set is linked from app.html (static/favicon.*): the old
	// scaffold svelte:head icon override is gone (review WR-01).
	import '../app.css';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<!-- Semantic landmark shell (WCAG 2.1 AA): the skip link is the first focusable
     element, then exactly one <header>, one <main id="main">, one <footer>.
     The single <nav aria-label="Główna nawigacja"> lives inside <Header>. -->
<SkipLink />
<TopBar />
<Header />
<main id="main">{@render children()}</main>
<Footer />
