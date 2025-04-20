import { CommandPalette } from '@/components/CommandPalette';
import { CommentViewer } from '@/routes/article/comments/CommentViewer';

export function Comment() {
	return (
		<>
			<CommandPalette />
			<CommentViewer />
		</>
	);
}
