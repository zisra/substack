import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useSearchParams, useNavigate } from 'react-router';
import { Database } from '@/lib/database';
import { useEffect, useState } from 'react';
import { ArticleSaved, Settings, type Article } from '@/lib/types';
import { Parser, HtmlRenderer } from 'commonmark';
import { ArchiveIcon } from 'lucide-react';
import { Helmet } from 'react-helmet';

import { AlertCard } from './AlertCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import { ArticleControls } from './ArticleControls';
import { twMerge } from 'tailwind-merge';
import { cn } from '@/lib/utils';

async function saveArticle(db: Database, url: string) {
	const response = await fetch(
		`/download-article?url=${encodeURIComponent(url)}`
	);

	if (!response.ok) {
		throw new Error('Failed to download article');
	}

	const data: Article = await response.json();
	const savedArticle = await db.saveArticle(data);

	return savedArticle;
}

function ArticleHeader({
	article,
	db,
	setArticle,
	onSettingsChange,
	failed,
	fontFamily,
}: {
	article: ArticleSaved;
	db: Database;
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
	onSettingsChange: (settings: Settings) => void;
	failed: boolean;
	fontFamily?: string;
}) {
	return (
		<header className="mb-4">
			<h1
				className={cn(
					fontFamily === 'sans' && 'font-sans',
					fontFamily === 'serif' && 'font-serif',
					fontFamily === 'mono' && 'font-mono',
					'text-4xl font-bold mb-2'
				)}
			>
				{article?.title}
			</h1>
			<p
				className={cn(
					fontFamily === 'sans' && 'font-sans',
					fontFamily === 'serif' && 'font-serif',
					fontFamily === 'mono' && 'font-mono',
					'text-xl text-neutral-500 dark:text-neutral-400 mb-4'
				)}
			>
				{article?.subtitle}
			</p>
			<div className="flex items-center space-x-2">
				<Avatar className="pointer-events-none h-6 w-6">
					<AvatarImage src={article?.authorImg} alt="Author" />
				</Avatar>
				<div>
					<p
						className={cn(
							fontFamily === 'sans' && 'font-sans',
							fontFamily === 'serif' && 'font-serif',
							fontFamily === 'mono' && 'font-mono',
							'text-md text-neutral-500 dark:text-neutral-400'
						)}
					>
						<a>{article?.author}</a>
					</p>
				</div>
			</div>
			<ArticleControls
				onSettingsChange={onSettingsChange}
				db={db}
				setArticle={setArticle}
				article={article}
				failed={failed}
			/>
		</header>
	);
}

export function ArticleViewer() {
	let [searchParams] = useSearchParams();
	const [article, setArticle] = useState<ArticleSaved | null>(null);
	const [settings, setSettings] = useState<Settings | null>(null);
	const [title, setTitle] = useState<string>('');
	const [markdown, setMarkdown] = useState<string>('');
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
						} else {
							const articleResponse = await saveArticle(db, url);
							if (articleResponse) {
								setArticle(articleResponse);
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
				var parsed = reader.parse(article.markdown ?? '');

				const result = writer.render(parsed);
				setMarkdown(result);
			} else if (url && article?.markdown === false) {
				try {
					const response = await fetch(
						`/download-article?url=${encodeURIComponent(url)}`
					);

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
	}, [article, url, navigate]);

	useEffect(() => {
		const fetchSettings = async () => {
			await db.open();
			let settings = await db.getSettings();

			if (settings) {
				setSettings(settings);
			}
		};
		fetchSettings();
	}, []);

	const onSettingsChange = async (settings: Settings) => {
		setSettings(settings);
	};

	if (!article) {
		return <ArticleSkeleton />;
	} else {
		return (
			<div className="max-w-3xl mx-auto px-4 py-8 ">
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
				<hr className="my-6" />
				{failed ? (
					<AlertCard
						title="Archived article"
						icon={<ArchiveIcon className="h-16 w-16" aria-hidden="true" />}
					>
						This article has been archived and is no longer available without an
						internet connection.
					</AlertCard>
				) : (
					<article
						className={twMerge(
							settings?.formatting.fontFamily === 'sans' && 'font-sans',
							settings?.formatting.fontFamily === 'serif' && 'font-serif',
							settings?.formatting.fontFamily === 'mono' && 'font-mono',
							settings?.formatting.fontSize === 'sm' &&
								'prose-sm print:prose-sm',
							settings?.formatting.fontSize === 'base' && 'prose-base',
							settings?.formatting.fontSize === 'dynamic' &&
								'prose-base lg:prose-lg print:prose-sm',
							settings?.formatting.fontSize === null &&
								'prose-base lg:prose-lg print:prose-sm',
							settings?.formatting.fontSize === 'lg' && 'prose-lg',
							settings?.formatting.fontSize === 'xl' && 'prose-xl',
							settings?.formatting.printImages === false &&
								'print:prose-img:hidden',
							'prose space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic max-w-none break-words'
						)}
					>
						<div
							dangerouslySetInnerHTML={{
								__html: markdown,
							}}
						></div>
					</article>
				)}
			</div>
		);
	}
}
