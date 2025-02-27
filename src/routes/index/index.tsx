import { Header } from '@/components/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { ArticleSaver } from '@/routes/index/ArticleSaver';
import { useState } from 'react';

export function Index() {
	const [commandOpen, setCommandOpen] = useState(false);

	return (
		<>
			<title>Substack Offline</title>

			<CommandPalette openCommand={commandOpen} setOpenCommand={setCommandOpen} />
			<Header />
			<ArticleSaver openCommand={() => setCommandOpen(true)} />
		</>
	);
}
