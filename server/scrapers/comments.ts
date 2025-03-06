import { load } from 'cheerio';
import { getOGTag } from '../utils';

export async function scrapeComments(url: string) {
	const apiUrl = `${url}/comments`;

	const res = await fetch(apiUrl);
	const html = await res.text();
	const dom = load(html);

	// Find the script tag containing 'window._preloads'
	const script = dom('script').filter((_, el) => {
		const text = dom(el).html();
		return (
			(text?.includes('window._preloads') && text?.includes('JSON.parse')) ||
			false
		);
	});

	const scriptText = script.html();
	if (!scriptText) return {};

	// Extract the JSON string inside JSON.parse("...")
	const jsonEscaped = scriptText.match(/JSON\.parse\("(.+)"/)?.[1];

	if (!jsonEscaped) return {};

	// First parse: Convert the escaped JSON string into a regular string
	const jsonString = JSON.parse(`"${jsonEscaped}"`);

	const title = getOGTag('title', dom);
	const subtitle = getOGTag('description', dom);
	const author = dom('meta[name="author"]').attr('content') ?? '';
	const authorUrl = dom('.post-header .profile-hover-card-target > a').attr(
		'href'
	);

	function parseComments(comments) {
		return comments.map((c) => {
			return {
				name: c.name,
				photo_url: c.photo_url,
				handle: c.handle,
				body: c.body?.trim(),
				children: parseComments(c.children || []),
			};
		});
	}

	return {
		title,
		subtitle,
		author,
		authorUrl,
		comments: parseComments(JSON.parse(jsonString).initialComments),
	};
}
