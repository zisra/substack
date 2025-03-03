import type { Context } from 'hono';
import { scrapeComments } from '../scrapers/comments';

interface Query {
	url?: string;
}

export const downloadComments = async (c: Context) => {
	const url = c.req.query('url');

	if (!url) {
		return c.text('URL parameter is required', 400);
	}

	try {
		const output = await scrapeComments(url);
		return c.json(output);
	} catch (error) {
		console.error('Error fetching the URL:', error);
		return c.json({ error: 'Error fetching the URL' }, 500);
	}
};
