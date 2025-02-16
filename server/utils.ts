import type { CheerioAPI } from 'cheerio';

export function getOGTag(tag: string, cheerioDOM: CheerioAPI) {
	return cheerioDOM(`meta[property="og:${tag}"]`).attr('content');
}
