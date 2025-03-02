import { ToggleMode } from '@/components/ToggleMode';
import { About } from '@/components/modals/About';
import { Formatting } from '@/components/modals/Formatting';
import { buttonVariants } from '@/components/ui/button';
import { HomeIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useLocation } from 'react-router';

export function Header() {
	const location = useLocation();
	const useHeader = location.pathname === '/' || location.pathname === '/archived';

	return (
		<header className='md:sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 p-2 dark:bg-neutral-950 bg-white print:hidden'>
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
					{useHeader && <Formatting />}
					<About />
				</div>
			</div>
		</header>
	);
}
