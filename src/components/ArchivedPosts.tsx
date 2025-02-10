import { useEffect, useState } from 'react';

import { ArticleList } from '@/components/ArticleList';
import { Card } from '@/components/ui/card';
import { ChevronLeftIcon } from 'lucide-react';
import type { ArticleSaved } from '@/lib/types';
import { Database } from '@/lib/database';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function ArchivedPosts() {
	const [articles, setArticles] = useState<ArticleSaved[]>([]);

	const db = new Database();

	useEffect(() => {
		const loadArticles = async () => {
			await db.open();
			const articles = await db.getArchivedArticles();

			console.log(articles);

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
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold">Archived Articles</h2>
				<Button
					size="sm"
					variant="destructive"
					onClick={async () => {
						await db.open();
						await Promise.all(
							articles.map((article) => db.deleteArticle(article.url))
						);
						setArticles([]);
					}}
					disabled={articles.length === 0}
				>
					Delete All Archived
				</Button>
			</div>
			<Card className="mb-6 p-0 py-0">
				<Link to="/" className="flex items-center p-4 gap-2">
					<ChevronLeftIcon className="h-4 w-4" />
					<span>View All Articles</span>
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
					onUnArchive={async (url) => {
						await db.open();
						await db.unArchiveArticle(url);
						setArticles(articles.filter((i) => i.url !== url));
					}}
					archivedView={true}
				/>
			</div>
		</div>
	);
}
