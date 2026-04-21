import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import socketIOPlugin from './src/lib/server/vite-socket-plugin';

export default defineConfig({
	plugins: [sveltekit(), socketIOPlugin()]
});
