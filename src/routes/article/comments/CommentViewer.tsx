import { AlertCard } from '@/components/AlertCard';
import { Linkify } from '@/components/Linkify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database';
import type { Comment, CommentPage, Settings } from '@/lib/types';
import { CommentHeader } from '@/routes/article/comments/CommentHeader';
import { MessageCircleOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

export default function CommentList({ comments }: { comments?: Comment[] }) {
	if (!comments || !comments.length) {
		return (
			<AlertCard title={'No comments'} icon={<MessageCircleOffIcon />}>
				No comments found for this article.
			</AlertCard>
		);
	}

	const [commentPage, setCommentPage] = useState(1);
	const maxPage = Math.ceil(comments.length / 10);

	return (
		<div className='mx-auto max-w-3xl'>
			{comments.slice(0, commentPage * 10).map((comment) => (
				<CommentView key={comment.handle} comment={comment} />
			))}
			{commentPage < maxPage && (
				<Button
					onClick={() => setCommentPage((prev) => prev + 1)}
					variant='outline'
					size='sm'
					className='mt-4'
				>
					Load more comments
				</Button>
			)}
		</div>
	);
}

function CommentView({
	comment: { name, photo_url, handle, body, children },
}: {
	comment: Comment;
}) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const substackUrl = `https://substack.com/@${handle}`;

	const toggleCollapse = () => {
		setIsCollapsed((prev) => !prev);
	};

	return (
		<div className='mt-2 max-w-3xl'>
			<div className='flex gap-2.5'>
				<div className='flex flex-col items-center'>
					{handle ? (
						<a href={substackUrl} target='_blank' rel='noreferrer'>
							<Avatar className='size-6 flex-shrink-0'>
								<AvatarImage src={photo_url} alt={name} />
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

export function CommentViewer() {
	const [commentPage, setCommentPage] = useState<CommentPage | null>(null);
	const [settings, setSettings] = useState<Settings | null>(null);
	const [title, setTitle] = useState<string>('');

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const url = searchParams.get('url');
	const db = new Database();

	useEffect(() => {
		const fetchData = async () => {
			if (!url) {
				navigate('/');
				return;
			}

			try {
				await db.open();
				const article = await db.getArticle(url);
				const settings = await db.getSettings();

				if (settings) {
					setSettings(settings);
				}

				if (article && (article?.comments?.length ?? 0) > 0) {
					setTitle(`${article.title} - Comments`);

					setCommentPage({
						title: article.title,
						subtitle: article.subtitle,
						author: article.author,
						authorUrl: article.authorUrl,
						comments: article.comments,
					});

					if (settings?.saveComments === true && url) {
						db.saveComments(url, article.comments);
					}
				} else {
					const response = await fetch(`/download-comments/?url=${encodeURIComponent(url)}`);

					if (!response.ok) {
						navigate('/');
						throw new Error('Failed to download note');
					}

					const commentPage: CommentPage = await response.json();

					if (commentPage.title) {
						setTitle(`${commentPage.title} - Comments`);
					}

					setCommentPage(commentPage);

					if (settings?.saveComments === true && url) {
						db.saveComments(url, commentPage.comments);
					}
				}
			} catch (error) {
				console.error('Error fetching comments:', error);
			}
		};

		fetchData();
	}, [url, navigate]);

	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<title>{title}</title>
			{commentPage && (
				<CommentHeader
					isSaved={settings?.saveComments === true}
					onDelete={() => {
						if (url) {
							db.open();
							db.deleteComments(url);
						}
					}}
					onSave={() => {
						if (url && commentPage.comments) {
							db.open();
							db.saveComments(url, commentPage.comments);
						}
					}}
					commentPage={commentPage}
					url={url}
					onSettingsChange={setSettings}
				/>
			)}
			<CommentList comments={commentPage?.comments} />
		</div>
	);
}
