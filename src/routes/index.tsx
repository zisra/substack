import { Header } from '@/components/Header';
import { OfflineArticleSaver } from '@/components/OfflineArticleSaver';
import { Helmet } from 'react-helmet';

export function Index() {
	return (
		<>
			<Helmet>
				<title>Substack Offline</title>
			</Helmet>
			<Header />
			<OfflineArticleSaver />
		</>
	);
}
