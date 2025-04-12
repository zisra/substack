import { CommandPalette } from '@/components/CommandPalette';
import { Header } from '@/components/Header';
import { ArticleSaver } from '@/routes/index/ArticleSaver';
import { useState } from 'react';

export function Index() {
	const [commandOpen, setCommandOpen] = useState(false);

	return (
		<>
			<title>Substack Offline</title>

			<Header />
			<CommandPalette openCommand={commandOpen} setOpenCommand={setCommandOpen} />
			<ArticleSaver openCommand={() => setCommandOpen(true)} />
		</>
	);
}
