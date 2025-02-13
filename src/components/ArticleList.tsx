import { AlertCard } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ArticleSaved } from '@/lib/types';
import { useIsOffline } from '@/lib/utils';
import {
	ArchiveIcon,
	ArchiveRestoreIcon,
	BookOpenTextIcon,
	LinkIcon,
	MoreVerticalIcon,
	TrashIcon,
} from 'lucide-react';
import { Link } from 'react-router';

interface ArticleListProps {
	articles: ArticleSaved[];
	onDelete: (url: string) => void;
	onCopyLink: (url: string) => void;
	onArchive?: (url: string) => void;
	onUnArchive?: (url: string) => void;
	archivedView?: boolean;
}

export function ArticleList({
	articles,
	onDelete,
	onCopyLink,
	onArchive,
	onUnArchive,
	archivedView = false,
}: ArticleListProps) {
	const offline = useIsOffline();

	if (articles.length === 0) {
		if (archivedView) {
			return (
				<AlertCard title="No archived articles" icon={<ArchiveIcon className="h-16 w-16" />}>
					Go back and archive some articles that you finished reading.
				</AlertCard>
			);
		}
		return (
			<AlertCard title="No articles saved" icon={<BookOpenTextIcon className="h-16 w-16" />}>
				Get started by saving your first article.
			</AlertCard>
		);
	}

	return articles.map((article) => {
		return (
			<Card
				key={article.url}
				className="transition-all duration-300 ease-in-out hover:shadow-sm hover:bg-accent/50 cursor-pointer"
			>
				<CardContent className="p-4">
					<div className="flex justify-between items-start">
						<Link to={`/article/?url=${encodeURIComponent(article.url)}`} className="flex-grow">
							<div className="flex">
								<div className="flex-grow pr-4">
									<div className="flex items-center mb-2">
										<img
											src={article.authorImg || '/placeholder.svg'}
											alt={article.author}
											className="w-6 h-6 rounded-full mr-2 pointer-events-none"
										/>
										<span className="text-sm text-neutral-500 dark:text-neutral-400">
											{article.author}
										</span>
									</div>
									<h3 className="font-bold text-lg mb-2">{article.title}</h3>
									<p className="text-sm text-neutral-500 dark:text-neutral-400">
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
								<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-background">
									<span className="sr-only">Open menu</span>
									<MoreVerticalIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
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

								{archivedView && onUnArchive ? (
									<DropdownMenuItem
										onClick={() => onUnArchive(article.url)}
										className="cursor-pointer"
										disabled={offline && article.markdown === false}
									>
										<ArchiveRestoreIcon className="mr-2 h-4 w-4" />
										<span>Unarchive</span>
									</DropdownMenuItem>
								) : null}

								{!archivedView && onArchive ? (
									<DropdownMenuItem
										onClick={() => onArchive(article.url)}
										className="cursor-pointer"
									>
										<ArchiveIcon className="mr-2 h-4 w-4" />
										<span>Archive</span>
									</DropdownMenuItem>
								) : null}

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
