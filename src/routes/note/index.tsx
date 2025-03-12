import { CommandPalette } from '@/components/CommandPalette';
import { NoteViewer } from '@/routes/note/NoteViewer';

export function Note() {
	return (
		<>
			<CommandPalette />
			<NoteViewer />
		</>
	);
}
