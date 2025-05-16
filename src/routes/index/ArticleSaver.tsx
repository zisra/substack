import { AlertCard } from '@/components/AlertCard';
import { LinkCard } from '@/components/LinkCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useIsOffline } from '@/hooks/useIsOffline';
import { useDatabase } from '@/lib/DatabaseContext';
import type { Article, ArticleSaved } from '@/lib/types';
import { checkUrlValid } from '@/lib/utils';
import { ArticleList } from '@/routes/index/ArticleList';
import { ChevronRightIcon, Loader2Icon, SearchIcon, WifiOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';

export function ArticleSaver({ openCommand }: { openCommand: () => void }) {
	const [url, setUrl] = useState('');
	const [articles, setArticles] = useState<ArticleSaved[] | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const offline = useIsOffline();

	const db = useDatabase();

	const handleSave = async () => {
		if (!url) return;

		setIsSaving(true);
		try {
			const response = await fetch(`/download-article/?url=${encodeURIComponent(url)}`);

			if (!response.ok) {
				setUrl('');
				throw new Error('Failed to download article');
			}

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
		<>
			<div className='container mx-auto max-w-3xl p-4'>
				{offline ? null : (
					<Card className='mb-8 py-6 shadow-xs dark:bg-input/30'>
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
									className='w-28 min-w-28 max-w-28'
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

				{offline && (
					<AlertCard title='Offline' icon={<WifiOffIcon className='size-16' />}>
						Please connect to the internet to save articles
					</AlertCard>
				)}

				<div className='mb-4 flex items-center justify-between font-bold text-2xl'>
					<h2>Saved Articles</h2>
					<Button variant='outline' size='icon' onClick={() => openCommand()}>
						<SearchIcon />
					</Button>
				</div>
				<div
					onDragOver={(e: React.DragEvent<HTMLDivElement>) => e.preventDefault()}
					onDrop={async (e: React.DragEvent<HTMLDivElement>) => {
						e.preventDefault();
						const url = e.dataTransfer.getData('text/plain');
						if (!articles) return;
						setArticles(articles.filter((i) => i.url !== url));
						await db.archiveArticle(url);
					}}
				>
					<LinkCard>
						<Link to='/archived' className='flex items-center justify-between p-4'>
							<span>View Archived Articles</span>
							<ChevronRightIcon className='size-4 text-muted-foreground' />
						</Link>
					</LinkCard>
				</div>

				<div className='grid gap-4'>
					<ArticleList
						articles={articles}
						onCopyLink={(url) => {
							navigator.clipboard.writeText(url);
						}}
						onDelete={async (url) => {
							if (!articles) return;
							setArticles(articles.filter((i) => i.url !== url));
							await db.deleteArticle(url);
						}}
						onArchive={async (url) => {
							if (!articles) return;
							setArticles(articles.filter((i) => i.url !== url));
							await db.archiveArticle(url);
						}}
					/>
				</div>
			</div>
		</>
	);
}
