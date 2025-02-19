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
				<AlertCard title='No archived articles' icon={<ArchiveIcon className='size-16' />}>
					Go back and archive some articles that you finished reading.
				</AlertCard>
			);
		}
		return (
			<AlertCard title='No articles saved' icon={<BookOpenTextIcon className='size-16' />}>
				Get started by saving your first article.
			</AlertCard>
		);
	}

	return articles.map((article) => {
		return (
			<Card
				key={article.url}
				className='transition-all duration-200 ease-in-out hover:bg-accent/50  hover:shadow-xs'
			>
				<CardContent className='pl-4 py-4 pr-2'>
					<div className='flex justify-between items-start'>
						<Link to={`/article/?url=${encodeURIComponent(article.url)}`} className='grow'>
							<div className='flex grow pr-2'>
								<div className='grow'>
									<div className='flex items-center mb-2'>
										<img
											src={article.authorImg}
											alt={article.author}
											className='size-6 rounded-full mr-2 pointer-events-none'
										/>
										<span className='text-sm text-neutral-500 dark:text-neutral-400'>
											{article.author}
										</span>
									</div>
									<h3 className='font-bold text-lg mb-2'>{article.title}</h3>
									<p className='text-sm text-neutral-500 dark:text-neutral-400'>
										{article.subtitle}
									</p>
								</div>
								{article.image ? (
									<div className='shrink-0 ml-4'>
										<img
											src={article.image}
											alt={article.title}
											className='size-24 object-cover rounded-md pointer-events-none'
										/>
									</div>
								) : null}
							</div>
						</Link>
						<ArticleListDropdown
							onCopyLink={onCopyLink}
							archivedView={archivedView}
							onUnArchive={onUnArchive}
							offline={offline}
							onArchive={onArchive}
							onDelete={onDelete}
							article={article}
						/>
					</div>
				</CardContent>
			</Card>
		);
	});
}

function ArticleListDropdown({
	onCopyLink,
	archivedView,
	onUnArchive,
	offline,
	onArchive,
	onDelete,
	article,
}: {
	onCopyLink: (url: string) => void;
	archivedView?: boolean;
	onUnArchive?: (url: string) => void;
	offline: boolean;
	onArchive?: (url: string) => void;
	onDelete: (url: string) => void;
	article: ArticleSaved;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='size-8 p-0'>
					<span className='sr-only'>Open menu</span>
					<MoreVerticalIcon className='size-4 text-neutral-500 dark:text-neutral-400' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-40'>
				<DropdownMenuItem onClick={() => onCopyLink(article.url)} className='cursor-pointer'>
					<LinkIcon className='mr-2 size-4' />
					<span>Copy link</span>
				</DropdownMenuItem>

				{archivedView && onUnArchive ? (
					<DropdownMenuItem
						onClick={() => onUnArchive(article.url)}
						className='cursor-pointer'
						disabled={offline && article.markdown === false}
					>
						<ArchiveRestoreIcon className='mr-2 size-4' />
						<span>Unarchive</span>
					</DropdownMenuItem>
				) : null}

				{!archivedView && onArchive ? (
					<DropdownMenuItem onClick={() => onArchive(article.url)} className='cursor-pointer'>
						<ArchiveIcon className='mr-2 size-4' />
						<span>Archive</span>
					</DropdownMenuItem>
				) : null}

				<DropdownMenuItem
					className='cursor-pointer'
					variant='destructive'
					onClick={() => onDelete(article.url)}
				>
					<TrashIcon className='mr-2 size-4' />
					<span>Delete</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
