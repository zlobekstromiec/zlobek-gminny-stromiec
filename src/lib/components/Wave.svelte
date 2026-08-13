<script lang="ts">
	// Decorative wavy section divider (UI-SPEC v1.2 §5). Exactly two uses on the
	// homepage: warm-to-accent above Perks, and white-to-brand-blue at the top of
	// the footer. Purely decorative (aria-hidden), zero runtime logic.
	let { fill, bg = 'transparent' }: { fill: string; bg?: string } = $props();
</script>

<svg
	viewBox="0 0 1440 60"
	preserveAspectRatio="none"
	aria-hidden="true"
	focusable="false"
	style:background={bg}
>
	<path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" {fill} />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 44px;
	}
</style>
