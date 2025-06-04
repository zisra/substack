import { load } from 'cheerio';
import { getOGTag } from '../utils';

interface CommentInput {
	id: string;
	name: string;
	photo_url: string;
	handle?: string;
	user_slug?: string;
	body?: string;
	children?: CommentInput[];
}

interface CommentProfile {
	id: string;
	name: string;
	photo_url: string;
	handle?: string;
	body?: string;
	children: CommentProfile[];
	incompleteProfile?: boolean;
}

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

	function parseComments(comments: CommentInput[]) {
		return comments.map((c: CommentInput): CommentProfile => {
			const profile: CommentProfile = {
				id: c.id,
				name: c.name,
				photo_url: c.photo_url,
				handle: c.handle,
				body: c.body?.trim(),
				children: parseComments(c.children || []),
			};

			if (!c.handle) {
				profile.handle = c.user_slug;
				(
					profile as typeof profile & {
						incompleteProfile: boolean;
					}
				).incompleteProfile = true;
			}

			return profile;
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
