import { Card, CardContent } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Article } from '@/lib/types';
import {
	LinkIcon,
	TrashIcon,
	MoreVerticalIcon,
	BookOpenTextIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

interface ArticleListProps {
	articles: Article[];
	onDelete: (url: string) => void;
	onCopyLink: (url: string) => void;
}

export function ArticleList({
	articles,
	onDelete,
	onCopyLink,
}: ArticleListProps) {
	if (articles.length === 0) {
		return (
			<Card className="mb-8">
				<CardContent className="flex flex-col items-center space-y-4 p-6">
					<BookOpenTextIcon className="h-16 w-16" aria-hidden="true" />
					<h3 className="text-md">No articles saved</h3>
					<p className="text-center text-muted-foreground">
						Get started by saving your first article.
					</p>
				</CardContent>
			</Card>
		);
	}

	return articles.map((article, index) => {
		return (
			<Card
				key={index}
				className="transition-all duration-300 ease-in-out hover:shadow-sm hover:bg-accent/50 cursor-pointer"
			>
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<Link
							to={`/article/?url=${encodeURIComponent(article.url)}`}
							className="flex-grow"
						>
							<div className="flex">
								<div className="flex-grow pr-4">
									<div className="flex items-center mb-2">
										<img
											src={article.authorImg || '/placeholder.svg'}
											alt={article.author}
											className="w-6 h-6 rounded-full mr-2 pointer-events-none"
										/>
										<span className="text-sm text-muted-foreground">
											{article.author}
										</span>
									</div>
									<h3 className="font-bold text-lg mb-2">{article.title}</h3>
									<p className="text-sm text-muted-foreground">
										{article.subtitle}
									</p>
								</div>
								<div className="flex-shrink-0">
									<img
										src={article.image || '/placeholder.svg'}
										alt={article.title}
										className="w-24 h-24 object-cover rounded-md pointer-events-none"
									/>
								</div>
							</div>
						</Link>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="h-8 w-8 p-0 hover:bg-background"
								>
									<span className="sr-only">Open menu</span>
									<MoreVerticalIcon className="h-4 w-4 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40">
								<DropdownMenuItem
									onClick={() => onCopyLink(article.url)}
									className="cursor-pointer"
								>
									<LinkIcon className="mr-2 h-4 w-4" />
									<span>Copy link</span>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => onDelete(article.url)}
									className="cursor-pointer text-red-600"
								>
									<TrashIcon className="mr-2 h-4 w-4" />
									<span>Delete</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardContent>
			</Card>
		);
	});
}
