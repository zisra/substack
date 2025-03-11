import { Linkify } from '@/components/Linkify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Comment } from '@/lib/types';
import { useState } from 'react';

export function CommentView({
	comment: { name, photo_url, handle, body, children },
}: {
	comment: Comment;
}) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const substackUrl = `https://substack.com/@${handle}`;

	const toggleCollapse = () => {
		setIsCollapsed((prev) => !prev);
	};

	if (photo_url) {
		photo_url = `https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_webp,q_auto:good,fl_progressive:steep/${encodeURIComponent(
			photo_url,
		)}`;
	} else {
		photo_url =
			'https://substackcdn.com/image/fetch/w_64,h_64,c_fill,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack.com%2Fimg%2Favatars%2Fpurple.png';
	}

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
							className='relative mt-2 h-full w-px bg-neutral-200 transition-50 transition-all hover:cursor-pointer hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-500'
						>
							<div className='-left-3 -right-3 absolute top-0 bottom-0 h-full' />
						</div>
					)}
				</div>

				<div className='max-w-full flex-1 space-y-1.5 overflow-hidden'>
					<div>
						{name ? (
							<a
								href={substackUrl}
								target='_blank'
								rel='noreferrer'
								className='font-medium text-sm hover:underline'
							>
								{name}
							</a>
						) : (
							<span className='font-medium text-sm'>Comment deleted</span>
						)}
					</div>

					{!isCollapsed &&
						(body ? (
							<Linkify
								text={body}
								className='prose prose-sm dark:prose-invert max-w-full whitespace-pre-line break-words'
							/>
						) : (
							<div className='prose prose-sm dark:prose-invert'>
								<em>Comment deleted</em>
							</div>
						))}

					{!isCollapsed && children.length !== 0 && (
						<div className='mt-3 max-w-full space-y-0 pl-1'>
							{children.map((childComment) => (
								<CommentView key={childComment.handle} comment={childComment} />
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
