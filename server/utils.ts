import type { CheerioAPI } from 'cheerio';
import he from 'he';

export function getOGTag(tag: string, cheerioDOM: CheerioAPI) {
	const html = cheerioDOM(`meta[property="og:${tag}"]`).attr('content');
	return html ? he.decode(html) : '';
}

export function extractStatusId(twitterUrl: string) {
	const match = twitterUrl.match(/status\/(\d+)/);
	return match ? match[1] : null;
  }