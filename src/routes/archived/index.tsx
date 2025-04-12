import { CommandPalette } from '@/components/CommandPalette';
import { Header } from '@/components/Header';
import { ArchivedPosts } from '@/routes/archived/ArchivedPosts';

export function Archived() {
	return (
		<>
			<title>Substack Offline - Archived</title>

			<Header />
			<CommandPalette />
			<ArchivedPosts />
		</>
	);
}
