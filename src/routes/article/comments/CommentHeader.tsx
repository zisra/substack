import { Formatting } from '@/components/modals/Formatting';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CommentPage, Settings } from '@/lib/types';
import { ArrowLeftIcon, DotIcon } from 'lucide-react';
import { Link } from 'react-router';

export function CommentHeader({
	commentPage,
	url,
	onSave,
	onDelete,
	isSaved,
	onSettingsChange,
}: {
	commentPage: CommentPage;
	url: string | null;
	isSaved: boolean;
	onSave: () => void;
	onDelete: () => void;
	onSettingsChange: (settings: Settings) => void;
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
					{commentPage.author}
				</a>
				<DotIcon className='mx-0 inline-block px-0' />
				{commentPage.subtitle}
			</p>
			<div className='flex items-center justify-between'>
				<div className='space-x-4'>
					<Link to={`/article/?url=${url}`} className={buttonVariants({ variant: 'outline' })}>
						<ArrowLeftIcon />
						Read
					</Link>
					<Formatting onSettingsChange={onSettingsChange} />
				</div>

				<div className='flex items-center space-x-4'>
					{isSaved ? null : (
						<>
							<Button onClick={onSave} variant='outline'>
								Save
							</Button>
							<Button onClick={onDelete} variant='destructive'>
								Delete
							</Button>
						</>
					)}
				</div>
			</div>
			<Separator className='my-2' />
		</header>
	);
}
