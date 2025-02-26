import type { FastifyReply, FastifyRequest } from 'fastify';
import { scrapeUniversal } from '../scrapers/scrapeUniversal';
import { scrapeSubstack } from '../scrapers/substack';
import { scrapeWikipedia } from '../scrapers/wikipedia';

interface Query {
	url?: string;
	universal?: boolean;
}

export const downloadArticle = async (
	req: FastifyRequest<{ Querystring: Query }>,
	res: FastifyReply
) => {
	const url = req.query.url;
	const universal = req.query.universal;

	if (!url) {
		return res.status(400).send('URL parameter is required');
	}

	const urlObj = new URL(url);
	urlObj.search = '';

	try {
		const response = await fetch(urlObj.toString());
		const html = await response.text();

		if (universal === true) {
			const output = await scrapeUniversal(html);
			return res.send(output);
		}

		if (urlObj.hostname === 'en.wikipedia.org') {
			const output = scrapeWikipedia(html);
			return res.send(output);
		}
		const output = await scrapeSubstack(html);
		res.send(output);
	} catch (error) {
		console.error('Error fetching the URL:', error);
		res.status(500).send({
			error: 'Error fetching the URL',
		});
	}
};
