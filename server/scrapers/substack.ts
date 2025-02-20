import { load } from 'cheerio';
import he from 'he';
import { htmlToMarkdown } from '../turndown';
import { getOGTag } from '../utils';

const selectorsToRemove = [
	'.subscription-widget',
	'[data-component-name="ButtonCreateButton"]',
	'[data-component-name="AudioEmbedPlayer"]',
	'[data-component-name="SubscribeWidget"]',
	'[data-component-name="DigestPostEmbed"]',
	'[data-component-name="EmbeddedPublicationToDOMWithSubscribe"]',
	'.embedded-post-wrap',
	'.image-link-expand',
	'.poll-embed',
	'audio',
];

export function scrapeSubstack(html: string) {
	const dom = load(html, {
		xml: {
			decodeEntities: false,
		},
	});

	// Remove unnecessary elements
	selectorsToRemove.forEach((selector) => {
		dom(selector).remove();
	});

	// Remove links from images
	dom('.is-viewable-img').each((_index, element) => {
		dom(element).removeAttr('href');
	});

	// Replace element with it's child
	dom('.image-link').each((_index, element) => {
		const child = dom(element).children().first();
		dom(element).replaceWith(child);
	});

	// Replace element with it's child
	dom('.available-content .profile-hover-card-target').each(
		(_index, element) => {
			const innerHtml = dom(element).html();
			dom(element).replaceWith(`<span>${innerHtml}</span>`);
		}
	);

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
		const p = dom(element).find('p').first();

		const pContent = p.contents();
		p.replaceWith(pContent);
	});

	const article = dom.html(dom('.available-content'));
	const markdown = htmlToMarkdown(he.decode(article));

	let authorImg = dom('.post-header img:not(.share-dialog img)')
		.first()
		.attr('src');

	let authorUrl = dom('.post-header .profile-hover-card-target > a').attr(
		'href'
	);

	if (!authorUrl) {
		const url = new URL(getOGTag('url', dom) ?? '');
		url.pathname = url.pathname = '/';
		authorUrl = url.href;
	}

	if (!authorImg) {
		authorImg = dom('.navbar-logo').attr('src');
	}
	if (!authorImg) {
		authorImg = dom('.byline-wrapper img').first().attr('src');
	}
	if (!authorImg) {
		authorImg = dom('[rel="shortcut icon"]').attr('href');
	}

	return {
		url: getOGTag('url', dom),
		title: getOGTag('title', dom),
		subtitle: getOGTag('description', dom),
		author: he.decode(dom('meta[name="author"]').attr('content') ?? ''),
		authorUrl: authorUrl,
		authorImg: he.decode(authorImg ?? ''),
		image: getOGTag('image', dom),
		markdown: markdown,
	};
}
