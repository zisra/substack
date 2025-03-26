import { Linkify } from '@/components/Linkify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Comment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Edit2Icon, ExternalLinkIcon, LinkIcon, MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';

export function CommentView({
	comment: { name, photo_url, handle, body, children, id, incompleteProfile },
	url,
}: {
	comment: Comment;
	url: string | null;
}) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isExpanded, setIsExpanded] = useState(body?.length < 1200);
	const [editedName, setEditedName] = useState<string | ''>('');

	const commentUrl = `${url}/comment/${id}`;
	let substackUrl = `https://substack.com/@${handle}`;

	if (incompleteProfile) {
		substackUrl = `https://substack.com/profile/${handle}`;
	}

	const toggleCollapse = () => setIsCollapsed((prev) => !prev);
	const toggleExpand = () => setIsExpanded((prev) => !prev);

	// Ensure Substack images use proper sizing
	photo_url = photo_url
		? `https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_webp,q_auto:good,fl_progressive:steep/${encodeURIComponent(
				photo_url,
			)}`
		: 'https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack.com%2Fimg%2Favatars%2Fpurple.png';

	return (
		<div className='mt-2 max-w-3xl'>
			<div className='flex gap-2.5'>
				<div className='flex flex-col items-center'>
					{handle ? (
						<a href={substackUrl} target='_blank' rel='noreferrer'>
							<Avatar className='size-6 flex-shrink-0'>
								<AvatarImage loading='lazy' src={photo_url} alt={name} />
								<AvatarFallback>{name?.charAt(0)}</AvatarFallback>
							</Avatar>
						</a>
					) : (
						<Avatar className='size-6 flex-shrink-0'>
							<AvatarFallback />
						</Avatar>
					)}

					{!isCollapsed && (
						<div
							onClick={toggleCollapse}
							onKeyDown={toggleCollapse}
							className='relative mt-2 h-full w-px bg-input transition-50 transition-all hover:cursor-pointer hover:bg-neutral-400 dark:hover:bg-neutral-600'
						>
							<div className='-left-3 -right-3 absolute top-0 bottom-0 h-full' />
						</div>
					)}
				</div>

				<div className='max-w-full flex-1 space-y-1.5 overflow-hidden'>
					<div className='flex items-center justify-between'>
						{name ? (
							<span>
								<a
									href={substackUrl}
									target='_blank'
									rel='noreferrer'
									className='font-medium text-sm hover:underline'
								>
									{editedName ? editedName : name}
								</a>{' '}
								{editedName && <span className='text-muted-foreground text-sm'>({name})</span>}
							</span>
						) : (
							<span className='font-medium text-sm'>Comment deleted</span>
						)}

						<Dialog>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<div className='hover:cursor-pointer print:hidden'>
										<MoreHorizontalIcon className='size-4' />
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<a href={commentUrl} target='_blank' rel='noreferrer'>
										<DropdownMenuItem className='cursor-pointer'>
											<ExternalLinkIcon className='mr-2 size-4' />
											<span>Open</span>
										</DropdownMenuItem>
									</a>
									<DropdownMenuItem
										onClick={() => {
											navigator.clipboard.writeText(commentUrl);
										}}
										className='cursor-pointer'
									>
										<LinkIcon className='mr-2 size-4' />
										<span>Copy link</span>
									</DropdownMenuItem>
									<DialogTrigger asChild>
										<DropdownMenuItem className='cursor-pointer'>
											<Edit2Icon className='mr-2 size-4' />
											<span>Edit name</span>
										</DropdownMenuItem>
									</DialogTrigger>
								</DropdownMenuContent>
							</DropdownMenu>

							<DialogContent>
								<DialogHeader>
									<DialogTitle>Edit name</DialogTitle>
									<DialogDescription>
										You can edit the name of the user who posted this comment. What would you like
										to change it to?
									</DialogDescription>
								</DialogHeader>
								<div className='grid flex-1 gap-2'>
									<Label htmlFor='name' className='sr-only'>
										Name
									</Label>
									<Input
										id='name'
										value={editedName}
										maxLength={50}
										placeholder={name}
										onChange={(e) => setEditedName(e.target.value)}
									/>
								</div>
								<DialogFooter>
									<Button variant='secondary' type='button' onClick={() => setEditedName(name)}>
										Reset
									</Button>
									<Button type='submit'>Confirm</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					{!isCollapsed &&
						(body ? (
							<div
								className={cn(
									'relative max-w-full',
									!isExpanded && 'max-h-60 overflow-hidden print:max-h-none print:overflow-auto',
								)}
							>
								<Linkify
									text={body}
									className='prose prose-sm dark:prose-invert max-w-full whitespace-pre-line break-words'
								/>
								{!isExpanded && (
									<div className='absolute bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent pt-12 text-center print:hidden'>
										<button
											type='button'
											onClick={toggleExpand}
											className='font-bold text-neutral-700 text-xs transition-50 hover:cursor-pointer hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100'
										>
											Expand full comment
										</button>
									</div>
								)}
							</div>
						) : (
							<div className='prose prose-sm dark:prose-invert'>
								<em>Comment deleted</em>
							</div>
						))}

					{!isCollapsed && children.length !== 0 && (
						<div className='mt-3 max-w-full space-y-0 pl-1'>
							{children.map((childComment) => (
								<CommentView key={childComment.handle} comment={childComment} url={url} />
							))}
						</div>
					)}

					{isCollapsed && (
						<Button onClick={toggleCollapse} variant='outline' size='sm'>
							Show comment
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
