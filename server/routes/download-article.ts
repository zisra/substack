import type { Context } from 'hono';
import { scrapeUniversal } from '../scrapers/scrapeUniversal';
import { scrapeSubstack } from '../scrapers/substack';
import { scrapeWikipedia } from '../scrapers/wikipedia';

export const downloadArticle = async (c: Context) => {
	const url = c.req.query('url');
	const universal = c.req.query('universal') === 'true';

	if (!url) {
		return c.text('URL parameter is required', 400);
	}

	const urlObj = new URL(url);
	urlObj.search = '';

	try {
		const response = await fetch(urlObj.toString());
		const html = await response.text();

		if (universal) {
			const output = await scrapeUniversal(html);
			return c.json(output);
		}

		if (urlObj.hostname === 'en.wikipedia.org') {
			const output = scrapeWikipedia(html);
			return c.json(output);
		}
		const output = await scrapeSubstack(html);
		return c.json(output);
	} catch (error) {
		console.error('Error fetching the URL:', error);
		return c.json({ error: 'Error fetching the URL' }, 500);
	}
};
