import { load } from 'cheerio';

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

	// Second parse: Convert the string into an actual JSON object

	function parseComments(comments) {
		return comments.map((c) => {
			return {
				name: c.name,
				photo_url: c.photo_url,
				handle: c.handle,
				body: c.body,
				children: parseComments(c.children || []),
			};
		});
	}

	return parseComments(JSON.parse(jsonString).initialComments);
}
