<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). KeyFacts: liczba miejsc.
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
	<path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" fill="var(--icon-fill, none)" />
	<path d="M4 11 12 4l8 7" />
	<path d="M10 20v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4" />
</svg>
