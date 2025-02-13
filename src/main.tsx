import { Article } from '@/routes/article.tsx';
import { Index } from '@/routes/index.tsx';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import './index.css';
import './style.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Archived } from '@/routes/archived';

const root = document.getElementById('root');
if (!root) {
	throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
	<div vaul-drawer-wrapper="">
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Index />} />
					<Route path="/article" element={<Article />} />
					<Route path="/archived" element={<Archived />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	</div>,
);
