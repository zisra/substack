import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ArchivedPosts } from '@/routes/archived/ArchivedPosts';
import { Helmet } from 'react-helmet-async';

export function Archived() {
	return (
		<>
			<Helmet>
				<title>Substack Offline - Archived</title>
			</Helmet>
			<CommandPalette />
			<Header />
			<ArchivedPosts />
		</>
	);
}
