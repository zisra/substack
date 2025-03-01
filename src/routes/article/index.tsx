import { CommandPalette } from '@/components/CommandPalette';
import { Header } from '@/components/Header';
import { ArticleViewer } from '@/routes/article/ArticleViewer';

export function Article() {
	return (
		<>
			<Header />
			<CommandPalette />
			<ArticleViewer />
		</>
	);
}
