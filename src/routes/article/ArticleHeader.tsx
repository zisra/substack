import { Avatar, AvatarImage } from '@/components/ui/avatar';
import type { Database } from '@/lib/database';
import type { ArticleSaved, Settings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArticleControls } from '@/routes/article/ArticleControls';

export function ArticleHeader({
	article,
	db,
	setArticle,
	onSettingsChange,
	failed,
	fontFamily,
}: {
	article: ArticleSaved;
	db: Database;
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
	onSettingsChange: (settings: Settings) => void;
	failed: boolean;
	fontFamily?: string;
}) {
	return (
		<header className='mb-4'>
			<h1
				className={cn(
					fontFamily === 'sans' && 'font-sans',
					fontFamily === 'serif' && 'font-serif',
					fontFamily === 'mono' && 'font-mono',
					'text-4xl font-bold mb-2 text-slate-950 dark:text-slate-50',
				)}
			>
				{article?.title}
			</h1>
			<p
				className={cn(
					fontFamily === 'sans' && 'font-sans',
					fontFamily === 'serif' && 'font-serif',
					fontFamily === 'mono' && 'font-mono',
					'text-xl text-neutral-500 dark:text-neutral-400 mb-4',
				)}
			>
				{article?.subtitle}
			</p>
			<div className='flex items-center space-x-2'>
				<a target='_blank' href={article.authorUrl ?? ''} rel='noreferrer'>
					<Avatar className='pointer-events-none size-6'>
						<AvatarImage src={article?.authorImg} alt='Author' />
					</Avatar>
				</a>
				<div>
					<p
						className={cn(
							fontFamily === 'sans' && 'font-sans',
							fontFamily === 'serif' && 'font-serif',
							fontFamily === 'mono' && 'font-mono',
							'text-md text-neutral-500 dark:text-neutral-400',
						)}
					>
						<a
							target='_blank'
							href={article.authorUrl ?? ''}
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
				failed={failed}
			/>
		</header>
	);
}
