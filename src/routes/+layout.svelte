<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Minimal semantic shell for the walking skeleton. The full landmark shell
     (skip link, <header>/<nav>, <footer>) lands in Plan 02. -->
<main id="main">{@render children()}</main>
