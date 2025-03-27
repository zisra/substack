import { Button, buttonVariants } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useIsOffline } from '@/hooks/useIsOffline';
import type { Database } from '@/lib/database';
import type { ArticleSaved } from '@/lib/types';
import {
	ArchiveIcon,
	ArchiveRestoreIcon,
	ExternalLinkIcon,
	LinkIcon,
	MessageCircleIcon,
	MoreVerticalIcon,
	PrinterIcon,
	TrashIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function ArticleControls({
	db,
	setArticle,
	article,
}: {
	db: Database;
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
	article: ArticleSaved;
}) {
	const navigate = useNavigate();
	const offline = useIsOffline();

	return (
		<div className='print:hidden'>
			<Separator className='my-4' />
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-4'>
					<Button
						variant='outline'
						size='icon'
						onClick={() => {
							window.print();
						}}
					>
						<PrinterIcon />
					</Button>
					<a
						href={article.url}
						target='_blank'
						rel='noreferrer'
						className={buttonVariants({ variant: 'outline', size: 'icon' })}
					>
						<ExternalLinkIcon />
					</a>
					<Link
						to={`/article/comments/?url=${encodeURIComponent(article.url)}`}
						className={buttonVariants({ variant: 'outline', size: 'icon' })}
					>
						<MessageCircleIcon />
					</Link>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline' size='icon'>
							<MoreVerticalIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-40'>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(article.url);
							}}
							className='cursor-pointer'
						>
							<LinkIcon className='mr-2 size-4' />
							<span>Copy link</span>
						</DropdownMenuItem>

						{article.archived ? (
							<DropdownMenuItem
								className='cursor-pointer'
								onClick={async () => {
									db.unArchiveArticle(article.url);
									setArticle({ ...article, archived: false });
								}}
								disabled={offline}
							>
								<ArchiveRestoreIcon className='mr-2 size-4' />
								<span>Unarchive</span>
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								className='cursor-pointer'
								onClick={async () => {
									db.archiveArticle(article.url);
									setArticle({ ...article, archived: true });
								}}
							>
								<ArchiveIcon className='mr-2 size-4' />
								<span>Archive</span>
							</DropdownMenuItem>
						)}

						<DropdownMenuItem
							className='cursor-pointer'
							variant='destructive'
							onClick={async () => {
								navigate('/');
								db.deleteArticle(article.url);
							}}
						>
							<TrashIcon className='mr-2 size-4' />
							<span>Delete</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
