<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). Perks: bezpieczeństwo.
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
	<path d="M12 3l7 3v5c0 4.8-2.9 8.2-7 10-4.1-1.8-7-5.2-7-10V6z" fill="var(--icon-fill, none)" />
	<path d="m9 11.5 2.5 2.5L15.5 9.5" />
</svg>
