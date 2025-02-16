import { load } from 'cheerio';
import { htmlToMarkdown } from '../turndown';
import { getOGTag } from '../utils';

import type { FastifyReply, FastifyRequest } from 'fastify';

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
		const markdown = htmlToMarkdown(article);

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
};
