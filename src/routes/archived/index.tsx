import { CommandPalette } from '@/components/CommandPalette';
import { Header } from '@/components/Header';
import { ArchivedPosts } from '@/routes/archived/ArchivedPosts';
import { ScrollRestoration } from 'react-router';

export function Archived() {
	return (
		<>
			<title>Substack Offline - Archived</title>

			<Header />
			<CommandPalette />
			<ArchivedPosts />

			<ScrollRestoration
				getKey={(location) => {
					return location.pathname;
				}}
			/>
		</>
	);
}
