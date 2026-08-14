<script lang="ts">
	// Reusable per-route head/SEO mechanism (RESEARCH §Pattern 5, PITFALLS #11).
	// Emits a Polish <title>, meta description, canonical link, and Open Graph +
	// Twitter card tags using the branded placeholder share image (Plan 01-04).
	//
	// D-11: while the site lives on *.pages.dev it must NOT be indexed. Because
	// crawlers read the PRERENDERED HTML (not a client-side re-render), the noindex
	// must be baked into the static output: so it is emitted unconditionally in
	// Phase 1 via `noindex` defaulting to true, paired with the robots.txt Disallow.
	// Phase 6 passes `noindex={false}` once the real custom domain is live.
	//
	// D-12: NO JSON-LD structured data and NO Google Search Console token here:
	// both are deferred to Phase 6 (need confirmed NAP data + the real domain).
	let {
		title,
		description,
		canonical = '/',
		image = '/og-placeholder.png',
		noindex = true
	}: {
		title: string;
		description: string;
		canonical?: string;
		image?: string;
		noindex?: boolean;
	} = $props();

	const siteName = 'Publiczny Żłobek w Stromcu';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="pl_PL" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={image} />

	<!-- Twitter card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
</svelte:head>
