<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). Perks: rozwój przez zabawę.
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
	<rect x="12" y="4" width="8" height="8" rx="1.5" />
	<rect x="4" y="12" width="8" height="8" rx="1.5" fill="var(--icon-fill, none)" />
</svg>
