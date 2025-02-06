import ReactDOM from 'react-dom/client';
import { Routes, Route, BrowserRouter } from 'react-router';
import { Index } from '@/routes/index.tsx';
import { Article } from '@/routes/article.tsx';

import './index.css';
import './style.css';
import { ThemeProvider } from './components/ThemeProvider';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
	<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
		<div className="dark:bg-zinc-950">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Index />} />
					<Route path="/article" element={<Article />} />
				</Routes>
			</BrowserRouter>
		</div>
	</ThemeProvider>
);
