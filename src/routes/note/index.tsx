import { Header } from '@/components/Header';
import { ArticleCommandPalette } from '@/components/ui/ArticleCommandPalette';
import { NoteViewer } from '@/routes/note/NoteViewer';

export function Note() {
	return (
		<>
			<Header />
			<ArticleCommandPalette />
			<NoteViewer />
		</>
	);
}
