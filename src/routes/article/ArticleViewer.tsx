import { AlertCard } from '@/components/AlertCard';
import { ArticleSkeleton, ArticleTextSkeleton } from '@/components/ArticleSkeleton';
import { FinishedReadingButton } from '@/components/FinishedReadingButton';
import { Header } from '@/components/Header';
import { Separator } from '@/components/ui/separator';
import { useDatabase } from '@/lib/DatabaseContext';
import type { Article, ArticleSaved, Settings } from '@/lib/types';
import { articleFormatting, sanitizeDom } from '@/lib/utils';
import { ArticleHeader } from '@/routes/article/ArticleHeader';
import { TableOfContents } from '@/routes/article/TableOfContents';
import { ArchiveIcon } from 'lucide-react';
import { parse, use } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import { useCallback, useEffect, useState } from 'react';
import { useBlocker, useLoaderData, useLocation, useNavigate, useSearchParams } from 'react-router';

export function ArticleViewer() {
	const { article: loaderArticle, settings: loaderSettings } = useLoaderData() as {
		article: ArticleSaved | null;
		settings: Settings | null;
	};
	const [article, setArticle] = useState<ArticleSaved | null>(loaderArticle);
	const [settings, setSettings] = useState<Settings | null>(loaderSettings);
	const [title, setTitle] = useState<string>('');
	const [html, setHtml] = useState<string | null>(null);
	const [markdown, setMarkdown] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	const [searchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();
	const url = searchParams.get('url');
	const db = useDatabase();

	const scrollTo = (top: number) => {
		window.scrollTo({
			top,
			behavior: 'smooth',
		});
	};

	const saveScrollPosition = useCallback(() => {
		if (article) {
			db.saveScrollLocation(article.url, window.scrollY);
		}
	}, [article]);

	useEffect(() => {
		(async () => {
			if (loaderArticle) {
				navigate(
					`/article/?url=${encodeURIComponent(loaderArticle.url)}${
						location.hash ? location.hash : ''
					}`,
					{
						replace: true,
					},
				);

				setTimeout(() => {
					const scrollElement = location.hash && document.querySelector(location.hash);
					if (scrollElement) {
						scrollElement.scrollIntoView({
							behavior: 'smooth',
							block: 'start',
						});
					} else if (!loaderArticle.archived && settings?.scrollArticles !== false) {
						scrollTo(loaderArticle.scrollLocation);
					} else {
						scrollTo(0);
					}
				}, 100);
			}
		})();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			if (!article) return;

			if (typeof article.markdown === 'string') {
				use(gfmHeadingId());
				const result = await parse(article.markdown);

				setHtml(result);
				setMarkdown(article.markdown);
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
						comments: article.comments,
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

	if (!article) {
		return (
			<>
				<Header onSettingsChange={setSettings} />
				<ArticleSkeleton />
			</>
		);
	}

	return (
		<>
			<Header onSettingsChange={setSettings} />
			<div className='mx-auto max-w-3xl px-4 py-8'>
				<title>{title}</title>

				<ArticleHeader
					markdown={markdown}
					article={article}
					db={db}
					setArticle={setArticle}
					settings={settings}
				/>
				<Separator className='my-2' />

				{html && (
					<div className='-translate-y-1/2 fixed top-1/2 left-2 z-30 hidden sm:block'>
						<TableOfContents content={html} />
					</div>
				)}

				{failed ? (
					<AlertCard
						title='Archived article'
						icon={<ArchiveIcon className='size-16' aria-hidden='true' />}
					>
						This article has been archived and is no longer available without an internet connection
					</AlertCard>
				) : html ? (
					<article className={articleFormatting(settings)}>
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content
							dangerouslySetInnerHTML={{
								__html: sanitizeDom(html),
							}}
						/>
					</article>
				) : (
					<ArticleTextSkeleton />
				)}

				{html && <FinishedReadingButton db={db} setArticle={setArticle} article={article} />}
			</div>
		</>
	);
}
