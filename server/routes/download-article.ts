import type { FastifyReply, FastifyRequest } from 'fastify';
import { scrapeSubstack } from '../scrapers.ts/substack';
import { scrapeWikipedia } from '../scrapers.ts/wikipedia';

interface Query {
	url?: string;
}

export const downloadArticle = async (
	req: FastifyRequest<{ Querystring: Query }>,
	res: FastifyReply
) => {
	const url = req.query.url;

	if (!url) {
		return res.status(400).send('URL parameter is required');
	}

	const urlObj = new URL(url);
	urlObj.search = '';

	try {
		const response = await fetch(urlObj.toString());
		const html = await response.text();

		if (urlObj.hostname === 'en.wikipedia.org') {
			const output = scrapeWikipedia(html);
			return res.send(output);
		}
		const output = scrapeSubstack(html);
		res.send(output);
	} catch (error) {
		console.error('Error fetching the URL:', error);
		res.status(500).send({
			error: 'Error fetching the URL',
		});
	}
};
