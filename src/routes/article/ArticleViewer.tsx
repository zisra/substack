import { AlertCard } from '@/components/AlertCard';
import { ArticleSkeleton, ArticleTextSkeleton } from '@/components/ArticleSkeleton';
import { Separator } from '@/components/ui/separator';
import { Database } from '@/lib/database';
import type { Article, ArticleSaved, Settings } from '@/lib/types';
import { articleFormatting, sanitizeDom } from '@/lib/utils';
import { ArticleHeader } from '@/routes/article/ArticleHeader';
import { FinishedReadingButton } from '@/routes/article/FinishedReadingButton';
import { HtmlRenderer, Parser } from 'commonmark';
import { ArchiveIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useBlocker, useNavigate, useSearchParams } from 'react-router';

async function saveArticle(db: Database, url: string) {
	try {
		const response = await fetch(`/download-article/?url=${encodeURIComponent(url)}`);

		if (!response.ok) {
			throw new Error('Failed to download article');
		}

		const data: Article = await response.json();
		return await db.saveArticle(data);
	} catch (error) {
		console.error('Error saving article:', error);
		return undefined;
	}
}

export function ArticleViewer() {
	const [article, setArticle] = useState<ArticleSaved | null>(null);
	const [settings, setSettings] = useState<Settings | null>(null);
	const [title, setTitle] = useState<string>('');
	const [markdown, setMarkdown] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const url = searchParams.get('url');
	const db = new Database();

	const scrollTo = (top: number) => {
		setTimeout(() => {
			window.scrollTo({
				top,
				behavior: 'smooth',
			});
		}, 10);
	};

	db.open();
	const saveScrollPosition = useCallback(() => {
		if (article) {
			db.saveScrollLocation(article.url, window.scrollY);
		}
	}, [article]);

	// Load article and settings
	useEffect(() => {
		const loadArticles = async () => {
			try {
				await db.open();
				const settings = await db.getSettings();

				if (settings) {
					setSettings(settings);
				}

				if (!url) {
					navigate('/');
					console.error('No URL provided');
					return;
				}

				const existingArticle = await db.getArticle(url);

				if (existingArticle) {
					setArticle(existingArticle);

					if (!existingArticle.archived && settings?.scrollArticles !== false) {
						scrollTo(existingArticle.scrollLocation);
					} else {
						scrollTo(0);
					}
				} else {
					const articleResponse = await saveArticle(db, url);

					if (articleResponse) {
						navigate(`/article?url=${encodeURIComponent(articleResponse.url)}`);
						setArticle(articleResponse);
						scrollTo(0);
					}
				}
			} catch (err) {
				navigate('/');
				console.error(err);
			}
		};

		loadArticles();
	}, [url, navigate]);

	// Process markdown and fetch article content
	useEffect(() => {
		const fetchData = async () => {
			if (!article) return;

			if (typeof article.markdown === 'string') {
				const reader = new Parser();
				const writer = new HtmlRenderer();
				const parsed = reader.parse(article.markdown || '');
				const result = writer.render(parsed);
				setMarkdown(result);
			} else if (url && article.markdown === false) {
				try {
					const response = await fetch(`/download-article/?url=${encodeURIComponent(url)}`);

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

			if (article.title) {
				setTitle(article.title);
			}
		};

		fetchData();
	}, [article, url, navigate]);

	// Save scroll position on navigation
	useBlocker(() => {
		saveScrollPosition();
		return false;
	});

	// Save scroll position on window unload
	useEffect(() => {
		const handleBeforeUnload = () => {
			saveScrollPosition();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [saveScrollPosition]);

	const onSettingsChange = async (settings: Settings) => {
		setSettings(settings);
	};

	if (!article) {
		return <ArticleSkeleton />;
	}

	return (
		<div className='max-w-3xl mx-auto px-4 py-8'>
			<title>{title}</title>

			<ArticleHeader
				onSettingsChange={onSettingsChange}
				article={article}
				db={db}
				setArticle={setArticle}
				settings={settings}
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
				<article className={articleFormatting(settings)}>
					{markdown ? (
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content
							dangerouslySetInnerHTML={{
								__html: sanitizeDom(markdown),
							}}
						/>
					) : (
						<ArticleTextSkeleton />
					)}
				</article>
			)}

			{markdown && <FinishedReadingButton db={db} setArticle={setArticle} article={article} />}
		</div>
	);
}
