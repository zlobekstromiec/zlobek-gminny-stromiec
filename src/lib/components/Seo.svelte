<script lang="ts">
	// Reusable per-route head/SEO mechanism (RESEARCH §Pattern 5, PITFALLS #11).
	// Emits a Polish <title>, meta description, canonical link, and Open Graph +
	// Twitter card tags using the branded placeholder share image (Plan 01-04).
	//
	// D-11, CLOSED on 2026-09-29 (quick 260929-kzw): from Phase 1 to that day every public
	// route baked `noindex` into its prerendered HTML and robots.txt disallowed everything,
	// because the site lived on *.pages.dev. The director asked for the site to be found on
	// Google, so `noindex` now defaults to FALSE and the panel layout is the one caller that
	// still passes it explicitly. Crawlers read the prerendered HTML, so this default is what
	// the build writes out; there is no runtime host check.
	//
	// The canonical and the Open Graph URLs are ABSOLUTE on the custom domain (site.ts
	// `siteUrl`), so the *.pages.dev alias, which serves the very same HTML, points search
	// engines at zlobekstromiec.pl instead of competing with it as a duplicate.
	//
	// D-12: NO JSON-LD structured data and NO Google Search Console token here: both stay
	// deferred (need confirmed NAP data; Search Console verification is a DNS record).
	import { siteUrl } from '$lib/content/site';

	let {
		title,
		description,
		canonical = '/',
		image = '/og-placeholder.png',
		noindex = false
	}: {
		title: string;
		description: string;
		canonical?: string;
		image?: string;
		noindex?: boolean;
	} = $props();

	const siteName = 'Publiczny Żłobek w Stromcu';
	const absolute = (path: string) => (path.startsWith('/') ? siteUrl + path : path);
	const canonicalUrl = $derived(absolute(canonical));
	const imageUrl = $derived(absolute(image));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="pl_PL" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={imageUrl} />

	<!-- Twitter card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
