<script lang="ts">
	// Bespoke duotone icon (UI-SPEC v1.2 §7). Perks: plac zabaw.
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
	<circle cx="12" cy="9" r="6" fill="var(--icon-fill, none)" />
	<path d="M12 15v6" />
	<path d="M8.5 21h7" />
</svg>
