import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export function ToggleMode() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			onClick={() => {
				setTheme(theme === 'dark' ? 'light' : 'dark');
			}}
			variant="outline"
			size="icon"
		>
			{theme === 'dark' ? (
				<Sun onClick={() => setTheme('light')} />
			) : (
				<Moon onClick={() => setTheme('dark')} />
			)}
		</Button>
	);
}
