import { ThemeProvider } from '@/components/ThemeProvider';
import { Archived } from '@/routes/archived';
import { Article } from '@/routes/article';
import { Index } from '@/routes/index';
import { Note } from '@/routes/note';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import './index.css';
import './style.css';

const root = document.getElementById('root');
if (!root) {
	throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
	<div className="dark:bg-neutral-950 bg-white min-h-screen" vaul-drawer-wrapper="">
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Index />} />
					<Route path="/article" element={<Article />} />
					<Route path="/note" element={<Note />} />
					<Route path="/archived" element={<Archived />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	</div>,
);
