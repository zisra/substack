import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { useSettings } from '@/lib/context/SettingsContext';
import type { Database } from '@/lib/database';
import type { ArticleSaved } from '@/lib/types';
import { cn, fontFormatting } from '@/lib/utils';
import { ArticleControls } from '@/routes/article/ArticleControls';

export function ArticleHeader({
	article,
	db,
	setArticle,
}: {
	article: ArticleSaved;
	db: Database;
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
}) {
	const { settings } = useSettings();

	return (
		<header className='mb-4'>
			<h1
				className={cn(
					fontFormatting(settings),
					'mb-2 font-bold text-4xl text-slate-950 dark:text-slate-50',
				)}
			>
				{article.title}
			</h1>
			<p className={cn(fontFormatting(settings), 'mb-4 text-muted-foreground text-xl')}>
				{article.subtitle}
			</p>
			<div className='flex items-center space-x-2'>
				<a target='_blank' href={article.authorUrl} rel='noreferrer'>
					<Avatar className='pointer-events-none size-6'>
						<AvatarImage src={article?.authorImg} alt='Author' />
						<AvatarFallback>{article.author?.charAt(0)}</AvatarFallback>
					</Avatar>
				</a>
				<div>
					<p className={cn(fontFormatting(settings), 'text-md text-muted-foreground')}>
						<a
							target='_blank'
							href={article.authorUrl}
							rel='noreferrer'
							className='hover:underline'
						>
							{article.author}
						</a>
					</p>
				</div>
			</div>
			<ArticleControls db={db} setArticle={setArticle} article={article} />
		</header>
	);
}
