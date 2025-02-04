import Fastify from 'fastify';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import fastifyStatic from '@fastify/static';
import { load, type CheerioAPI } from 'cheerio';
import parseSrcset from 'parse-srcset';

const app = Fastify();

const nhm = new NodeHtmlMarkdown(
	{
		codeBlockStyle: 'fenced',
	},
	{
		figcaption: {
			postprocess: (ctx) => {
				const content = ctx.content;
				return `<figcaption>${content}</figcaption>`;
			},
			// ‹div data-component-name="Twitter2ToDOM"

			recurse: true,
			noEscape: true,
		},
	}
);

function getOGTag(tag: string, cheerioDOM: CheerioAPI) {
	return cheerioDOM(`meta[property="og:${tag}"]`).attr('content');
}

app.register(fastifyStatic, {
	root: process.cwd() + '/dist',
	index: 'index.html',
});

app.get('/download-article', async (req, res) => {
	const url = (req.query as { url?: string }).url;

	if (!url) {
		return res.status(400).send('URL parameter is required');
	}

	try {
		const response = await fetch(url);
		const html = await response.text();

		const dom = load(html);

		// Remove subscription widget
		dom('.subscription-widget').remove();

		// Remove links from images
		dom('.is-viewable-img').each((_index, element) => {
			dom(element).removeAttr('href');
		});

		const article = dom.html(dom('.available-content'));
		const markdown = nhm.translate(article);

		const srcSet = dom('.post-header .pencraft img').first().attr('srcset');
		let authorImg = '';

		if (!srcSet) {
			throw new Error('Failed to find srcset');
		} else {
			const parsed = parseSrcset(srcSet);
			if (!parsed) {
				throw new Error('Failed to parse srcset');
			}
			authorImg = parsed[2].url;
		}

		res.send({
			url: getOGTag('url', dom),
			title: getOGTag('title', dom),
			subtitle: getOGTag('description', dom),
			author: dom('meta[name="author"]').attr('content'),
			authorImg,
			image: getOGTag('image', dom),
			markdown: markdown,
		});
	} catch (error) {
		console.error('Error fetching the URL:', error);
		res.status(500).send('Error fetching the URL');
	}
});

const port = parseInt(process.env.PORT ?? '') || 3000;

app.listen({ port: port }, (err) => {
	if (err) throw err;
});
