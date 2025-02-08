import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { Database } from './lib/database';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();

// cache web app
registerRoute(
	new NavigationRoute(
		new NetworkFirst({
			cacheName: 'start-url',
		})
	)
);

const db = new Database();
db.open();

// Intercept image requests
registerRoute(
	({ request }) => request.destination === 'image',
	async ({ request }) => {
		const image = await db.getImage(request.url);

		if (image) {
			console.log(`Image served from cache: ${request.url}`);
			return new Response(image.blob, {
				headers: { 'Content-Type': image.blob.type },
			});
		}
		return fetch(request);
	}
);

self.addEventListener('message', async (event) => {
	if (event.data && event.data.type === 'CACHE_IMAGE') {
		const { url } = event.data;

		try {
			await db.saveImage(url);
			console.log(`Image cached: ${url}`);
		} catch (err) {
			console.error(`Failed to fetch image: ${url}`, err);
		}
	} else if (event.data && event.data.type === 'DELETE_IMAGES') {
		const { url } = event.data;
		await db.deleteImage(url);
		console.log(`Image deleted: ${url}`);
	}
});
