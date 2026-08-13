<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). KeyFacts: opłata miesięczna.
	let { size = 24 }: { size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<circle cx="9" cy="9.5" r="5.5" />
	<circle cx="14.5" cy="14.5" r="5.5" fill="var(--icon-fill, none)" />
	<path d="M12.5 14.5h4" />
</svg>
