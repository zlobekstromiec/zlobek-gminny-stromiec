<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). Hero status pill.
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
	<circle cx="12" cy="12" r="4" fill="var(--icon-fill, none)" />
	<path d="M12 3v2.5" />
	<path d="M12 18.5V21" />
	<path d="M3 12h2.5" />
	<path d="M18.5 12H21" />
	<path d="m5.6 5.6 1.8 1.8" />
	<path d="m16.6 16.6 1.8 1.8" />
	<path d="m5.6 18.4 1.8-1.8" />
	<path d="m16.6 7.4 1.8-1.8" />
</svg>
