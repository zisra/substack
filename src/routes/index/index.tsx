import { Header } from '@/components/Header';
import { ArticleCommandPalette } from '@/components/ui/ArticleCommandPalette';
import { ArticleSaver } from '@/routes/index/ArticleSaver';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

export function Index() {
	const [commandOpen, setCommandOpen] = useState(false);

	return (
		<>
			<Helmet>
				<title>Substack Offline</title>
			</Helmet>
			<ArticleCommandPalette
				openCommand={commandOpen}
				setOpenCommand={setCommandOpen}
			/>
			<Header />
			<ArticleSaver openCommand={() => setCommandOpen(true)} />
		</>
	);
}
