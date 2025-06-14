import { load } from 'cheerio';
import { htmlToMarkdown } from '../turndown';

interface ImageAttachment {
	type: 'image';
	imageUrl: string;
	imageWidth: number;
	imageHeight: number;
	explicit: boolean;
}

interface PostSelection {
	text: string;
}

interface PostAttachment {
	type: 'post';
	post: {
		title: string;
		canonical_url: string;
		cover_image: string;
	};
	postSelection: PostSelection | null;
	publication: {
		author_name: string;
		logo_url: string;
		author_photo_url: string;
	};
}

interface CommentAttachment {
	type: 'comment';
	trackingParameters: {
		item_entity_key: string;
	};
	comment: {
		user: {
			name: string;
			handle: string;
			photo_url: string;
		};
	};
}

type Attachment = ImageAttachment | PostAttachment | CommentAttachment;

export async function scrapeSubstackNote(url: string) {
	const id = url.split('/').pop()?.replace('c-', '');
	const apiUrl = `https://substack.com/api/v1/reader/comment/${id}`;

	const [data, html] = await Promise.all([
		fetch(apiUrl).then((res) => res.json()),
		fetch(url).then((res) => res.text()),
	]);

	const dom = load(html, {
		xml: {
			decodeEntities: false,
		},
	});

	dom('.profile-hover-card-target').each((_index, element) => {
		const innerHtml = dom(element).html();
		dom(element).replaceWith(`<span>${innerHtml}</span>`);
	});

	dom('li').each((_index, element) => {
		const p = dom(element).find('p').first();

		const pContent = p.contents();
		p.replaceWith(pContent);
	});

	const elements = dom(
		'.pencraft.pc-display-flex.pc-flexDirection-column.pc-gap-12.pc-reset.feedPermalinkUnit-JBJrHa .ProseMirror.FeedProseMirror'
	);

	let authorImg = dom('.reader-nav-page img.pencraft').first().attr('src');

	if (!authorImg) {
		authorImg = dom('[rel="shortcut icon"]').attr('href');
	}

	const markdown = htmlToMarkdown(dom(elements).html() ?? '');
	const item = data.item;

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const attachments: any[] = [];

	if (data?.entity_key) {
		return {
			redirect: `https://substack.com/home/post/${data.entity_key}`,
		};
	}

	(item.comment.attachments as Attachment[]).forEach((a) => {
		if (a.type === 'image') {
			attachments.push({
				type: 'image',
				imageUrl: a.imageUrl,
				imageWidth: a.imageWidth,
				imageHeight: a.imageHeight,
				explicit: a.explicit,
			});
		} else if (a.type === 'post') {
			attachments.push({
				type: 'post',
				post: {
					title: a.post.title,
					canonical_url: a.post.canonical_url,
					cover_image: a.post.cover_image,
				},
				postSelection: a.postSelection
					? {
							text: a.postSelection.text,
					  }
					: null,
				publication: {
					author_name: a.publication.author_name,
					logo_url: a.publication.logo_url,
					author_photo_url: a.publication.author_photo_url,
				},
			});
		} else if (a.type === 'comment') {
			attachments.push({
				type: 'comment',

				trackingParameters: {
					item_entity_key: a.trackingParameters.item_entity_key,
				},
				comment: {
					user: {
						name: a.comment.user.name,
						handle: a.comment.user.handle,
						photo_url: a.comment.user.photo_url,
					},
				},
			});
		}
	});

	return {
		url: `https://substack.com/@${item.comment.handle}/note/c-${item.comment.id}`,
		author: item.comment.name,
		authorImg: authorImg,
		authorUrl: `https://substack.com/@${item.comment.handle}`,
		markdown: markdown,
		attachments: attachments,
	};
}
