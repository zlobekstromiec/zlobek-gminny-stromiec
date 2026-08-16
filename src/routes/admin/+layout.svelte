<script lang="ts">
	// Panel shell. INTENTIONALLY MINIMAL in this plan: Plan 03 replaces this file in
	// full with 04.1-UI-SPEC.md Component Contract 1, which adds the sticky header
	// bar, „Zalogowano jako", the „Sekcje panelu" nav, the publish-delay info line
	// and the footer.
	//
	// What is already binding here is the structure, because a landmark contract
	// retrofitted later is a landmark contract that leaks: the skip link is the first
	// focusable element and there is exactly one <main id="main">.
	//
	// TopBar, Header, Footer and Wave are deliberately NOT imported, now or later.
	// The panel is a tool, not a page of the website. src/routes/+layout.svelte
	// carves /admin out of the public chrome for the same reason.
	//
	// Seo leaves `noindex` at its default of true (D-17, T-04.1-14). No admin route
	// is linked from any public page or from the sitemap.
	import type { Snippet } from 'svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SkipLink from '$lib/components/SkipLink.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<Seo
	title="{data.sekcja}, panel redakcyjny"
	description="Panel redakcyjny strony Publicznego Żłobka w Stromcu. Dostęp wyłącznie dla osób upoważnionych."
	canonical="/admin"
/>

<SkipLink />
<main id="main">{@render children()}</main>
