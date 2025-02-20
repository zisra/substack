import { Header } from '@/components/Header';
import { ArchivedPosts } from '@/routes/archived/ArchivedPosts';
import { Helmet } from 'react-helmet-async';

export function Archived() {
	return (
		<>
			<Helmet>
				<title>Substack Offline - Archived</title>
			</Helmet>
			<Header />
			<ArchivedPosts />
		</>
	);
}
