import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
	return (
		<>
			<Separator className='my-2 print:hidden' />
			<div className='text-center pt-4 print:hidden'>
				{!article.archived ? (
					<Button
						onClick={async () => {
							await db.open();
							db.archiveArticle(article.url);
							setArticle({ ...article, archived: true });
						}}
					>
						<ArchiveIcon /> Finished reading
					</Button>
				) : (
					<Button
						onClick={async () => {
							await db.open();
							db.unArchiveArticle(article.url);
							setArticle({ ...article, archived: false });
						}}
					>
						<ArchiveXIcon /> Continue reading
					</Button>
				)}
			</div>
		</>
	);
}
