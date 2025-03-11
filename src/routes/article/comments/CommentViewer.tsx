import { AlertCard } from '@/components/AlertCard';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database';
import type { Comment, CommentPage, Settings } from '@/lib/types';
import { CommentHeader } from '@/routes/article/comments/CommentHeader';
import { LoaderIcon, MessageCircleOffIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CommentView } from './CommentView';

export default function CommentList({ comments }: { comments?: Comment[] }) {
	if (!comments) {
		return <LoaderIcon className='mx-auto mt-8 animate-spin' />;
	}

	if (!comments.length) {
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

				if (article) {
					if ((article?.comments?.length ?? 0) > 0) {
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
						setCommentPage({ ...article, comments: undefined });

						if (article.title) {
							setTitle(`Comments - ${article.title}`);
						}

						const response = await fetch(`/download-comments/?url=${encodeURIComponent(url)}`);

						if (!response.ok) {
							navigate('/');
							throw new Error('Failed to download note');
						}

						const commentPage: CommentPage = await response.json();

						setCommentPage(commentPage);

						if (settings?.saveComments === true && url && commentPage.comments) {
							db.saveComments(url, commentPage.comments);
						}
					}
				} else {
					const response = await fetch(`/download-comments/?url=${encodeURIComponent(url)}`);

					if (!response.ok) {
						navigate('/');
						throw new Error('Failed to download note');
					}

					const commentPage: CommentPage = await response.json();

					if (commentPage.title) {
						setTitle(`Comments - ${commentPage.title}`);
					}

					setCommentPage(commentPage);

					if (settings?.saveComments === true && url && commentPage.comments) {
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
					downloaded={settings?.saveComments === true}
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
