<script lang="ts">
	// Shared news card (NEWS-01; 03-UI-SPEC.md News card contract). The single
	// whole-card link reused by the /aktualnosci list now and the homepage
	// NewsPreview in Plan 04 ("one shared card component"). Self-contained: it
	// resolves its own cover via a build-time enhanced-img glob and a by-BASENAME
	// map (exactly like o-nas/+page.svelte). The basename lookup IS the path-
	// traversal defense (T-03-03): an unknown basename yields the decorative tint
	// fallback, never a filesystem read of an arbitrary path. A post with no obraz
	// (the D-01 seed) renders the tint-fallback card, never a bare/broken box.
	import type { Picture } from '@sveltejs/enhanced-img';
	import Calendar from '@lucide/svelte/icons/calendar';
	import IconSun from '$lib/icons/IconSun.svelte';

	let {
		tytul,
		href,
		iso,
		dataDisplay,
		excerpt,
		obraz,
		obraz_alt
	}: {
		tytul: string;
		href: string;
		iso: string;
		dataDisplay: string;
		excerpt: string;
		obraz?: string;
		obraz_alt?: string;
	} = $props();

	// Statically-analyzable glob: keys are absolute file paths, values are
	// processed enhanced-img Picture objects. Map by final path segment (basename).
	const uploads = import.meta.glob<Picture>('$lib/assets/uploads/*.{jpg,jpeg,png,webp}', {
		query: { enhanced: true },
		eager: true,
		import: 'default'
	});
	const byName: Record<string, Picture> = {};
	for (const [path, mod] of Object.entries(uploads)) {
		const base = path.split('/').pop();
		if (base) byName[base] = mod;
	}
	const cover = $derived(obraz ? byName[obraz.split('/').pop() ?? obraz] : undefined);
</script>

<a class="news-card" {href}>
	<div class="cover">
		{#if cover}
			<enhanced:img
				src={cover}
				alt={obraz_alt ?? ''}
				sizes="(min-width:1024px) 30vw, (min-width:768px) 50vw, 100vw"
			/>
		{:else}
			<div class="cover-fallback" aria-hidden="true">
				<span class="chip">
					<IconSun size={46} />
				</span>
			</div>
		{/if}
	</div>
	<div class="body">
		<p class="date">
			<Calendar class="date-icon" size={16} aria-hidden="true" focusable="false" />
			<time datetime={iso}>{dataDisplay}</time>
		</p>
		<h3>{tytul}</h3>
		<p class="excerpt">{excerpt}</p>
	</div>
</a>

<style>
	.news-card {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-md);
		overflow: hidden;
		text-decoration: none;
		box-shadow:
			0 1px 2px rgb(15 23 42 / 0.06),
			0 4px 12px rgb(15 23 42 / 0.08);
		transition:
			box-shadow 150ms ease,
			transform 150ms ease;
	}

	.news-card:hover {
		box-shadow:
			0 2px 4px rgb(15 23 42 / 0.08),
			0 12px 28px rgb(15 23 42 / 0.14);
	}

	/* Hover raise only when motion is allowed (A11Y-01). */
	@media (prefers-reduced-motion: no-preference) {
		.news-card:hover {
			transform: translateY(-2px);
		}
	}

	.cover {
		aspect-ratio: 16 / 9;
		border-radius: var(--radius-sm);
		overflow: hidden;
		margin: 0;
	}

	.cover :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Imageless tint-fallback panel (decorative). Brand-blue stroke on tint-blue
	   >= 3:1 per the v1.2 pairing table. */
	.cover-fallback {
		width: 100%;
		height: 100%;
		background: var(--color-tint-blue);
		display: grid;
		place-items: center;
	}

	.chip {
		width: 46px;
		height: 46px;
		display: grid;
		place-items: center;
		color: var(--color-brand-blue);
		--icon-fill: #ffffff;
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
	}

	@media (min-width: 1024px) {
		.body {
			padding: 24px;
		}
	}

	.date {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		line-height: 1.4;
		color: var(--color-muted);
	}

	.date :global(.date-icon) {
		flex: none;
		color: var(--color-muted);
	}

	h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--color-brand-blue);
	}

	.news-card:hover h3 {
		text-decoration: underline;
	}

	.excerpt {
		margin: 0;
		font-family: var(--font-body);
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-muted);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
</style>
