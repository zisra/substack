import type { Article, ArticleSaved, Settings } from '@/lib/types';
import { HtmlRenderer, Parser } from 'commonmark';
import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

export interface DatabaseType extends DBSchema {
	articles: {
		key: string;
		value: ArticleSaved;
	};
	images: {
		key: string;
		value: {
			url: string;
			blob: Blob;
		};
	};
	settings: {
		key: number;
		value: Settings;
	};
}

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
				db.createObjectStore('settings', {
					keyPath: 'version',
				});
			},
		});
	}

	async saveArticle(article: Article) {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readwrite');
		const store = tx.objectStore('articles');

		const reader = new Parser();
		const writer = new HtmlRenderer();
		const parsed = reader.parse(article?.markdown ?? '');

		const result = writer.render(parsed);
		const parser = new DOMParser();
		const doc = parser.parseFromString(result, 'text/html');
		const images = doc.querySelectorAll('img');

		const dbArticle = {
			...article,
			timestamp: Date.now(),
			imagesSaved: [article.authorImg, article.image, ...[...images].map((img) => img.src)],
			archived: false,
		};

		const existingArticle = await store.get(article.url);

		if (existingArticle) {
			await store.put(dbArticle);
		} else {
			await store.add(dbArticle);
		}

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then((registration) => {
				registration.active?.postMessage({
					type: 'CACHE_IMAGE',
					url: dbArticle.image,
				});

				registration.active?.postMessage({
					type: 'CACHE_IMAGE',
					url: dbArticle.authorImg,
				});

				for (const image of images) {
					registration.active?.postMessage({
						type: 'CACHE_IMAGE',
						url: image.src,
					});
				}
			});
		}

		return dbArticle;
	}

	async getArticles() {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readonly');
		const store = tx.objectStore('articles');
		const articles = await store.getAll();

		return articles
			.sort((a, b) => b.timestamp - a.timestamp)
			.filter((article) => !article.archived);
	}

	async getArchivedArticles() {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readonly');
		const store = tx.objectStore('articles');
		const articles = await store.getAll();

		return articles.sort((a, b) => b.timestamp - a.timestamp).filter((article) => article.archived);
	}

	async getArticle(url: string) {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readonly');
		const store = tx.objectStore('articles');
		return store.get(url);
	}

	async archiveArticle(url: string) {
		if (!this.db) return;
		const settings = await this.getSettings();

		const tx = this.db.transaction('articles', 'readwrite');
		const store = tx.objectStore('articles');
		const article = await store.get(url);

		if (article && settings?.saveArchivedContent === false) {
			article.archived = true;
			article.markdown = false;

			const image = article.image;
			const authorImg = article.authorImg;

			article.imagesSaved
				.filter((i) => i !== image && i !== authorImg)
				.forEach((image) => this.deleteImage(image));

			await store.put(article);
		} else if (article) {
			article.archived = true;
			await store.put(article);
			return tx.done;
		}
	}

	async unArchiveArticle(url: string) {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readwrite');
		const store = tx.objectStore('articles');
		const article = await store.get(url);

		if (article) {
			if (article.markdown === false) {
				const response = await fetch(`/download-article?url=${encodeURIComponent(url)}`);

				if (!response.ok) {
					throw new Error('Failed to download article');
				}

				const data: Article = await response.json();
				this.saveArticle(data);
			} else {
				article.archived = false;
				await store.put(article);
			}
		}

		return tx.done;
	}

	async deleteArticle(url: string) {
		if (!this.db) return;
		const tx = this.db.transaction('articles', 'readwrite');
		const store = tx.objectStore('articles');
		const article = await store.get(url);

		if ('serviceWorker' in navigator) {
			if (article?.imagesSaved) {
				for (const image of article.imagesSaved) {
					navigator.serviceWorker.ready.then((registration) => {
						registration.active?.postMessage({
							type: 'DELETE_IMAGES',
							url: image,
						});
					});
				}
			}
		}

		return store.delete(url);
	}

	async getImage(url: string) {
		if (!this.db) return;
		const tx = this.db.transaction('images', 'readonly');
		const store = tx.objectStore('images');
		return store.get(url);
	}

	async deleteImage(url: string) {
		if (!this.db) return;
		const tx = this.db.transaction('images', 'readwrite');
		const store = tx.objectStore('images');
		return store.delete(url);
	}

	async saveImage(url: string) {
		if (!this.db) return;

		const imageResponse = await fetch(`/image-proxy?url=${encodeURIComponent(url)}`);
		const imageBlob = await imageResponse.blob();

		const imageTx = this.db.transaction('images', 'readwrite');
		const imageStore = imageTx.objectStore('images');
		await imageStore.put({ url, blob: imageBlob });
		await imageTx.done;
	}

	async getSettings() {
		if (!this.db) return;
		const tx = this.db.transaction('settings', 'readonly');
		const store = tx.objectStore('settings');
		return store.get(1);
	}

	async saveSettings(settings: Settings) {
		if (!this.db) return;
		const tx = this.db.transaction('settings', 'readwrite');
		const store = tx.objectStore('settings');
		await store.put(settings);
	}

	async clearAll() {
		if (!this.db) return;
		const tx = this.db.transaction(['articles', 'images', 'settings'], 'readwrite');
		const articlesStore = tx.objectStore('articles');
		const imagesStore = tx.objectStore('images');
		const settingsStore = tx.objectStore('settings');

		await articlesStore.clear();
		await imagesStore.clear();
		await settingsStore.clear();
	}
}
