import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useSearchParams, useNavigate } from 'react-router';
import { Database } from '@/lib/database';
import { useEffect, useState } from 'react';
import { ArticleSaved, type Article } from '@/lib/types';
import { Parser, HtmlRenderer } from 'commonmark';
import { Button } from '@/components/ui/button';
import {
	ArchiveIcon,
	ArchiveRestoreIcon,
	ExternalLink,
	LinkIcon,
	MoreVerticalIcon,
	PrinterIcon,
	TrashIcon,
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from './ui/card';
import { Formatting } from './Formatting';

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

export function ArticleViewer() {
	let [searchParams] = useSearchParams();
	const [article, setArticle] = useState<ArticleSaved | null>(null);
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
						archived: false,
						timestamp: Date.now(),
						imagesSaved: [],
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
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Button
									variant="outline"
									size="icon"
									onClick={() => {
										window.print();
									}}
								>
									<PrinterIcon />
								</Button>
								<a href={article.url} target="_blank" rel="noopener noreferrer">
									<Button variant="outline" size="icon">
										<ExternalLink />
									</Button>
								</a>
								<Formatting />
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										onClick={() => {
											navigator.clipboard.writeText(article.url);
										}}
									>
										<MoreVerticalIcon />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-40">
									<DropdownMenuItem
										onClick={() => {
											navigator.clipboard.writeText(article.url);
										}}
										className="cursor-pointer"
									>
										<LinkIcon className="mr-2 h-4 w-4" />
										<span>Copy link</span>
									</DropdownMenuItem>

									{article.archived ? (
										<DropdownMenuItem
											className="cursor-pointer"
											onClick={async () => {
												await db.open();
												db.unArchiveArticle(article.url);
												setArticle({
													...article,
													archived: false,
												});
											}}
										>
											<ArchiveRestoreIcon className="mr-2 h-4 w-4" />
											<span>Unarchive</span>
										</DropdownMenuItem>
									) : (
										<DropdownMenuItem
											className="cursor-pointer"
											onClick={async () => {
												await db.open();
												db.archiveArticle(article.url);
												setArticle({
													...article,
													archived: true,
												});
											}}
										>
											<ArchiveIcon className="mr-2 h-4 w-4" />
											<span>Archive</span>
										</DropdownMenuItem>
									)}

									<DropdownMenuItem
										className="cursor-pointer text-red-600"
										onClick={async () => {
											navigate('/');

											await db.open();
											db.deleteArticle(article.url);
										}}
									>
										<TrashIcon className="mr-2 h-4 w-4" />
										<span>Delete</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>
				<hr className="my-6" />
				{failed ? (
					<Card className="mb-8">
						<CardContent className="flex flex-col items-center space-y-4 p-6">
							<ArchiveIcon className="h-16 w-16" aria-hidden="true" />
							<h3 className="text-md">Archived article</h3>
							<p className="text-center text-muted-foreground">
								This article has been archived and is no longer available
								without an internet connection.
							</p>
						</CardContent>
					</Card>
				) : (
					<article className="prose print:prose-sm prose-lg space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic max-w-none break-words">
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
