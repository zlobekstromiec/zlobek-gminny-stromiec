<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Semantic landmark shell (WCAG 2.1 AA): the skip link is the first focusable
     element, then exactly one <header>, one <main id="main">, one <footer>.
     The single <nav aria-label="Główna nawigacja"> lives inside <Header>. -->
<SkipLink />
<Header />
<main id="main">{@render children()}</main>
<Footer />
