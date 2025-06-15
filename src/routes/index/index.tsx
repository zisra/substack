import { CommandPalette } from '@/components/CommandPalette';
import { Header } from '@/components/Header';
import type { ArticleSaved } from '@/lib/types';
import { ArticleSaver } from '@/routes/index/ArticleSaver';
import { useState } from 'react';
import { ScrollRestoration, useLoaderData } from 'react-router';

export function Index() {
	const [commandOpen, setCommandOpen] = useState(false);
	const { articles } = useLoaderData() as { articles: ArticleSaved[] };

	return (
		<>
			<title>Substack Offline</title>

			<Header />
			<CommandPalette openCommand={commandOpen} setOpenCommand={setCommandOpen} />
			<ArticleSaver openCommand={() => setCommandOpen(true)} articles={articles} />

			<ScrollRestoration
				getKey={(location) => {
					return location.pathname;
				}}
			/>
		</>
	);
}
