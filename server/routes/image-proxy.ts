import type { Context } from 'hono';

export const imageProxy = async (c: Context) => {
	const url = c.req.query('url');

	if (!url) {
		return c.text('URL parameter is required', 400);
	}

	const urlObj = new URL(url);

	if (
		urlObj.hostname !== 'substackcdn.com' &&
		urlObj.hostname !== 'images.unsplash.com' &&
		!urlObj.hostname.endsWith('wikimedia.org') &&
		!urlObj.hostname.endsWith('wikipedia.org')
	) {
		return c.text('Only images from Substack are allowed', 400);
	}

	try {
		const response = await fetch(url);
		const buffer = Buffer.from(await response.arrayBuffer());

		c.header(
			'Content-Type',
			response.headers.get('content-type') ?? 'image/jpeg'
		);

		return c.body(buffer);
	} catch (error) {
		console.error('Error fetching the image:', error);
		return c.json({ error: 'Error fetching the image' }, 500);
	}
};
