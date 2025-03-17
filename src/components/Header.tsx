import { ToggleMode } from '@/components/ToggleMode';
import { About } from '@/components/modals/About';
import { Preferences } from '@/components/modals/Preferences';
import { buttonVariants } from '@/components/ui/button';
import type { Settings } from '@/lib/types';
import { HomeIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useLocation } from 'react-router';

export function Header({
	onSettingsChange,
}: {
	onSettingsChange?: (settings: Settings) => void;
}) {
	const location = useLocation();

	return (
		<header className='top-0 z-50 w-full border-b bg-background p-2 md:sticky print:hidden'>
			<div className='flex justify-between'>
				<div className='flex gap-4'>
					<Link
						to='/'
						onClick={() => {
							if (location.pathname === '/') {
								window.scrollTo({ top: 0, behavior: 'smooth' });
							}
						}}
						className={buttonVariants({ variant: 'outline', size: 'icon' })}
					>
						<HomeIcon className='size-4' />
					</Link>
				</div>
				<div className='flex gap-4'>
					<ToggleMode />
					<Preferences onSettingsChange={onSettingsChange} />
					<About />
				</div>
			</div>
		</header>
	);
}
