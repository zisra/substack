import type { FastifyReply, FastifyRequest } from 'fastify';

// using fastify

interface Query {
	url?: string;
}

export const imageProxy = async (
	req: FastifyRequest<{ Querystring: Query }>,
	res: FastifyReply
) => {
	const url = req.query.url;

	if (!url) {
		return res.status(400).send('URL parameter is required');
	}

	const urlObj = new URL(url);
	if (
		urlObj.hostname !== 'substackcdn.com' &&
		urlObj.hostname !== 'images.unsplash.com' &&
		!urlObj.hostname.endsWith('wikimedia.org')
	) {
		return res.status(400).send('Only images from Substack are allowed');
	}

	try {
		const response = await fetch(url);
		const buffer = Buffer.from(await response.arrayBuffer());

		res.header(
			'Content-Type',
			response.headers.get('content-type') ?? 'image/jpeg'
		);

		res.send(buffer);
	} catch (error) {
		console.error('Error fetching the image:', error);
		res.status(500).send({
			error: 'Error fetching the image',
		});
	}
};
