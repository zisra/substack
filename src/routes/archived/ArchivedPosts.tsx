import { Header } from '@/components/Header';
import { DeleteArchivedPosts } from '@/components/modals/DeleteArchivedPosts';
import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database';
import type { ArticleSaved } from '@/lib/types';
import { ArticleList } from '@/routes/index/ArticleList';
import { ChevronLeftIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

export function ArchivedPosts() {
	const [articles, setArticles] = useState<ArticleSaved[]>([]);

	const db = new Database();

	useEffect(() => {
		const loadArticles = async () => {
			await db.open();
			const articles = await db.getArchivedArticles();

			if (articles) {
				setArticles(articles);
			} else {
				setArticles([]);
			}
		};

		loadArticles();
	}, []);

	return (
		<>
			<Header />
			<div className='container mx-auto max-w-3xl p-4'>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='font-bold text-2xl'>Archived Articles</h2>
					<DeleteArchivedPosts db={db} articles={articles} setArticles={setArticles} />
				</div>
				<Card className='mb-6 p-0 py-0'>
					<Link
						to='/'
						className='flex cursor-pointer items-center gap-2 p-4 transition-all duration-200 ease-in-out hover:bg-accent/50'
					>
						<ChevronLeftIcon className='size-4 text-muted-foreground' />
						<span>View All Articles</span>
					</Link>
				</Card>

				<div className='grid gap-4'>
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
							setArticles(articles.filter((i) => i.url !== url));
							await db.open();
							await db.unArchiveArticle(url);
						}}
						archivedView={true}
					/>
				</div>
			</div>
		</>
	);
}
