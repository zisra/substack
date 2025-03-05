import { AlertCard } from '@/components/AlertCard';
import { Linkify } from '@/components/Linkify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Comment, CommentPage } from '@/lib/types';
import { Separator } from '@radix-ui/react-select';
import { ArrowRightIcon, MessageCircleOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

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
		<div className="space-y-6 max-w-2xl mx-auto">
			{comments.slice(0, commentPage * 5).map((comment) => (
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
		<div className="mt-4">
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
								className="prose prose-sm dark:prose-invert whitespace-pre-line max-w-none break-words"
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

function CommentHeader({
	commentPage,
	url,
}: {
	commentPage: CommentPage;
	url: string | null;
}) {
	return (
		<header className="mb-4">
			<h1 className="text-4xl font-bold mb-2 text-slate-950 dark:text-slate-50">
				{commentPage.title}
			</h1>
			<p className="text-xl text-neutral-500 dark:text-neutral-400 mb-4">
				{commentPage.subtitle}
			</p>
			<div className="flex items-center space-x-2">
				<div>
					<p className="text-md text-neutral-500 dark:text-neutral-400">
						<a
							target="_blank"
							href={commentPage.authorUrl}
							rel="noreferrer"
							className="hover:underline"
						>
							{commentPage.author}
						</a>
					</p>
					<Link
						to={`/article?url=${url}`}
						className="text-sm text-neutral-500 dark:text-neutral-400 hover:underline flex items-center gap-1"
					>
						Read more <ArrowRightIcon className="h-3 w-3" />
					</Link>
				</div>
			</div>
		</header>
	);
}

export function CommentViewer() {
	const [commentPage, setCommentPage] = useState<CommentPage | null>(null);

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

				const commentPage = await response.json();

				setCommentPage(commentPage);
			} catch (error) {
				console.error('Error fetching comments:', error);
			}
		};

		fetchData();
	}, [url, navigate]);

	return (
		<div className="space-y-6">
			{commentPage && <CommentHeader commentPage={commentPage} url={url} />}
			<Separator className="my-2" />
			<CommentList comments={commentPage?.comments} />
		</div>
	);
}
