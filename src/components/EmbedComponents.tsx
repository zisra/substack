import { Card, CardContent } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';
import { Link } from 'react-router';

export function ArticleCard({
	title,
	author,
	url,
	image,
	authorUrl,
}: {
	title: string;
	author: string;
	url: string;
	image: string;
	authorUrl: string;
}) {
	return (
		<Card className="w-full max-w-md mx-auto transition-all duration-300 ease-in-out hover:shadow-sm hover:bg-accent/50 cursor-pointer">
			<Link
				to={`/article/?url=${encodeURIComponent(url)}`}
				className="flex-grow"
			>
				<div className="mx-auto max-w-xl overflow-hidden">
					<img
						className="h-56 w-full object-cover rounded-t-md"
						srcSet={image}
						alt={title}
					/>
					<div className="p-4">
						<div className="flex items-center">
							<img
								className="w-6 h-6 rounded-full mr-2 pointer-events-none aspect-16/9"
								src={authorUrl}
								alt={author}
							/>
							<span className="text-sm text-neutral-500 dark:text-neutral-400">
								{author}
							</span>
						</div>
						<h2 className="mt-2 font-bold text-lg">{title}</h2>
					</div>
				</div>
			</Link>
		</Card>
	);
}

export function Quote({
	url,
	content,
	author,
}: {
	url: string;
	content: string;
	author: string;
}) {
	return (
		<Card className="w-full max-w-2xl mx-auto duration-300 ease-in-out hover:shadow-sm hover:bg-accent/50 cursor-pointer">
			<Link
				to={`/article/?url=${encodeURIComponent(url)}`}
				className="flex-grow"
			>
				<CardContent className="pt-6">
					<div className="relative">
						<span className="absolute top-0 left-0 text-6xl text-primary opacity-20 -translate-x-4 -translate-y-4 font-serif">
							<QuoteIcon />
						</span>
						<blockquote className="text-lg leading-relaxed mb-4 pt-4 border-none">
							{content}
						</blockquote>
						<footer className="text-sm text-muted-foreground">
							— {author}
						</footer>
					</div>
				</CardContent>
			</Link>
		</Card>
	);
}
