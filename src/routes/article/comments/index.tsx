import { CommandPalette } from '@/components/CommandPalette';
import { Header } from '@/components/Header';
import { CommentViewer } from '@/routes/article/comments/CommentViewer';

export function Comment() {
	return (
		<>
			<Header />
			<CommandPalette />
			<CommentViewer />
		</>
	);
}
