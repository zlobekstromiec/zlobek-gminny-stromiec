<script lang="ts">
	// Homepage v2.1 (HOME-01, HOME-02, SITE-02, SITE-06; UI-SPEC v1.2 §6 section
	// order). Composes: Seo, Hero (single h1, sentence-2 lead), KeyFacts, Wave into
	// the Perks band, Recruitment (centrepiece), DayPlan, AboutTeaser (full verbatim
	// core message), ContactAndMap (the page's only mailto), and Aktualności ONLY
	// once posts exist (never an empty state here). TopBar/Header/Footer + <main>
	// come from +layout.svelte: this route adds NO extra landmarks and NO extra h1.
	import Seo from '$lib/components/Seo.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import KeyFacts from '$lib/components/KeyFacts.svelte';
	import Wave from '$lib/components/Wave.svelte';
	import Perks from '$lib/components/Perks.svelte';
	import Recruitment from '$lib/components/Recruitment.svelte';
	import DayPlan from '$lib/components/DayPlan.svelte';
	import AboutTeaser from '$lib/components/AboutTeaser.svelte';
	import ContactAndMap from '$lib/components/ContactAndMap.svelte';
	import NewsPreview from '$lib/components/NewsPreview.svelte';
	import { posts } from '$lib/content/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const showNews = posts.length > 0;
</script>

<Seo
	title="Żłobek Gminny w Stromcu: ciepła, bezpieczna opieka dla najmłodszych"
	description="Żłobek Gminny w Stromcu: ciepła i bezpieczna opieka nad najmłodszymi. Zapisz dziecko, poznaj naszą ofertę oraz dane kontaktowe."
/>

<Hero />
<KeyFacts />
<Wave fill="var(--color-accent)" bg="var(--color-surface-warm)" />
<Perks />
<Recruitment docs={data.docs} />
<DayPlan />
<AboutTeaser />
<ContactAndMap />
{#if showNews}
	<NewsPreview />
{/if}
