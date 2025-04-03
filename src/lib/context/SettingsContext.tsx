import type { Settings } from '@/lib/types';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useDatabase } from './DatabaseContext';

interface SettingsContextType {
	settings: Settings | null;
	updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
	onSettingsChange: (callback: (updatedSettings: Settings) => void) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<Settings | null>(null);
	const [callbacks, setCallbacks] = useState<((updatedSettings: Settings) => void)[]>([]);

	const db = useDatabase();

	useEffect(() => {
		const fetchSettings = async () => {
			const fetchedSettings = await db.getSettings();
			if (fetchedSettings) {
				setSettings(fetchedSettings);
			} else {
				setSettings(null);
			}
		};

		fetchSettings();
	}, []);

	const updateSettings = useCallback(
		async (newSettings: Partial<Settings>) => {
			if (!settings) return;

			const updatedSettings = { ...settings, ...newSettings };
			await db.saveSettings(updatedSettings);
			setSettings(updatedSettings);

			// Notify all registered callbacks
			callbacks.forEach((callback) => callback(updatedSettings));
		},
		[settings, callbacks],
	);

	const onSettingsChange = useCallback((callback: (updatedSettings: Settings) => void) => {
		setCallbacks((prev) => [...prev, callback]);
	}, []);

	return (
		<SettingsContext.Provider value={{ settings, updateSettings, onSettingsChange }}>
			{children}
		</SettingsContext.Provider>
	);
}

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error('useSettings must be used within a SettingsProvider');
	}
	return context;
};
