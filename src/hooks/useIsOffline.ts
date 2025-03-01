import { useEffect, useState } from 'react';

export function useIsOffline() {
	const [isOffline, setIsOffline] = useState(!navigator.onLine);

	useEffect(() => {
		const handleOffline = () => {
			setIsOffline(!navigator.onLine);
		};

		window.addEventListener('offline', handleOffline);
		window.addEventListener('online', handleOffline);

		return () => {
			window.removeEventListener('offline', handleOffline);
			window.removeEventListener('online', handleOffline);
		};
	}, []);

	return isOffline;
}
