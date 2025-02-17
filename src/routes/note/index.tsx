import { Header } from '@/components/Header';
import { NoteViewer } from '@/routes/note/NoteViewer';

export function Note() {
	return (
		<>
			<Header />
			<NoteViewer />
		</>
	);
}
