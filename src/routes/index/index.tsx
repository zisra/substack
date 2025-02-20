import { Header } from '@/components/Header';
import { ArticleSaver } from '@/routes/index/ArticleSaver';
import { Helmet } from 'react-helmet-async';

export function Index() {
	return (
		<>
			<Helmet>
				<title>Substack Offline</title>
			</Helmet>
			<Header />
			<ArticleSaver />
		</>
	);
}
