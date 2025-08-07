import { ThemeProvider } from '@/components/ThemeProvider';
import { DatabaseProvider } from '@/lib/DatabaseContext';
import { Database } from '@/lib/database';
import { Archived } from '@/routes/archived';
import { Article } from '@/routes/article';
import { Comment } from '@/routes/article/comments';
import { Index } from '@/routes/index';
import { Note } from '@/routes/note';
import { Wiki } from '@/routes/wiki';
import ReactDOM from 'react-dom/client';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router';

import './index.css';
import './style.css';

const root = document.getElementById('root');
if (!root) {
	throw new Error('Root element not found');
}

async function articleListLoader() {
	try {
		const db = new Database();
		const articles = await db.getArticles();

		if (!articles) {
			return { articles: [] };
		}
		return { articles };
	} catch (e) {
		return { articles: null };
	}
}

async function archivedArticleListLoader() {
	try {
		const db = new Database();
		const articles = await db.getArchivedArticles();

		if (!articles) {
			return { articles: [] };
		}
		return { articles };
	} catch (e) {
		return { articles: null };
	}
}

async function articleLoader({ request }: { request: Request }) {
	const urlObj = new URL(request.url);
	const url = urlObj.searchParams.get('url');
	if (!url) return { article: null, settings: null };
	try {
		const db = new Database();
		const [article, settings] = await Promise.all([db.getArticle(url), db.getSettings()]);
		if (article) return { article, settings };

		const response = await fetch(`/download-article/?url=${encodeURIComponent(url)}`);
		if (!response.ok) throw new Error('Failed to download article');

		const data = await response.json();

		const saved = await db.saveArticle(data);
		return { article: saved, settings };
	} catch (e) {
		return { article: null, settings: null };
	}
}

const router = createBrowserRouter([
	{
		path: '/',
		element: <Index />,
		loader: articleListLoader,
	},
	{
		path: '/article',
		element: <Article />,
		loader: articleLoader,
	},
	{
		path: '/article/comments',
		element: <Comment />,
	},
	{
		path: '/note',
		element: <Note />,
	},
	{
		path: '/archived',
		element: <Archived />,
		loader: archivedArticleListLoader,
	},
	{
		path: '/wiki/*',
		element: <Wiki />,
	},
	{
		path: '*',
		element: <Navigate to='/' replace />,
	},
]);

ReactDOM.createRoot(root).render(
	<div vaul-drawer-wrapper=''>
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
			<DatabaseProvider>
				<RouterProvider router={router} />
			</DatabaseProvider>
		</ThemeProvider>
	</div>,
);
