import { HomeIcon } from 'lucide-react';

import { ToggleMode } from '@/components/ToggleMode';
import { About } from '@/components/modals/About';
import { Formatting } from '@/components/modals/Formatting';
import { buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router';
import { useLocation } from 'react-router';

export function Header() {
	const location = useLocation();

	return (
		<header className="md:sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white p-2 dark:bg-neutral-950 bg-primary-foreground print:hidden">
			<div className="flex justify-between">
				<div className="flex gap-4">
					<Link to="/" className={buttonVariants({ variant: 'outline', size: 'icon' })}>
						<HomeIcon className="w-4 h-4" />
					</Link>
				</div>
				<div className="flex gap-4">
					<ToggleMode />
					{location.pathname === '/' && <Formatting />}
					<About />
				</div>
			</div>
		</header>
	);
}
