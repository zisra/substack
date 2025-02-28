export type BaseArticle = {
	url: string;
	title: string;
	subtitle: string;
	author: string;
	authorImg: string;
	authorUrl: string;
	image: string;
};

export type Article = BaseArticle & {
	markdown: string;
};

export type ArticleSaved = BaseArticle & {
	timestamp: number;
	imagesSaved: string[];
	archived: boolean;
	markdown: string | boolean;
	scrollLocation: number;
};

export type Settings = {
	saveArchivedContent: boolean;
	version: number;
	scrollArticles: boolean;
	formatting: {
		fontSize: 'sm' | 'base' | 'dynamic' | 'lg' | 'xl';
		fontFamily: 'sans' | 'serif' | 'mono';
		printImages: boolean;
	};
};

type Embed =
	| {
			type: 'image';
			imageUrl: string;
			imageWidth: number;
			imageHeight: number;
			explicit: boolean;
	  }
	| {
			type: 'post';
			post: {
				title: string;
				canonical_url: string;
				cover_image: string;
			};
			postSelection: {
				text: string;
			};
			publication: {
				author_name: string;
				logo_url: string;
				author_photo_url: string;
			};
	  }
	| {
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
	| null;

export type Note = {
	url: string;
	author: string;
	authorImg: string;
	authorUrl: string;
	markdown: string;
	attachments?: Embed[];
};
