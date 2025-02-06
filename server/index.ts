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
				return `<figcaption>\n\n${content}\n\n</figcaption>`;
			},

			recurse: true,
			noEscape: true,
		},
		div: {
			postprocess: (ctx) => {
				if (ctx.node.classList.contains('footnote')) {
					const number =
						ctx.node.querySelector('.footnote-number')?.textContent;
					const content =
						ctx.node.querySelector('.footnote-content')?.innerHTML;

					return `<div><b class="footnote-number" id="footnote-${number}">${number}</b><p class="footnote-content">${content}</p></div>`;
				} else {
					return ctx.content;
				}
			},

			recurse: true,
			noEscape: true,
		},
		a: {
			postprocess: (ctx) => {
				if (ctx.node.classList.contains('footnote-anchor')) {
					const number = ctx.node.textContent;
					return `<sup><a href="#footnote-${number}">${number}</a></sup>`;
				} else {
					return ctx.node.outerHTML;
				}
			},

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

app.setNotFoundHandler((request, reply) => {
	reply.sendFile('index.html');
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

		// Remove unnecessary elements
		dom('.subscription-widget').remove();
		dom('[data-component-name="ButtonCreateButton"]').remove();
		dom('[data-component-name="AudioEmbedPlayer"]').remove();
		dom('[data-component-name="SubscribeWidget"]').remove();
		dom('[data-component-name="DigestPostEmbed"]').remove();
		dom(
			'[data-component-name="EmbeddedPublicationToDOMWithSubscribe"]'
		).remove();
		dom('.embedded-post-wrap').remove();
		dom('.image-link-expand').remove();
		dom('audio').remove();

		// Remove links from images
		dom('.is-viewable-img').each((_index, element) => {
			dom(element).removeAttr('href');
		});

		const article = dom.html(dom('.available-content'));
		const markdown = nhm.translate(article);

		res.send({
			url: getOGTag('url', dom),
			title: getOGTag('title', dom),
			subtitle: getOGTag('description', dom),
			author: dom('meta[name="author"]').attr('content'),
			authorImg: dom('[rel="shortcut icon"]').attr('href'),
			image: getOGTag('image', dom),
			markdown: markdown,
		});
	} catch (error) {
		console.error('Error fetching the URL:', error);
		res.status(500).send({
			error: 'Error fetching the URL',
		});
	}
});

app.get('/image-proxy', async (req, res) => {
	const url = (req.query as { url?: string }).url;

	if (!url) {
		return res.status(400).send('URL parameter is required');
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
});

const port = parseInt(process.env.PORT ?? '3000');

app.listen({ port: port }, (err) => {
	if (err) throw err;
});
