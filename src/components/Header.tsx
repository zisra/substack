import { GithubIcon, HomeIcon, MenuIcon, SettingsIcon } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Link } from 'react-router';
import { ToggleMode } from './ToggleMode';

export function Header() {
	return (
		<header className="md:sticky top-0 z-50 w-full border border-neutral-200 dark:border-neutral-800 bg-white p-2 dark:bg-neutral-950 bg-primary-foreground print:hidden">
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
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<MenuIcon className="w-4 h-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent side="bottom" align="end">
							<DropdownMenuItem>
								<SettingsIcon className="mr-2 w-4 h-4" />
								<button>Settings</button>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<GithubIcon className="mr-2 w-4 h-4" />
								<a
									href="https://github.com/zisra/substack"
									target="_blank"
									className="w-full"
								>
									GitHub
								</a>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
