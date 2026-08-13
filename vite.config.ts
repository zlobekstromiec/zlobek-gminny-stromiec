import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Tailwind v4 attaches via its Vite plugin — there is no tailwind.config.js
// and no PostCSS config (CSS-first @theme tokens live in src/app.css).
// enhancedImages() must run BEFORE sveltekit() so <enhanced:img> and the
// { query: { enhanced: true } } glob imports over src/lib/assets/uploads/*
// are processed at build (D-07; RESEARCH Pattern 2).
export default defineConfig({ plugins: [tailwindcss(), enhancedImages(), sveltekit()] });
