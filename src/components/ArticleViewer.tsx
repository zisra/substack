import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { useSearchParams, Navigate } from 'react-router';
import { Database } from '@/lib/database';
import { useEffect, useState } from 'react';
import { type Article } from '@/lib/types';
import { Parser, HtmlRenderer } from 'commonmark';
import { Button } from './ui/button';
import { ExternalLink, Link, Printer } from 'lucide-react';
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

export default function Article() {
	let [searchParams] = useSearchParams();
	const [article, setArticle] = useState<Article | null>(null);
	const [title, setTitle] = useState<string>('');
	const [markdown, setMarkdown] = useState<string>('');

	const url = searchParams.get('url');

	const db = new Database();

	if (!url) {
		return <Navigate replace to="/" />;
	}

	useEffect(() => {
		const loadArticles = async () => {
			await db.open();

			db.getArticle(url).then(async (article) => {
				setArticle(article);
				if (!article) {
					const article = await saveArticle(db, url);
					setArticle(article);
				}
			});
		};

		loadArticles();
	}, [url]);

	useEffect(() => {
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
			<>
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
			</>
		);
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<Helmet>
				<title>{title}</title>
			</Helmet>
			<header className="mb-4">
				<h1 className="text-4xl font-bold mb-2">{article?.title}</h1>
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
				<div className="no-print">
					<hr className="my-6" />
					<div className="flex items-center space-x-4">
						<Button
							variant="outline"
							size="icon"
							onClick={() => {
								navigator.clipboard.writeText(article.url);
							}}
						>
							<Link />
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
							<Printer />
						</Button>
					</div>
				</div>
			</header>
			<hr className="my-6" />
			<article className="prose prose-neutral lg:prose-lg space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic">
				<div
					dangerouslySetInnerHTML={{
						__html: markdown,
					}}
				></div>
			</article>
		</div>
	);
}
