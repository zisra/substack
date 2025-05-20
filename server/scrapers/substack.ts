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
	'.hide-text',
];

export function scrapeSubstackMeta(html: string) {
	const dom = load(html, {
		xml: {
			decodeEntities: false,
		},
	});

	const url = getOGTag('url', dom);
	const title = getOGTag('title', dom);
	const subtitle = getOGTag('description', dom);
	const image = getOGTag('image', dom);
	const author = he.decode(dom('meta[name="author"]').attr('content') ?? '');

	return {
		url,
		title,
		subtitle,
		image,
		author,
	};
}

export async function scrapeSubstack(html: string) {
	let loadedThroughApi = false;
	let dom = load(html, {
		xml: {
			decodeEntities: false,
		},
	});

	// Get metadata from the page
	let authorUrl = dom('.post-header .profile-hover-card-target > a').attr(
		'href'
	);
	if (!authorUrl) {
		const url = new URL(getOGTag('url', dom));
		url.pathname = url.pathname = '/';
		authorUrl = url.href;
	}

	let authorImgRaw = dom('.post-header img:not(.share-dialog img)')
		.first()
		.attr('src');
	if (!authorImgRaw) {
		authorImgRaw = dom('.navbar-logo').attr('src');
	}
	if (!authorImgRaw) {
		authorImgRaw = dom('.byline-wrapper img').first().attr('src');
	}
	if (!authorImgRaw) {
		authorImgRaw = dom('[rel="shortcut icon"]').attr('href');
	}

	const url = getOGTag('url', dom);
	const title = getOGTag('title', dom);
	const subtitle = getOGTag('description', dom);
	const image = getOGTag('image', dom);
	let author = he.decode(dom('meta[name="author"]').attr('content') ?? '');
	let authorImg = he.decode(authorImgRaw ?? '');

	// If the URL does not have a separate website, fetch the post through the API
	if (
		url.startsWith('https://substack.com/inbox/post/') ||
		url.startsWith('https://substack.com/home/post/')
	) {
		const postId = getOGTag('url', dom).split('/').pop()?.replace('p-', '');
		if (postId) {
			const newUrl = `https://substack.com/api/v1/posts/by-id/${postId}`;
			const response = await fetch(newUrl);
			const json = await response.json();

			dom = load(json.post.body_html, {
				xml: {
					decodeEntities: false,
				},
			});
			loadedThroughApi = true;

			author = json.publication.author_name;
			authorImg = json.publication.author_photo_url;
			authorUrl = `https://substack.com/@${json.publication.author_name}`;
		}
	}

	// Remove unnecessary elements
	selectorsToRemove.forEach((selector) => {
		dom(selector).each((_index, element) => {
			dom(element).remove();
		});
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
	dom(
		'.available-content .profile-hover-card-target, .available-content [class*="publicationHoverCardTarget-"]'
	).each((_index, element) => {
		const innerHtml = dom(element).html();
		dom(element).replaceWith(`<span>${innerHtml}</span>`);
	});

	// Unescape HTML entities
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

	// Remove paraphs from list items
	dom('li').each((_index, element) => {
		const p = dom(element).find('p').first();

		const pContent = p.contents();
		p.replaceWith(pContent);
	});

	// Markdown to HTML
	let markdown = '';
	if (loadedThroughApi) {
		markdown = htmlToMarkdown(he.decode(dom.html() ?? ''));
	} else {
		markdown = htmlToMarkdown(
			he.decode(dom('.available-content').html() ?? '')
		);
	}

	return {
		url,
		title,
		subtitle,
		author,
		authorUrl,
		authorImg,
		image,
		markdown,
	};
}
