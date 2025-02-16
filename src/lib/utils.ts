import { type ClassValue, clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function checkUrlValid(url: string) {
	try {
		new URL(url);
		return false;
	} catch (e) {
		return true;
	}
}

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

export async function getDataStored() {
	const data = await navigator.storage.estimate();

	if (!data.usage) {
		return null;
	}
	const usageInMB = data.usage / 1024 / 1024;

	return usageInMB.toFixed(2);
}