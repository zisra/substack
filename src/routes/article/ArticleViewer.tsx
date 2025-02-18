import { AlertCard } from '@/components/AlertCard';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/lib/database';
import type { Article, ArticleSaved, Settings } from '@/lib/types';
import { ArticleHeader } from '@/routes/article/ArticleHeader';
import { FinishedReadingButton } from '@/routes/article/FinishedReadingButton';
import { HtmlRenderer, Parser } from 'commonmark';
import { ArchiveIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useBlocker, useNavigate, useSearchParams } from 'react-router';
import { twMerge } from 'tailwind-merge';

async function saveArticle(db: Database, url: string) {
	const response = await fetch(`/download-article?url=${encodeURIComponent(url)}`);

	if (!response.ok) {
		throw new Error('Failed to download article');
	}

	const data: Article = await response.json();
	const savedArticle = await db.saveArticle(data);

	return savedArticle;
}

export function ArticleViewer() {
	const [searchParams] = useSearchParams();
	const [article, setArticle] = useState<ArticleSaved | null>(null);
	const [settings, setSettings] = useState<Settings | null>(null);
	const [title, setTitle] = useState<string>('');
	const [markdown, setMarkdown] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const navigate = useNavigate();

	const url = searchParams.get('url');

	const db = new Database();

	useEffect(() => {
		const loadArticles = async () => {
			await db.open();

			if (url) {
				db.getArticle(url)
					.then(async (article) => {
						if (article) {
							setArticle(article);
							if (!article.archived) {
								scrollTo(article.scrollLocation);
							}
						} else {
							const articleResponse = await saveArticle(db, url);
							if (articleResponse) {
								setArticle(articleResponse);
								scrollTo(0);
							}
						}
					})
					.catch((err) => {
						navigate('/');
						console.error(err);
					});
			} else {
				navigate('/');
				console.error('No URL provided');
			}
		};

		loadArticles();
	}, [url]);

	useEffect(() => {
		const fetchData = async () => {
			const reader = new Parser();
			const writer = new HtmlRenderer();

			if (typeof article?.markdown === 'string') {
				const parsed = reader.parse(article.markdown ?? '');

				const result = writer.render(parsed);
				setMarkdown(result);
			} else if (url && article?.markdown === false) {
				try {
					const response = await fetch(`/download-article?url=${encodeURIComponent(url)}`);

					if (!response.ok) {
						navigate('/');
						throw new Error('Failed to download article');
					}

					const data: Article = await response.json();

					setArticle({
						...data,
						archived: article.archived,
						timestamp: article.timestamp,
						imagesSaved: article.imagesSaved,
						scrollLocation: 0,
					});
				} catch (error) {
					setFailed(true);
				}
			}

			if (article?.title) {
				setTitle(article.title);
			}
		};

		fetchData();
	}, [article]);

	useEffect(() => {
		const fetchSettings = async () => {
			await db.open();
			const settings = await db.getSettings();

			if (settings) {
				setSettings(settings);
			}
		};
		fetchSettings();
	}, []);

	db.open();

	const saveScrollPosition = useCallback(() => {
		if (article) {
			console.log(window.scrollY);
			db.saveScrollLocation(article.url, window.scrollY);
		}
	}, [article]);

	// Handle browser refresh or tab close
	useEffect(() => {
		const handleBeforeUnload = () => {
			saveScrollPosition();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [saveScrollPosition]);

	useBlocker(() => {
		saveScrollPosition();
		return false;
	});

	const onSettingsChange = async (settings: Settings) => {
		setSettings(settings);
	};

	const scrollTo = (top: number) => {
		setTimeout(() => {
			window.scrollTo({
				top,
				behavior: 'smooth',
			});
		}, 10);
	};

	if (!article) {
		return <ArticleSkeleton />;
	}

	return (
		<div className='max-w-3xl mx-auto px-4 py-8 '>
			<Helmet>
				<title>{title}</title>
			</Helmet>
			<ArticleHeader
				onSettingsChange={onSettingsChange}
				article={article}
				db={db}
				setArticle={setArticle}
				failed={failed}
				fontFamily={settings?.formatting.fontFamily}
			/>
			<Separator className='my-2' />
			{failed ? (
				<AlertCard
					title='Archived article'
					icon={<ArchiveIcon className='size-16' aria-hidden='true' />}
				>
					This article has been archived and is no longer available without an internet connection.
				</AlertCard>
			) : (
				<article
					className={twMerge(
						settings?.formatting.fontFamily === 'sans' && 'font-sans',
						settings?.formatting.fontFamily === 'serif' && 'font-serif',
						settings?.formatting.fontFamily === 'mono' && 'font-mono',
						settings?.formatting.fontSize === 'sm' && 'prose-sm print:prose-sm',
						settings?.formatting.fontSize === 'base' && 'prose-base',
						settings?.formatting.fontSize === 'dynamic' && 'prose-base lg:prose-lg print:prose-sm',
						settings?.formatting.fontSize === null && 'prose-base lg:prose-lg print:prose-sm',
						settings?.formatting.fontSize === 'lg' && 'prose-lg',
						settings?.formatting.fontSize === 'xl' && 'prose-xl',
						settings?.formatting.printImages === false &&
							'print:prose-img:hidden print:prose-figcaption:hidden',
						'prose space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic max-w-none break-words',
					)}
				>
					{markdown ? (
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content
							dangerouslySetInnerHTML={{
								__html: markdown,
							}}
						/>
					) : (
						<article className='space-y-4'>
							<Skeleton className='h-6 w-full' />
							<Skeleton className='h-6 w-full' />
							<Skeleton className='h-6 w-3/4' />
						</article>
					)}
				</article>
			)}
			<div>
				<Separator className='my-2' />
				{markdown ? (
					<FinishedReadingButton db={db} setArticle={setArticle} article={article} />
				) : null}
			</div>
		</div>
	);
}
