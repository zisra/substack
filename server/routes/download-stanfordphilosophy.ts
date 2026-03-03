import { load } from 'cheerio';
import { htmlToMarkdown } from '../turndown';

const selectorsToRemove = [
	'#pubinfo',
	'#toc',
	'#bibliography',
	'#academic-tools',
	'#other-internet-resources',
	'#related-entries',
	'#acknowledgments',
];

export function scrapeStanfordphilosophy(html: string, url: string) {
	const dom = load(html);

	const article = dom('#aueditable');
	const subtitleElement = article.find('#preamble').first();

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
		url,
		title: dom('h1').text().trim(),
		subtitle,
		author: 'Stanford Encyclopedia of Philosophy',
		authorUrl: 'https://plato.stanford.edu/',
		authorImg: 'https://plato.stanford.edu/symbols/sepman-icon.jpg',
		image: '',
		markdown: markdown,
	};
}
