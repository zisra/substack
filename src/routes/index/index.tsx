import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
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
			<CommandPalette openCommand={commandOpen} setOpenCommand={setCommandOpen} />
			<Header />
			<ArticleSaver openCommand={() => setCommandOpen(true)} />
		</>
	);
}
