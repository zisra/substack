import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { useSettings } from '@/lib/context/SettingsContext';
import type { Note } from '@/lib/types';
import { cn, fontFormatting } from '@/lib/utils';
import { NoteControls } from '@/routes/note/NoteControls';

export function NoteHeader({
	note,
}: {
	note: Note;
}) {
	const { settings } = useSettings();

	return (
		<header>
			<div className='flex items-center justify-between space-x-2'>
				<div className='flex items-center space-x-2'>
					<a target='_blank' href={note.authorUrl} rel='noreferrer'>
						<Avatar className='pointer-events-none size-6'>
							<AvatarImage src={note?.authorImg} alt='Author' />
							<AvatarFallback>{note.author?.charAt(0)}</AvatarFallback>
						</Avatar>
					</a>
					<p className={cn(fontFormatting(settings), 'text-slate-950 dark:text-slate-50')}>
						<p className='text-muted-foreground'>
							<a target='_blank' href={note.authorUrl} rel='noreferrer' className='hover:underline'>
								{note?.author}
							</a>
						</p>
					</p>
				</div>
				<NoteControls note={note} />
			</div>
		</header>
	);
}
