import { Header } from '@/components/Header';
import { ArticleCommandPalette } from '@/components/ui/ArticleCommandPalette';
import { ArticleSaver } from '@/routes/index/ArticleSaver';
import { Helmet } from 'react-helmet-async';

export function Index() {
	return (
		<>
			<Helmet>
				<title>Substack Offline</title>
			</Helmet>
			<ArticleCommandPalette />
			<Header />
			<ArticleSaver />
		</>
	);
}
