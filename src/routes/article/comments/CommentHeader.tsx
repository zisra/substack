import { Preferences } from '@/components/modals/Preferences';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import type { CommentPage, Settings } from '@/lib/types';
import {
	ArrowLeftIcon,
	DotIcon,
	DownloadIcon,
	MoreVerticalIcon,
	SaveIcon,
	TrashIcon,
} from 'lucide-react';
import { Link } from 'react-router';

export function CommentHeader({
	commentPage,
	url,
	onSave,
	onDelete,
	onSettingsChange,
	downloaded,
}: {
	commentPage: CommentPage;
	url: string | null;
	onSave: () => void;
	onDelete: () => void;
	onSettingsChange: (settings: Settings) => void;
	downloaded: boolean;
}) {
	return (
		<header className='mb-4'>
			<h1 className='mb-2 font-bold text-slate-950 text-xl dark:text-slate-50'>
				{commentPage.title}
			</h1>
			<p className='mb-4 text-neutral-500 dark:text-neutral-400'>
				<a
					target='_blank'
					href={commentPage.authorUrl}
					rel='noreferrer'
					className='hover:underline'
				>
					<span>{commentPage.author}</span>
				</a>
				<DotIcon className='mx-0 inline-block px-0' />
				<span>{commentPage.subtitle}</span>
			</p>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-4'>
					<Link to={`/article/?url=${url}`} className={buttonVariants({ variant: 'outline' })}>
						<ArrowLeftIcon />
						Read
					</Link>
					<Preferences onSettingsChange={onSettingsChange} />
					{downloaded && (
						<Button size='sm' variant='secondary' disabled>
							<DownloadIcon className='mr-2 size-4' />
							Downloaded
						</Button>
					)}
				</div>
				<div className='flex items-center space-x-4'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' size='icon'>
								<MoreVerticalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem className='cursor-pointer' onClick={onSave}>
								<SaveIcon className='mr-2 size-4' />
								Save
							</DropdownMenuItem>
							{downloaded && (
								<DropdownMenuItem
									onClick={onDelete}
									className='cursor-pointer'
									variant='destructive'
								>
									<TrashIcon className='mr-2 size-4' />
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<Separator className='my-2' />
		</header>
	);
}
