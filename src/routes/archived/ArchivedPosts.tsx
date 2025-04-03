import { LinkCard } from '@/components/LinkCard';
import { DeleteArchivedPosts } from '@/components/modals/DeleteArchivedPosts';
import { useDatabase } from '@/lib/context/DatabaseContext';
import type { ArticleSaved } from '@/lib/types';
import { ArticleList } from '@/routes/index/ArticleList';
import { ChevronLeftIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

export function ArchivedPosts() {
	const [articles, setArticles] = useState<ArticleSaved[]>([]);

	const db = useDatabase();

	useEffect(() => {
		const loadArticles = async () => {
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
			<div className='container mx-auto max-w-3xl p-4'>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='font-bold text-2xl'>Archived Articles</h2>
					<DeleteArchivedPosts db={db} articles={articles} setArticles={setArticles} />
				</div>
				<LinkCard>
					<Link to='/' className='flex items-center gap-2 p-4'>
						<ChevronLeftIcon className='size-4 text-muted-foreground' />
						<span>View All Articles</span>
					</Link>
				</LinkCard>

				<div className='grid gap-4'>
					<ArticleList
						articles={articles}
						onCopyLink={(url) => {
							navigator.clipboard.writeText(url);
						}}
						onDelete={async (url) => {
							await db.deleteArticle(url);
							setArticles(articles.filter((i) => i.url !== url));
						}}
						onUnArchive={async (url) => {
							setArticles(articles.filter((i) => i.url !== url));
							await db.unArchiveArticle(url);
						}}
						archivedView={true}
					/>
				</div>
			</div>
		</>
	);
}
