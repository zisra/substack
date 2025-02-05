import { type DBSchema } from 'idb';

export type Article = {
	url: string;
	title: string;
	subtitle: string;
	author: string;
	authorImg: string;
	image: string;
	markdown: string;
};
