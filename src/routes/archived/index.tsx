import { CommandPalette } from '@/components/CommandPalette';
import { ArchivedPosts } from '@/routes/archived/ArchivedPosts';

export function Archived() {
	return (
		<>
			<title>Substack Offline - Archived</title>

			<CommandPalette />
			<ArchivedPosts />
		</>
	);
}
