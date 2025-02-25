import { Header } from '@/components/Header';
import { ArticleCommandPalette } from '@/components/ui/ArticleCommandPalette';
import { ArticleViewer } from '@/routes/article/ArticleViewer';

export function Article() {
	return (
		<>
			<Header />
			<ArticleCommandPalette  />
			<ArticleViewer />
		</>
	);
}
