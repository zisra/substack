import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
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
