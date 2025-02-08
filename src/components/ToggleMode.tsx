import { MoonIcon, SunIcon } from 'lucide-react';

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
				<SunIcon onClick={() => setTheme('light')} />
			) : (
				<MoonIcon onClick={() => setTheme('dark')} />
			)}
		</Button>
	);
}
