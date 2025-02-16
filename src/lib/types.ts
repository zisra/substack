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

export type Note = {
	url: string;
	author: string;
	authorImg: string;
	markdown: string;
};
