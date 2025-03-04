import { readFile } from 'node:fs/promises';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { isScraper, renderHtml } from './metaTags';
import { downloadArticle } from './routes/download-article';
import { downloadComments } from './routes/download-comments';
import { downloadNote } from './routes/download-note';
import { imageProxy } from './routes/image-proxy';
import { scrapeSubstackMeta } from './scrapers/substack';

const app = new Hono();

// Send index.html for all other routes
app.notFound(async (c) => {
	const file = await readFile('./dist/index.html');
	return c.html(file.toString());
});

// Serve static files
app.get('*', serveStatic({ root: './dist' }));

// Routes
app.on('GET', ['/download-article', '/download-article/'], downloadArticle);
app.on('GET', ['/download-note', '/download-note/'], downloadNote);
app.on('GET', ['/image-proxy', '/image-proxy/'], imageProxy);
app.on('GET', ['/download-comments', '/download-comments/'], downloadComments);

// Meta tags for article
app.get('/article/*', async (c) => {
	const userAgent = c.req.header('User-Agent');

	if (userAgent && isScraper(userAgent)) {
		let url = '';

		if (Array.isArray(c.req.query('url'))) {
			url = c.req.query('url')?.[0] ?? '';
		} else {
			url = c.req.query('url') ?? '';
		}

		if (url) {
			const response = await fetch(url);
			const html = await response.text();
			const output = scrapeSubstackMeta(html);
			return c.html(
				renderHtml({
					title: `${output.title} | ${output.author}`,
					siteName: 'Substack Offline',
					description: output.subtitle,
					image: output.image,
				})
			);
		}
	}

	const file = await readFile('./dist/index.html');
	return c.html(file.toString());
});

const port = Number(process.env.PORT) || 3000;
serve(
	{
		port,
		hostname: '0.0.0.0',
		fetch: app.fetch,
	},
	() => {
		console.log('Server started on port', port);
	}
);
