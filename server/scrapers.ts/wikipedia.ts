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
	'.printfooter',
	'.reference',
	'div.mw-heading:has(#References)',
	'div.mw-heading:has(#Citations)',
	'div.mw-heading:has(#Notes)',
	'div.mw-heading:has(#External_links)',
	'.navbox',
	'.metadata',
	'.hatnote',
	'.side-box',
	'.sidebar',
	'.infobox',
	'table',
	'.ext-phonos',
];

export function scrapeWikipedia(html: string) {
	const dom = load(html);

	const article = dom('#mw-content-text');
	let subtitle = article
		.find('#mw-content-text > div > p:not(.mw-empty-elt)')
		.first()
		.text();

	// Remove all citations
	subtitle = RegExp(/[^.]*\./).exec(subtitle)?.[0] ?? '';
	if (subtitle.length > 180) {
		subtitle = `${subtitle.substring(0, 180)}...`;
	}

	selectorsToRemove.forEach((selector) => {
		article.find(selector).remove();
	});

	const markdown = htmlToMarkdown(article.html() ?? '');

	return {
		url: dom('link[rel="canonical"]').attr('href'),
		title: dom('title').text().replaceAll(' - Wikipedia', ''),
		subtitle,
		author: 'Wikipedia',
		authorImg: 'https://www.wikipedia.org/static/favicon/wikipedia.ico',
		image: getOGTag('image', dom),
		markdown: markdown,
	};
}
