import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { NoteViewer } from '@/routes/note/NoteViewer';

export function Note() {
	return (
		<>
			<Header />
			<CommandPalette />
			<NoteViewer />
		</>
	);
}
