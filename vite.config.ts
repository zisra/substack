import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'sw.ts',
			registerType: 'autoUpdate',
			includeAssets: ['vite.svg'],
			injectManifest: {
				swDest: 'dist/sw.js',
			},
			manifest: {
				name: 'Substack Offline',
				short_name: 'substack-offline',
				description: 'Download substack articles for offline use',
				theme_color: '#0A0A0A',
				start_url: '/',
				display: 'standalone',
				orientation: 'portrait',
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
