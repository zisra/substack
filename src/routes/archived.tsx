import { ArchivedPosts } from '@/components/ArchivedPosts';
import { Header } from '@/components/Header';
import { Helmet } from 'react-helmet';

export function Archived() {
	return (
		<>
			<Helmet>
				<title>Substack Offline Viewer - Archived</title>
			</Helmet>
			<Header />
			<ArchivedPosts />
		</>
	);
}
