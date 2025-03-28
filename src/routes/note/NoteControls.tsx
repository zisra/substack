import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Note } from '@/lib/types';
import { ExternalLinkIcon, LinkIcon, MoreVerticalIcon } from 'lucide-react';

export function NoteControls({ note }: { note: Note }) {
	return (
		<div className='flex items-center justify-between print:hidden'>
			<div className='flex items-center space-x-4'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline' size='icon'>
							<MoreVerticalIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-40'>
						<a href={note.url} target='_blank' rel='noreferrer'>
							<DropdownMenuItem className='cursor-pointer'>
								<ExternalLinkIcon className='mr-2 size-4' />
								<span>Open</span>
							</DropdownMenuItem>
						</a>
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(note.url);
							}}
							className='cursor-pointer'
						>
							<LinkIcon className='mr-2 size-4' />
							<span>Copy link</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
