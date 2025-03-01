import { ThemeProvider } from '@/components/ThemeProvider';
import { Archived } from '@/routes/archived';
import { Article } from '@/routes/article';
import { Index } from '@/routes/index';
import { Note } from '@/routes/note';
import { Wiki } from '@/routes/wiki';
import ReactDOM from 'react-dom/client';
import {
	Navigate,
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from 'react-router';

import './index.css';
import './style.css';

const root = document.getElementById('root');
if (!root) {
	throw new Error('Root element not found');
}

const router = createBrowserRouter(
	createRoutesFromElements(
		<>
			<Route path='/' element={<Index />} />
			<Route path='/article' element={<Article />} />
			<Route path='/note' element={<Note />} />
			<Route path='/archived' element={<Archived />} />
			<Route path='/wiki/*' element={<Wiki />} />
			<Route path='*' element={<Navigate to='/' replace />} />
		</>,
	),
);

ReactDOM.createRoot(root).render(
	<div vaul-drawer-wrapper=''>
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
			<RouterProvider router={router} />
		</ThemeProvider>
	</div>,
);
