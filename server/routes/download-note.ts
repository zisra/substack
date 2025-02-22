import type { FastifyReply, FastifyRequest } from 'fastify';
import { scrapeSubstackNote } from '../scrapers/substackNote';

interface Query {
	url?: string;
}

export const downloadNote = async (
	req: FastifyRequest<{ Querystring: Query }>,
	res: FastifyReply
) => {
	const url = req.query.url;

	if (!url) {
		return res.status(400).send('URL parameter is required');
	}

	try {
		const output = await scrapeSubstackNote(url);

		res.send(output);
	} catch (error) {
		console.error('Error fetching the URL:', error);
		res.status(500).send({
			error: 'Error fetching the URL',
		});
	}
};
