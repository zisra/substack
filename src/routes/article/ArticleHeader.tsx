import { Avatar, AvatarImage } from '@/components/ui/avatar';
import type { Database } from '@/lib/database';
import type { ArticleSaved, Settings } from '@/lib/types';
import { cn, fontFormatting } from '@/lib/utils';
import { ArticleControls } from '@/routes/article/ArticleControls';
import { AvatarFallback } from '@radix-ui/react-avatar';

export function ArticleHeader({
	article,
	db,
	setArticle,
	onSettingsChange,
	settings,
}: {
	article: ArticleSaved;
	db: Database;
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
	onSettingsChange: (settings: Settings) => void;
	settings: Settings | null;
}) {
	return (
		<header className='mb-4'>
			<h1
				className={cn(
					fontFormatting(settings),
					'text-4xl font-bold mb-2 text-slate-950 dark:text-slate-50',
				)}
			>
				{article?.title}
			</h1>
			<p
				className={cn(
					fontFormatting(settings),
					'text-xl text-neutral-500 dark:text-neutral-400 mb-4',
				)}
			>
				{article?.subtitle}
			</p>
			<div className='flex items-center space-x-2'>
				<a target='_blank' href={article.authorUrl} rel='noreferrer'>
					<Avatar className='pointer-events-none size-6'>
						<AvatarImage src={article?.authorImg} alt='Author' />
						<AvatarFallback>{article.author?.charAt(0)}</AvatarFallback>
					</Avatar>
				</a>
				<div>
					<p
						className={cn(
							fontFormatting(settings),
							'text-md text-neutral-500 dark:text-neutral-400',
						)}
					>
						<a
							target='_blank'
							href={article.authorUrl}
							rel='noreferrer'
							className='hover:underline'
						>
							{article?.author}
						</a>
					</p>
				</div>
			</div>
			<ArticleControls
				onSettingsChange={onSettingsChange}
				db={db}
				setArticle={setArticle}
				article={article}
			/>
		</header>
	);
}
