import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import { Article } from '@/lib/types';

export interface DatabaseType extends DBSchema {
	articles: {
		key: string;
		value: Article & { timestamp: number };
	};
	images: {
		key: string;
		value: {
			url: string;
			blob: Blob;
		};
	};
}

/* async function saveUrl(db: IDBPDatabase<DatabaseType>, url: string) {
	const imageTx = db.transaction('images', 'readwrite');
	const imageStore = imageTx.objectStore('images');

	const imageResponse = await fetch(
		`/image-proxy?url=${encodeURIComponent(url)}`
	);
	const imageBlob = await imageResponse.blob();
	await imageStore.put({ url: url, blob: imageBlob });
} */

export class Database {
	db?: IDBPDatabase<DatabaseType>;

	async open() {
		this.db = await openDB<DatabaseType>('Articles', 1, {
			upgrade(db) {
				db.createObjectStore('articles', {
					keyPath: 'url',
				});
				db.createObjectStore('images', {
					keyPath: 'url',
				});
			},
		});
	}

	async saveArticle(article: Article) {
		if (!this.db) await this.open();

		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readwrite');
		const store = tx.objectStore('articles');

		const dbArticle = {
			...article,
			timestamp: Date.now(),
		};

		const existingArticle = await store.get(article.url);

		if (existingArticle) {
			await store.put(dbArticle);
		} else {
			await store.add(dbArticle);
		}

		/* const imagePromises = [
			saveUrl(this.db, article.authorImg),
			saveUrl(this.db, article.image),
		];

		await Promise.all(imagePromises); */

		await tx.done;
	}

	async getArticles() {
		if (!this.db) return [];
		const tx = this.db.transaction('articles', 'readonly');
		const store = tx.objectStore('articles');
		const articles = await store.getAll();

		return articles.sort((a, b) => b.timestamp - a.timestamp);
	}

	async getArticle(url: string) {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readonly');
		const store = tx.objectStore('articles');
		return store.get(url);
	}

	async deleteArticle(url: string) {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readwrite');
		const store = tx.objectStore('articles');
		return store.delete(url);
	}
}
