import TurndownService from 'turndown';

const turndownService = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	emDelimiter: '*',
});

// Display figcaption as HTML
turndownService.addRule('figcaption', {
	filter(node) {
		return (
			node.nodeName === 'FIGCAPTION' || node.classList.contains('image-caption')
		);
	},
	replacement: (_content, node) => {
		const innerHTML = (node as HTMLElement).innerHTML;
		const captionContent = turndownService.turndown(innerHTML);

		return `<figcaption aria-hidden="true">\n\n${captionContent}\n\n</figcaption>`;
	},
});

// Display footnote links correctly
turndownService.addRule('footnote-anchor-substack', {
	filter(node) {
		return node.nodeName === 'A' && node.classList.contains('footnote-anchor');
	},
	replacement: (_content, node) => {
		const number = node.textContent;
		return `<sup><a class="footnote-link" id="footnote-reference-${number}" href="#footnote-${number}">${number}</a></sup>`;
	},
});

// Display footnotes correctly
turndownService.addRule('footnote-content-substack', {
	filter(node) {
		return node.nodeName === 'DIV' && node.classList.contains('footnote');
	},
	replacement: (_content, node) => {
		const number = node.querySelector('.footnote-number')?.textContent;
		const innerHTML = node.querySelector('.footnote-content')?.innerHTML;
		const footnoteContent = turndownService.turndown(innerHTML ?? '');

		return `<div><a href="#footnote-reference-${number}" class="footnote-number" id="footnote-${number}">${number}</a><p class="footnote-content">\n\n${footnoteContent}\n\n</p></div>`;
	},
});

// File links
turndownService.addRule('file-links-substack', {
	filter(node) {
		return (
			node.nodeName === 'DIV' && node.classList.contains('file-embed-wrapper')
		);
	},
	replacement: (_content, node) => {
		const name = node.querySelector('.file-embed-details-h1')?.textContent;
		const link = node
			.querySelector('a.file-embed-button')
			?.getAttribute('href');

		return `<div class="center"><a target="_blank" rel="noreferrer" href="${link}">${name}</a></div>`;
	},
});

turndownService.addRule('tweet-substack', {
	filter(node) {
		return node.nodeName === 'DIV' && node.classList.contains('tweet');
	},
	replacement: (_content, node) => {
		const link = node.querySelector('a')?.getAttribute('href');
		const name = node.querySelector('.tweet-author-name')?.textContent;

		return `<div class="center"><a target="_blank" rel="noreferrer" href="${link}">Tweet by ${name}</a></div>`;
	},
});

turndownService.addRule('wikipedia-image', {
	filter(node) {
		return (
			node.nodeName === 'A' && node.classList.contains('mw-file-description')
		);
	},
	replacement: (_content, node) => {
		const innerHTML = (node as HTMLElement).innerHTML;
		const captionContent = turndownService.turndown(innerHTML);

		const link = `https://en.wikipedia.org/${(node as HTMLElement).getAttribute(
			'href'
		)}`;

		return `<a target="_blank" rel="noreferrer" href=${link}>\n\n${captionContent}\n\n</figure>`;
	},
});

turndownService.addRule('iframe', {
	filter(node) {
		return node.nodeName === 'IFRAME';
	},
	replacement: (_content, node) => {
		const link = (node as HTMLElement).getAttribute('src');
		return `<iframe src="${link}" frameborder="0" allowfullscreen></iframe>`;
	},
});

export function htmlToMarkdown(html: string) {
	const markdown = turndownService.turndown(html);

	return markdown;
}
