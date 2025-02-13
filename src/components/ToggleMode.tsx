import { MoonIcon, SunIcon } from 'lucide-react';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

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
				<SunIcon onClick={() => setTheme('light')} />
			) : (
				<MoonIcon onClick={() => setTheme('dark')} />
			)}
		</Button>
	);
}
