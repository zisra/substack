import { AlertCard } from '@/components/AlertCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsOffline } from '@/hooks/useIsOffline';
import type { ArticleSaved } from '@/lib/types';
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
	articles: ArticleSaved[] | null;
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

	if (articles === null) {
		return null;
	}

	if (articles.length === 0) {
		if (archivedView) {
			return (
				<AlertCard title='No archived articles' icon={<ArchiveIcon className='size-16' />}>
					Go back and archive some articles that you finished reading
				</AlertCard>
			);
		}
		return (
			<AlertCard title='No articles saved' icon={<BookOpenTextIcon className='size-16' />}>
				Get started by saving your first article
			</AlertCard>
		);
	}

	return articles.map((article) => {
		return (
			<Link
				to={`/article/?url=${encodeURIComponent(article.url)}`}
				className='grow'
				draggable='true'
				key={article.url}
				onDragStart={(e) => {
					e.dataTransfer.setData('text/plain', article.url);
					e.dataTransfer.effectAllowed = 'copy';
				}}
				onDragEnd={(e) => {
					e.preventDefault();
					e.stopPropagation();
				}}
			>
				<Card
					key={article.url}
					className='shadow-xs transition-all duration-200 hover:bg-card-hover hover:text-accent-foreground'
				>
					<CardContent className='py-4 pr-2 pl-4'>
						<div className='flex items-start justify-between'>
							<div className='flex grow pr-2'>
								<div className='grow'>
									<div className='mb-2 flex items-center'>
										<Avatar className='mr-2 size-6'>
											<AvatarImage src={article.authorImg} alt={article.author} />
											<AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
										</Avatar>
										<span className='text-muted-foreground text-sm'>{article.author}</span>
									</div>
									<h3 className='mb-2 font-bold text-lg'>{article.title}</h3>
									<p className='text-muted-foreground text-sm'>{article.subtitle}</p>
								</div>
								{article.image && (
									<div className='ml-4 shrink-0'>
										<img
											src={article.image}
											alt={article.title}
											className='pointer-events-none size-24 rounded-md object-cover'
										/>
									</div>
								)}
							</div>

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
			</Link>
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
	const handleDropdownClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild onClick={handleDropdownClick}>
				<Button variant='ghost' className='size-8 p-0'>
					<span className='sr-only'>Open menu</span>
					<MoreVerticalIcon className='size-4 text-muted-foreground' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-40' onClick={handleDropdownClick}>
				<DropdownMenuItem onClick={() => onCopyLink(article.url)} className='cursor-pointer'>
					<LinkIcon className='mr-2 size-4' />
					<span>Copy link</span>
				</DropdownMenuItem>

				{archivedView && onUnArchive && (
					<DropdownMenuItem
						onClick={() => onUnArchive(article.url)}
						className='cursor-pointer'
						disabled={offline && article.markdown === false}
					>
						<ArchiveRestoreIcon className='mr-2 size-4' />
						<span>Unarchive</span>
					</DropdownMenuItem>
				)}

				{!archivedView && onArchive && (
					<DropdownMenuItem onClick={() => onArchive(article.url)} className='cursor-pointer'>
						<ArchiveIcon className='mr-2 size-4' />
						<span>Archive</span>
					</DropdownMenuItem>
				)}

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
