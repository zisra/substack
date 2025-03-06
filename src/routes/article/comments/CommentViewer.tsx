import { AlertCard } from '@/components/AlertCard';
import { Linkify } from '@/components/Linkify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Comment, CommentPage } from '@/lib/types';
import { MessageCircleOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CommentHeader } from './CommentHeader';

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
		<>
			{comments.slice(0, commentPage * 10).map((comment) => (
				<CommentView key={comment.handle} comment={comment} />
			))}
			{commentPage < maxPage && (
				<Button
					onClick={() => setCommentPage((prev) => prev + 1)}
					variant="outline"
					size="sm"
				>
					Load more comments
				</Button>
			)}
		</>
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
		<div className="my-4">
			<div className="flex gap-2.5">
				<div className="flex flex-col items-center">
					<a href={substackUrl} target="_blank" rel="noreferrer">
						<Avatar className="size-6 flex-shrink-0">
							<AvatarImage src={photo_url} alt={name} />
							<AvatarFallback>{name?.charAt(0)}</AvatarFallback>
						</Avatar>
					</a>

					{!isCollapsed && (
						<div
							onClick={toggleCollapse}
							onKeyDown={toggleCollapse}
							className="relative h-full bg-neutral-200 dark:bg-neutral-700 mt-2 hover:bg-neutral-400 dark:hover:bg-neutral-500 hover:cursor-pointer transition-all transition-50 w-px"
						>
							<div className="absolute -left-3 -right-3 top-0 bottom-0 h-full" />
						</div>
					)}
				</div>

				<div className="flex-1 space-y-1.5">
					<div>
						<a
							href={substackUrl}
							target="_blank"
							rel="noreferrer"
							className="text-sm font-medium hover:underline"
						>
							{name ? name : 'Comment deleted'}
						</a>
					</div>

					{!isCollapsed &&
						(body ? (
							<Linkify
								text={body}
								className="prose prose-sm dark:prose-invert whitespace-pre-line break-words max-w-none"
							/>
						) : (
							<div className="prose prose-sm dark:prose-invert">
								<em>Comment deleted</em>
							</div>
						))}

					{!isCollapsed && children.length !== 0 && (
						<div className="space-y-0 mt-3 pl-3">
							{children.map((childComment) => (
								<CommentView key={childComment.handle} comment={childComment} />
							))}
						</div>
					)}

					{isCollapsed && (
						<Button onClick={toggleCollapse} variant="outline" size="sm">
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
	const [title, setTitle] = useState<string>('');

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const url = searchParams.get('url');

	useEffect(() => {
		const fetchData = async () => {
			if (!url) {
				navigate('/');
				return;
			}

			try {
				const response = await fetch(
					`/download-comments/?url=${encodeURIComponent(url)}`
				);

				if (!response.ok) {
					navigate('/');
					throw new Error('Failed to download note');
				}

				const commentPage: CommentPage = await response.json();

				if (commentPage.title) {
					setTitle(commentPage.title);
				}

				setCommentPage(commentPage);
			} catch (error) {
				console.error('Error fetching comments:', error);
			}
		};

		fetchData();
	}, [url, navigate]);

	return (
		<>
			<title>{title}</title>
			<div className="max-w-3xl mx-auto px-4 py-8">
				{commentPage && <CommentHeader commentPage={commentPage} url={url} />}
				<CommentList comments={commentPage?.comments} />
			</div>
		</>
	);
}
