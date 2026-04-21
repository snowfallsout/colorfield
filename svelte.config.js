import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Use adapter-node so the built app runs as a single Node process.
		// This enables importing server-only modules (e.g. Socket.IO) alongside
		// shared TypeScript data modules at runtime.
		adapter: adapter()
	}
};

export default config;
