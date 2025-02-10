export type Article = {
	url: string;
	title: string;
	subtitle: string;
	author: string;
	authorImg: string;
	image: string;
	markdown: string;
};

export type ArticleSaved = Article & {
	timestamp: number;
	imagesSaved: string[];
	archived: boolean;
};
