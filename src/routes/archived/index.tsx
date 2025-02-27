import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ArchivedPosts } from '@/routes/archived/ArchivedPosts';

export function Archived() {
	return (
		<>
			<title>Substack Offline - Archived</title>

			<CommandPalette />
			<Header />
			<ArchivedPosts />
		</>
	);
}
