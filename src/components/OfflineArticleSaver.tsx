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
import { Loader2 } from 'lucide-react';
import type { Article } from '@/lib/types';
import { Database } from '@/lib/database';
import { checkUrlValid } from '@/lib/utils';

export default function OfflineArticleSaver() {
	const [url, setUrl] = useState('');
	const [articles, setArticles] = useState<Article[]>([]);
	const [isSaving, setIsSaving] = useState(false);

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

			const data: Article = await response.json();
			await db.saveArticle(data);
			const articles = await db.getArticles();

			setArticles(articles);

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

	return (
		<div className="container mx-auto p-4 max-w-3xl">
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
						<Button onClick={handleSave} disabled={isSaving || checkUrlValid()}>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								'Save Offline'
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			<h2 className="text-2xl font-bold mb-4">Saved Articles</h2>
			<div className="grid gap-4">
				<ArticleList articles={articles} />
			</div>
		</div>
	);
}
