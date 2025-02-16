import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: 'system',
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	storageKey = 'vite-ui-theme',
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
	);

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove('light', 'dark');

		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';

			root.classList.add(systemTheme);
			updateThemeColor(systemTheme); // Update theme color for system
			return;
		}

		root.classList.add(theme);
		updateThemeColor(theme); // Update theme color for light/dark
	}, [theme]);

	const updateThemeColor = (theme: Theme) => {
		const metaThemeColor = document.querySelector("meta[name='theme-color']");
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FFFFFF');
		}

		// Optionally, update the manifest if needed (not always necessary)
		// const link = document.querySelector('link[rel="manifest"]');
		// if (link) {
		//     fetch(link.href)
		//         .then(response => response.json())
		//         .then(manifest => {
		//             manifest.theme_color = theme === 'dark' ? '#000000' : '#FFFFFF';
		//             const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
		//             const newManifestUrl = URL.createObjectURL(blob);
		//             link.href = newManifestUrl;
		//         });
		// }
	};

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

	return context;
};
