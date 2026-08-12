import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Tailwind v4 attaches via its Vite plugin — there is no tailwind.config.js
// and no PostCSS config (CSS-first @theme tokens live in src/app.css).
export default defineConfig({ plugins: [tailwindcss(), sveltekit()] });
