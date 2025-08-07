import { load } from 'cheerio';
import { htmlToMarkdown } from '../turndown';
import { getOGTag } from '../utils';

const selectorsToRemove = [
	'#mw-navigation',
	'.noprint',
	'.mw-jump-link',
	'.mw-portlet-lang',
	'.toc.tocnumber',
	'.vector-page-toolbar',
	'.vector-header-start > *:not(.mw-logo)',
	'.vector-header-end',
	'#mw-panel-toc',
	'#vector-sticky-header',
	'#p-lang-btn',
	'.vector-menu-checkbox',
	'nav',
	'#vector-page-titlebar-toc',
	'#footer',
	'.mw-cite-backlink',
	'.magnify',
	'.mw-hidden-catlinks',
	'.catlinks',
	'.mw-editsection',
	'.mw-editsection-like',
	'.mw-indicators',
	'#siteNotice',
	'.usermessage',
	'style',
	'.noviewer',
	'.reflist',
	'.references',
	'.printfooter',
	'.reference',
	'div.mw-heading:has(#References)',
	'div.mw-heading:has(#Citations)',
	'div.mw-heading:has(#Notes)',
	'div.mw-heading:has(#External_links)',
	'div.mw-heading:has(#Explanatory_notes)',
	'.navbox',
	'.metadata',
	'.hatnote',
	'.side-box',
	'.sidebar',
	'.infobox',
	'.ext-phonos',
	'.floatright',
	'.legend',
	'span[typeof="mw:File"]',
	'.geo-inline-hidden',
	'.mw-valign-text-top',
	'noscript',
];

export function scrapeWikipedia(html: string) {
	const dom = load(html);

	const article = dom('#mw-content-text');
	const subtitleElement = article
		.find('#mw-content-text > div > p:not(.mw-empty-elt)')
		.first();

	subtitleElement.find('style[data-mw-deduplicate]').each((_index, element) => {
		dom(element).remove();
	});

	let subtitle = subtitleElement.text();

	// Remove all citations
	subtitle = subtitle
		.replace(RegExp(/\[[^\]]*\]/, 'g'), '')
		.replaceAll('ⓘ', '');
	if (subtitle.length > 180) {
		subtitle = `${subtitle.substring(0, 180)}…`;
	}

	selectorsToRemove.forEach((selector) => {
		article.find(selector).each((_index, element) => {
			dom(element).remove();
		});
	});

	const markdown = htmlToMarkdown(article.html() ?? '');

	return {
		url: dom('link[rel="canonical"]').attr('href'),
		title: dom('title').text().replaceAll(' - Wikipedia', ''),
		subtitle,
		author: 'Wikipedia',
		authorUrl: 'https://www.wikipedia.org/',
		authorImg: 'https://www.wikipedia.org/static/favicon/wikipedia.ico',
		image: getOGTag('image', dom),
		markdown: markdown,
	};
}
