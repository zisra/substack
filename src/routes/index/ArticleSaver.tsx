import { AlertCard } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Database } from '@/lib/database';
import type { Article, ArticleSaved } from '@/lib/types';
import { checkUrlValid, useIsOffline } from '@/lib/utils';
import { ArticleList } from '@/routes/index/ArticleList';
import { ChevronRightIcon, Loader2Icon, SearchIcon, WifiOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

export function ArticleSaver({ openCommand }: { openCommand: () => void }) {
	const [url, setUrl] = useState('');
	const [articles, setArticles] = useState<ArticleSaved[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const offline = useIsOffline();

	const db = new Database();

	const handleSave = async () => {
		if (!url) return;

		setIsSaving(true);
		try {
			const response = await fetch(`/download-article?url=${encodeURIComponent(url)}`);

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

	return (
		<div className='container mx-auto p-4 max-w-3xl'>
			{offline ? null : (
				<Card className='mb-8'>
					<CardHeader>
						<CardTitle>Save Substack Articles Offline</CardTitle>
						<CardDescription>Enter a URL to save an article for offline reading</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex space-x-2'>
							<Input
								type='url'
								placeholder='Enter article URL'
								value={url}
								onChange={(e) => {
									setUrl(e.target.value);
								}}
								className='grow'
								disabled={isSaving}
								onKeyUp={(e) => {
									if (e.key === 'Enter' && !isSaving && !checkUrlValid(url)) {
										e.preventDefault();
										handleSave();
									}
								}}
							/>
							<Button
								onClick={handleSave}
								disabled={isSaving || checkUrlValid(url)}
								className='w-28 max-w-28 min-w-28'
							>
								{isSaving ? (
									<>
										<Loader2Icon className='mr-2 size-4 animate-spin' />
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

			{offline ? (
				<AlertCard title='Offline' icon={<WifiOffIcon className='size-16' />}>
					Please connect to the internet to save articles.
				</AlertCard>
			) : null}

			<div className='flex justify-between items-center text-2xl font-bold mb-4'>
				<h2>Saved Articles</h2>
				<Button variant='outline' size='icon' onClick={() => openCommand()}>
					<SearchIcon />
				</Button>
			</div>
			<Card className='mb-6 p-0 py-0 transition-all duration-200 ease-in-out hover:bg-accent/50'>
				<Link to='/archived' className='flex justify-between items-center p-4'>
					<span>View Archived Articles</span>
					<ChevronRightIcon className='size-4 text-neutral-500 dark:text-neutral-400' />
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
