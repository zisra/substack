import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyRequest } from 'fastify';
import { isScraper, renderHtml } from './metaTags';
import { downloadArticle } from './routes/download-article';
import { downloadComments } from './routes/download-comments';
import { downloadNote } from './routes/download-note';
import { imageProxy } from './routes/image-proxy';
import { scrapeSubstackMeta } from './scrapers/substack';

const app = Fastify();

app.register(fastifyStatic, {
	root: `${process.cwd()}/dist`,
	index: 'index.html',
});

app.setNotFoundHandler(
	async (
		req: FastifyRequest<{
			Headers: {
				'user-agent': string;
			};
			Querystring: {
				url: string;
			};
		}>,
		res
	) => {
		if (isScraper(req)) {
			const path = req.url;

			if (path.startsWith('/article')) {
				const url = req.query.url;
				console.log(url, '+', req.query, '+', req.url);

				if (url) {
					const response = await fetch(url);
					const html = await response.text();
					const output = scrapeSubstackMeta(html);
					res.send(
						renderHtml({
							title: `${output.title} | ${output.author}`,
							siteName: 'Substack Offline',
							description: output.subtitle,
							image: output.image,
						})
					);
				} else {
					res.sendFile('index.html');
				}
			} else {
				res.sendFile('index.html');
			}
		} else {
			res.sendFile('index.html');
		}
	}
);

app.setErrorHandler((error, _req, res) => {
	console.error ? console.error(error) : console.log(error);
	res.status(500).send({ error: 'Something went wrong' });
});

// Routes
app.get('/download-article', downloadArticle);
app.get('/download-note', downloadNote);
app.get('/image-proxy', imageProxy);
app.get('/download-comments', downloadComments);

const port = Number.parseInt(process.env.PORT || '3000', 10);

console.log('Listening on port', port);

app.listen({ port: port, host: '0.0.0.0' }, (err) => {
	if (err) throw err;
});
