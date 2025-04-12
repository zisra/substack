import { ThemeProvider } from '@/components/ThemeProvider';
import { DatabaseProvider } from '@/lib/DatabaseContext';
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

const router = createBrowserRouter([
	{
		path: '/',
		element: <Index />,
	},
	{
		path: '/article',
		element: <Article />,
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
