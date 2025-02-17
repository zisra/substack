import { Navigate, useLocation } from 'react-router';

export function Wiki() {
	const location = useLocation();
	const title = location.pathname.split('/wiki/')[1];

	return (
		<Navigate to={`/article/?url=https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`} />
	);
}
