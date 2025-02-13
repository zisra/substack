import { Database } from '@/lib/database';
import { clientsClaim } from 'workbox-core';
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
clientsClaim();

// Open database
const db = new Database();
db.open();

// Intercept image requests
registerRoute(
	({ request }) => request.destination === 'image',
	async ({ request }) => {
		const image = await db.getImage(request.url);

		if (image) {
			return new Response(image.blob, {
				headers: { 'Content-Type': image.blob.type },
			});
		}
		return fetch(request);
	},
);

const handler = createHandlerBoundToURL('/index.html');
registerRoute(({ request }) => request.mode === 'navigate', handler);

self.addEventListener('message', async (event) => {
	if (event.data && event.data.type === 'CACHE_IMAGE') {
		const { url } = event.data;

		try {
			await db.saveImage(url);
		} catch (err) {
			console.error(`Failed to fetch image: ${url}`, err);
		}
	} else if (event.data && event.data.type === 'DELETE_IMAGES') {
		const { url } = event.data;
		await db.deleteImage(url);
	}
});
