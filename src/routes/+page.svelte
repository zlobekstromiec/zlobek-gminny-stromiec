<script lang="ts">
	// Homepage (HOME-01, HOME-02, SITE-02, SITE-06) — the user-facing payload of the
	// walking skeleton. Composes, in order: Seo (per-route Polish head) → Hero (owns
	// the single <h1> + the verbatim core message) → NewsPreview (required empty
	// state) → QuickContact. The persistent Header/Footer + <main> landmark come from
	// +layout.svelte, so this route adds NO extra header/main/footer and NO extra h1.
	import Seo from '$lib/components/Seo.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import NewsPreview from '$lib/components/NewsPreview.svelte';
	import QuickContact from '$lib/components/QuickContact.svelte';
</script>

<Seo
	title="Żłobek Gminny w Stromcu — ciepła, bezpieczna opieka dla najmłodszych"
	description="Żłobek Gminny w Stromcu — ciepła i bezpieczna opieka nad najmłodszymi. Zapisz dziecko, poznaj naszą ofertę oraz dane kontaktowe."
/>

<Hero />
<NewsPreview />
<QuickContact />
