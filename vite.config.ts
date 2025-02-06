import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['vite.svg'],
			manifest: {
				name: 'Substack Offline Viewer',
				short_name: 'substack-offline',
				description: 'Download substack articles for offline use',
				theme_color: '#020817',
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
