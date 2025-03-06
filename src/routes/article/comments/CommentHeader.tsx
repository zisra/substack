import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CommentPage } from '@/lib/types';
import { ArrowRightIcon, DotIcon } from 'lucide-react';
import { Link } from 'react-router';

export function CommentHeader({
	commentPage,
	url,
}: {
	commentPage: CommentPage;
	url: string | null;
}) {
	return (
		<header className="mb-4">
			<h1 className="text-xl font-bold mb-2 text-slate-950 dark:text-slate-50">
				{commentPage.title}
			</h1>
			<p className="text-neutral-500 dark:text-neutral-400 mb-4">
				<a
					target="_blank"
					href={commentPage.authorUrl}
					rel="noreferrer"
					className="hover:underline"
				>
					{commentPage.author}
				</a>
				<DotIcon className="px-0 mx-0 inline-block" />
				{commentPage.subtitle}
			</p>
			<Button asChild variant="outline">
				<Link to={`/article?url=${url}`}>
					Read <ArrowRightIcon className="h-3 w-3" />
				</Link>
			</Button>
			<Separator className="my-2" />
		</header>
	);
}
