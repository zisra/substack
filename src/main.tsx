import ReactDOM from 'react-dom/client';
import { Routes, Route, BrowserRouter } from 'react-router';
import { Index } from '@/routes/index.tsx';
import { Article } from '@/routes/article.tsx';

import './index.css';
import './style.css';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Index />} />
			<Route path="/article" element={<Article />} />
		</Routes>
	</BrowserRouter>
);
