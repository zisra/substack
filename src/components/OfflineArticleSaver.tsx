import { useEffect, useState } from 'react';

import { ArticleList } from '@/components/ArticleList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { ChevronRightIcon, Loader2Icon } from 'lucide-react';
import type { Article, ArticleSaved } from '@/lib/types';
import { Database } from '@/lib/database';
import { checkUrlValid } from '@/lib/utils';
import { OfflineIndicator } from './OfflineIndicator';
import { Link } from 'react-router';

export function OfflineArticleSaver() {
	const [url, setUrl] = useState('');
	const [articles, setArticles] = useState<ArticleSaved[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isOffline, setIsOffline] = useState(!navigator.onLine);

	const db = new Database();

	const handleSave = async () => {
		if (!url) return;

		setIsSaving(true);
		try {
			const response = await fetch(
				`/download-article?url=${encodeURIComponent(url)}`
			);

			if (!response.ok) {
				setUrl('');
				throw new Error('Failed to download article');
			}

			await db.open();

			const data: Article = await response.json();
			await db.saveArticle(data);
			const articles = await db.getArticles();

			if (articles) {
				setArticles(articles);
			}

			setUrl('');
		} catch (error) {
			console.error('Error saving article:', error);
		} finally {
			setIsSaving(false);
		}
	};

	useEffect(() => {
		const loadArticles = async () => {
			await db.open();
			const articles = await db.getArticles();

			if (articles) {
				setArticles(articles);
			} else {
				setArticles([]);
			}
		};

		loadArticles();
	}, []);

	useEffect(() => {
		const handleOffline = () => {
			setIsOffline(!navigator.onLine);
		};

		window.addEventListener('offline', handleOffline);
		window.addEventListener('online', handleOffline);

		return () => {
			window.removeEventListener('offline', handleOffline);
			window.removeEventListener('online', handleOffline);
		};
	}, []);

	return (
		<div className="container mx-auto p-4 max-w-3xl">
			{isOffline ? null : (
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Save Substack Articles Offline</CardTitle>
						<CardDescription>
							Enter a URL to save an article for offline reading
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex space-x-2">
							<Input
								type="url"
								placeholder="Enter article URL"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								className="flex-grow"
								disabled={isSaving}
								onKeyUp={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleSave();
									}
								}}
							/>
							<Button
								onClick={handleSave}
								disabled={isSaving || checkUrlValid(url)}
							>
								{isSaving ? (
									<>
										<Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									'Save Offline'
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{isOffline ? <OfflineIndicator /> : null}

			<h2 className="text-2xl font-bold mb-4">Saved Articles</h2>
			<Card className="mb-6 p-0 py-0">
				<Link to="/archived" className="flex justify-between items-center p-4">
					<span>View Archived Articles</span>
					<ChevronRightIcon className="h-4 w-4" />
				</Link>
			</Card>

			<div className="grid gap-4">
				<ArticleList
					articles={articles}
					onCopyLink={(url) => {
						navigator.clipboard.writeText(url);
					}}
					onDelete={async (url) => {
						await db.open();
						await db.deleteArticle(url);
						setArticles(articles.filter((i) => i.url !== url));
					}}
					onArchive={async (url) => {
						await db.open();
						await db.archiveArticle(url);
						setArticles(articles.filter((i) => i.url !== url));
					}}
				/>
			</div>
		</div>
	);
}
