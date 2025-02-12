import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { load, type CheerioAPI } from 'cheerio';
import TurndownService from 'turndown';

const app = Fastify();
const turndownService = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
});

// Display figcaption as HTML
turndownService.addRule('figcaption', {
	filter(node) {
		return (
			node.nodeName === 'FIGCAPTION' || node.classList.contains('image-caption')
		);
	},
	replacement: (_content, node) => {
		const innerHTML = (node as HTMLElement).innerHTML;
		const captionContent = turndownService.turndown(innerHTML);

		return `<figcaption>\n\n${captionContent}\n\n</figcaption>`;
	},
});

// Display footnote links correctly
turndownService.addRule('footnoteAnchor', {
	filter(node) {
		return node.nodeName === 'A' && node.classList.contains('footnote-anchor');
	},
	replacement: (_content, node) => {
		const number = node.textContent;
		return `<sup><a class="footnote-link" id="footnote-reference-${number}" href="#footnote-${number}">${number}</a></sup>`;
	},
});

// Display footnotes correctly
turndownService.addRule('footnoteDiv', {
	filter(node) {
		return node.nodeName === 'DIV' && node.classList.contains('footnote');
	},
	replacement: (_content, node) => {
		const number = node.querySelector('.footnote-number')?.textContent;
		const innerHTML = node.querySelector('.footnote-content')?.innerHTML;
		const footnoteContent = turndownService.turndown(innerHTML ?? '');

		return `<div><a href="#footnote-reference-${number}" class="footnote-number" id="footnote-${number}">${number}</a><p class="footnote-content">\n\n${footnoteContent}\n\n</p></div>`;
	},
});

function getOGTag(tag: string, cheerioDOM: CheerioAPI) {
	return cheerioDOM(`meta[property="og:${tag}"]`).attr('content');
}

app.register(fastifyStatic, {
	root: process.cwd() + '/dist',
	index: 'index.html',
});

app.setNotFoundHandler((_request, reply) => {
	reply.sendFile('index.html');
});

app.get('/download-article', async (req, res) => {
	const url = (req.query as { url?: string }).url;

	if (!url) {
		return res.status(400).send('URL parameter is required');
	}

	const urlObj = new URL(url);
	urlObj.search = '';

	try {
		const response = await fetch(urlObj.toString());
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
		dom('.poll-embed').remove();
		dom('audio').remove();

		// Remove links from images
		dom('.is-viewable-img').each((_index, element) => {
			dom(element).removeAttr('href');
		});

		dom('.image-link').each((_index, element) => {
			// replace .image-link with it's child
			const child = dom(element).children().first();
			dom(element).replaceWith(child);
		});

		dom('img').each((_index, element) => {
			const title = dom(element).attr('title');
			const alt = dom(element).attr('alt');

			if (title) {
				dom(element).attr('title', title.replace(/"/g, '\\"'));
			}
			if (alt) {
				dom(element).attr('alt', alt.replace(/"/g, '\\"'));
			}
		});

		dom('li').each((_index, element) => {
			// Remove the p child of li and put it as li's child
			const p = dom(element).find('p').first();

			const pContent = p.contents();
			p.replaceWith(pContent);
		});

		const article = dom.html(dom('.available-content'));
		const markdown = turndownService.turndown(article);

		let authorImg = dom('.post-header img:not(.share-dialog img)')
			.first()
			.attr('src');

		if (!authorImg) {
			authorImg = dom('.navbar-logo').attr('src');
		}
		if (!authorImg) {
			authorImg = dom('.byline-wrapper img').first().attr('src');
		}
		if (!authorImg) {
			authorImg = dom('[rel="shortcut icon"]').attr('href');
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

	const urlObj = new URL(url);
	if (
		urlObj.hostname !== 'substackcdn.com' &&
		urlObj.hostname !== 'images.unsplash.com'
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
});

const port = parseInt(process.env.PORT || '3000', 10);

console.log('Listening on port', port);

app.listen({ port: port, host: '0.0.0.0' }, (err) => {
	if (err) throw err;
});
