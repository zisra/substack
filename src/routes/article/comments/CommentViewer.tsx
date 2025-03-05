import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

interface CommentData {
	name: string;
	photo_url: string;
	handle: string;
	body: string;
	children: CommentData[];
}

export default function CommentList({ comments }: { comments: CommentData[] }) {
	return (
		<div className="space-y-6 max-w-2xl mx-auto">
			{comments.map((comment) => (
				<Comment key={comment.handle} comment={comment} />
			))}
		</div>
	);
}

function Comment({
	comment: { name, photo_url, handle, body, children },
}: {
	comment: CommentData;
}) {
	const [isCollapsed, setIsCollapsed] = useState(false); // Track collapsed state
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
							className="relative h-full bg-gray-200 dark:bg-gray-700 mt-2 mb-1 hover:bg-gray-400 hover:cursor-pointer transition-all transition-50 w-px"
						>
							<div className="absolute -left-2 -right-2 top-0 bottom-0 h-full" />
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

					{!isCollapsed && (
						<div className="prose prose-sm dark:prose-invert whitespace-pre-line">
							{body ? body : <em>Comment deleted</em>}
						</div>
					)}

					{!isCollapsed && (
						<div className="space-y-0 mt-3 pl-3">
							{children.map((childComment) => (
								<Comment key={childComment.handle} comment={childComment} />
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
	const [comments, setComments] = useState<CommentData[]>([]);
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

				setComments(await response.json());
			} catch (error) {
				console.error('Error fetching comments:', error);
			}
		};

		fetchData();
	}, [url, navigate]);

	return (
		<div className="space-y-6 max-w-6xl p-4 mx-auto">
			<CommentList comments={comments} />
		</div>
	);
}
