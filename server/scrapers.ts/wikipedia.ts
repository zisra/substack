import { load } from 'cheerio';
import { htmlToMarkdown } from '../turndown';
import { getOGTag } from '../utils';

export function scrapeWikipedia(html: string) {
	const dom = load(html);
	dom('style').each((_index, element) => {
		dom(element).remove();
	});

	dom('.mw-editsection').each((_index, element) => {
		dom(element).remove();
	});

	dom('div.mw-heading:has(#References)').remove();
	dom('.reflist').remove();
	dom('.mw-editsection').remove();
	dom('.printfooter').remove();
	dom('.reference').remove();
	dom('.noprint').remove();
	dom('.navbox').remove();
	dom('.metadata').remove();
	dom('.hatnote').remove();
	dom('.side-box').remove();

	const article = dom.html(dom('#mw-content-text'));
	const markdown = htmlToMarkdown(article);

	return {
		url: dom('link[rel="canonical"]').attr('href'),
		title: dom('title').text(),
		subtitle: 'Subtitle',
		author: 'Wikipedia',
		authorImg: 'https://www.wikipedia.org/static/favicon/wikipedia.ico',
		image: getOGTag('image', dom),
		markdown: markdown,
	};
}
