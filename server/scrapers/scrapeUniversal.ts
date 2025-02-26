import { extract } from '@extractus/article-extractor';
import { htmlToMarkdown } from '../turndown';

export async function scrapeUniversal(html: string) {
	const article = await extract(html);

	return {
		url: article?.url,
		title: article?.title,
		subtitle: article?.description,
		author: article?.author || article?.source,
		authorUrl: `https://${article?.source}`,
		authorImg: article?.favicon,
		image: article?.image,
		markdown: htmlToMarkdown(article?.content ?? ''),
	};
}
