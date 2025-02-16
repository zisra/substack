import { load } from 'cheerio';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { htmlToMarkdown } from '../turndown';
import { getOGTag } from '../utils';

// using fastify

interface Query {
	url?: string;
}

type Embed =
	| {
			type: 'quote';
			url: string;
			content: string;
			author: string;
	  }
	| {
			type: 'article';
			url: string;
			title: string;
			image: string;
			author: string;
			authorImg: string;
	  }
	| null;

export const downloadNote = async (
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

		const article = dom.html(
			dom(
				'.pencraft.pc-display-flex.pc-flexDirection-column.pc-gap-12.pc-reset.feedPermalinkUnit-JBJrHa > div:nth-child(2)'
			)
		);

		const markdown = htmlToMarkdown(dom(article).html() ?? '');

		let authorImg = dom(
			'#reader-nav-page-scroll > div > div > div > div > div > div > div > div > div > a > div > div > div > picture'
		)
			.children()
			.eq(1)
			.attr('src');

		if (!authorImg) {
			authorImg = dom('[rel="shortcut icon"]').attr('href');
		}

		const authorName = dom(
			'#reader-nav-page-scroll > div > div > div > div > div > div > div > div > div > div > div:nth-child(1) > span > div > span > a'
		).text();

		const embedHtml = dom(
			'.pencraft.pc-display-flex.pc-flexDirection-column.pc-gap-12.pc-reset.feedPermalinkUnit-JBJrHa'
		);

		let embed: Embed = null;
		const isQuote = embedHtml
			.find('svg')
			.html()
			?.includes(
				'M17.4385 1.2681C19.3988 0.456149 21.6012 0.45615 23.5615 1.2681L31.5807 4.58976C33.5409 5.40172 35.0983'
			);
		const isArticle = embedHtml.find('a.postAttachment-eYV3fM').length > 0;

		if (isQuote) {
			const url = embedHtml
				.find('div.pencraft.pc-display-flex > a')
				.eq(1)
				.attr('href');
			const content = embedHtml
				.find('.pencraft > a > div > .pencraft > div')
				.eq(1)
				.text();
			const author = embedHtml
				.find('.pencraft > a > div > .pencraft > div')
				.eq(2)
				.text();

			embed = {
				type: 'quote',
				url: url ?? '',
				content,
				author,
			};
		} else if (isArticle) {
			const articleEmbedIndicator = 'eYV3fM';
			const url = embedHtml
				.find(`a.postAttachment-${articleEmbedIndicator}`)
				.attr('href');
			const image = embedHtml
				.find('a.postAttachment-eYV3fM img')
				.attr('srcset');
			const author = embedHtml
				.find('div.pencraft > div > div.pencraft > div a:nth-child(2)')
				.text();
			const title = embedHtml
				.find(
					`div:has(a.postAttachment-${articleEmbedIndicator}) > div:nth-child(3)`
				)
				.text();
			const authorImg = embedHtml
				.find('div.pencraft > div > div.pencraft > a img')
				.attr('src');

			embed = {
				type: 'article',
				url: url ?? '',
				title,
				image: image ?? '',
				author,
				authorImg: authorImg ?? '',
			};
		}

		res.send({
			url: getOGTag('url', dom),
			author: authorName,
			authorImg,
			markdown: markdown,
			embed,
			embedHtml: embedHtml.html(),
		});
	} catch (error) {
		console.error('Error fetching the URL:', error);
		res.status(500).send({
			error: 'Error fetching the URL',
		});
	}
};
