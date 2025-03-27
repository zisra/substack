import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsOffline } from '@/hooks/useIsOffline';
import type { Database } from '@/lib/database';
import type { ArticleSaved } from '@/lib/types';
import { ArchiveIcon, ArchiveXIcon } from 'lucide-react';

export function FinishedReadingButton({
	setArticle,
	article,
	db,
}: {
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
	article: ArticleSaved;
	db: Database;
}) {
	const offline = useIsOffline();

	return (
		<>
			<Separator className='print:hidden! my-2' />
			<div className='pt-4 text-center print:hidden'>
				{!article.archived ? (
					<Button
						onClick={async () => {
							db.archiveArticle(article.url);
							setArticle({ ...article, archived: true });
						}}
					>
						<ArchiveIcon /> Finished reading
					</Button>
				) : (
					<Button
						onClick={async () => {
							db.unArchiveArticle(article.url);
							setArticle({ ...article, archived: false });
						}}
						disabled={offline}
					>
						<ArchiveXIcon /> Continue reading
					</Button>
				)}
			</div>
		</>
	);
}
