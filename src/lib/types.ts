export type BaseArticle = {
	url: string;
	title: string;
	subtitle: string;
	author: string;
	authorImg: string;
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
	formatting: {
		fontSize: 'sm' | 'base' | 'dynamic' | 'lg' | 'xl';
		fontFamily: 'sans' | 'serif' | 'mono';
		printImages: boolean;
	};
};

type Embed =
	| {
			type: 'quote';
			url: string;
			content: string;
			author: string;
	  }
	| {
			type: 'article';
			url: string;
			title: string;
			image: string;
			author: string;
			authorImg: string;
	  }
	| null;

export type Note = {
	url: string;
	author: string;
	authorImg: string;
	markdown: string;
	embed?: Embed;
};
