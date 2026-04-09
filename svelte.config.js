import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build/srkk-eonchemicals',
			assets: 'build/srkk-eonchemicals',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
		paths: {
			base: '/srkk-eonchemicals'
		},
		alias: {
			$lib: './src/lib',
			$types: './src/lib/types'
		}
	}
};

export default config;
