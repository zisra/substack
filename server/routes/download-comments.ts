import type { FastifyReply, FastifyRequest } from 'fastify';
import { scrapeComments } from '../scrapers/comments';

interface Query {
    url?: string;
}

export const downloadComments = async (
    req: FastifyRequest<{ Querystring: Query }>,
    res: FastifyReply
) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    try {
        const output = await scrapeComments(url);

        res.send(output);
    } catch (error) {
        console.error('Error fetching the URL:', error);
        res.status(500).send({
            error: 'Error fetching the URL',
        });
    }
};
