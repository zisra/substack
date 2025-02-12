import { HomeIcon } from 'lucide-react';

import { Button } from './ui/button';
import { Link } from 'react-router';
import { ToggleMode } from '@/components/ToggleMode';
import { About } from '@/components/About';

export function Header() {
	return (
		<header className="md:sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white p-2 dark:bg-neutral-950 bg-primary-foreground print:hidden">
			<div className="flex justify-between">
				<div className="flex gap-4">
					<Link to="/">
						<Button variant="outline">
							<HomeIcon className="w-4 h-4" />
						</Button>
					</Link>
				</div>
				<div className="flex gap-4">
					<ToggleMode />
					<About />
				</div>
			</div>
		</header>
	);
}
