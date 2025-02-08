import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { useSearchParams, useNavigate } from 'react-router';
import { Database } from '@/lib/database';
import { useEffect, useState } from 'react';
import { type Article } from '@/lib/types';
import { Parser, HtmlRenderer } from 'commonmark';
import { Button } from './ui/button';
import { ExternalLink, LinkIcon, PrinterIcon, TrashIcon } from 'lucide-react';
import { Helmet } from 'react-helmet';

async function saveArticle(db: Database, url: string) {
	const response = await fetch(
		`/download-article?url=${encodeURIComponent(url)}`
	);

	if (!response.ok) {
		throw new Error('Failed to download article');
	}

	const data: Article = await response.json();
	await db.saveArticle(data);

	return data;
}

export function ArticleViewer() {
	let [searchParams] = useSearchParams();
	const [article, setArticle] = useState<Article | null>(null);
	const [title, setTitle] = useState<string>('');
	const [markdown, setMarkdown] = useState<string>('');
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
							const article = await saveArticle(db, url);
							setArticle(article);
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
		if (!window.location.hash) {
			window.scrollTo({ top: 0 });
		}

		const reader = new Parser();
		const writer = new HtmlRenderer();
		var parsed = reader.parse(article?.markdown ?? '');

		const result = writer.render(parsed);
		setMarkdown(result);
		if (article?.title) {
			setTitle(article.title);
		}
	}, [article]);

	if (!article) {
		return (
			<div className="max-w-3xl mx-auto px-4 py-8">
				<header className="mb-4">
					<Skeleton className="h-10 w-3/4 mb-2" />
					<Skeleton className="h-6 w-1/2 mb-4" />
					<div className="flex items-center space-x-2">
						<Skeleton className="h-6 w-6 rounded-full" />
						<Skeleton className="h-6 w-1/4" />
					</div>
				</header>
				<hr className="my-6" />
				<article className="space-y-4">
					<Skeleton className="h-6 w-full" />
					<Skeleton className="h-6 w-full" />
					<Skeleton className="h-6 w-3/4" />
				</article>
			</div>
		);
	} else {
		return (
			<div className="max-w-3xl mx-auto px-4 py-8 ">
				<Helmet>
					<title>{title}</title>
				</Helmet>
				<header className="mb-4">
					<h1 className="text-4xl font-bold mb-2 print:tracking-tighter">
						{article?.title}
					</h1>
					<p className="text-xl text-muted-foreground mb-4">
						{article?.subtitle}
					</p>
					<div className="flex items-center space-x-2">
						<Avatar className="pointer-events-none h-6 w-6">
							<AvatarImage src={article?.authorImg} alt="Author" />
						</Avatar>
						<div>
							<p className="text-md text-muted-foreground">
								<a>{article?.author}</a>
							</p>
						</div>
					</div>
					<div className="print:hidden">
						<hr className="my-6" />
						<div className="flex items-center space-x-4">
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									navigator.clipboard.writeText(article.url);
								}}
							>
								<LinkIcon />
							</Button>
							<a href={article.url} target="_blank" rel="noopener noreferrer">
								<Button variant="outline" size="icon">
									<ExternalLink />
								</Button>
							</a>
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									window.print();
								}}
							>
								<PrinterIcon />
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={async () => {
									navigate('/');
									const db = new Database();
									await db.open();

									db.deleteArticle(article.url);
								}}
								className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
							>
								<TrashIcon />
							</Button>
						</div>
					</div>
				</header>
				<hr className="my-6" />
				<article className="prose print:prose-sm prose-neutral lg:prose-lg space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic max-w-none break-words">
					<div
						dangerouslySetInnerHTML={{
							__html: markdown,
						}}
					></div>
				</article>
			</div>
		);
	}
}
