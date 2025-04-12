import { CommandPalette } from '@/components/CommandPalette';
import { ArticleViewer } from '@/routes/article/ArticleViewer';

export function Article() {
	return (
		<>
			<CommandPalette />
			<ArticleViewer />
		</>
	);
}
