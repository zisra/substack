import { Button } from '@/components/ui/button';
import {
	Credenza,
	CredenzaClose,
	CredenzaContent,
	CredenzaDescription,
	CredenzaFooter,
	CredenzaHeader,
	CredenzaTitle,
	CredenzaTrigger,
} from '@/components/ui/credenza';
import type { Database } from '@/lib/database';
import type { ArticleSaved } from '@/lib/types';

export function DeleteArchivedPosts({
	articles,
	setArticles,
	db,
}: {
	articles: ArticleSaved[];
	setArticles: React.Dispatch<React.SetStateAction<ArticleSaved[]>>;
	db: Database;
}) {
	return (
		<Credenza>
			<CredenzaTrigger asChild>
				<Button size="sm" variant="destructive" disabled={articles.length === 0}>
					Delete All Archived
				</Button>
			</CredenzaTrigger>
			<CredenzaContent>
				<CredenzaHeader>
					<CredenzaTitle>Are you sure?</CredenzaTitle>
					<CredenzaDescription>
						This action cannot be undone. This will permanently delete all your archived articles
					</CredenzaDescription>
				</CredenzaHeader>
				<CredenzaFooter>
					<CredenzaClose asChild>
						<Button variant="outline">Cancel</Button>
					</CredenzaClose>
					<CredenzaClose asChild>
						<Button
							variant="destructive"
							onClick={async () => {
								await db.open();
								await Promise.all(articles.map((article) => db.deleteArticle(article.url)));
								setArticles([]);
							}}
						>
							Delete
						</Button>
					</CredenzaClose>
				</CredenzaFooter>
			</CredenzaContent>
		</Credenza>
	);
}
