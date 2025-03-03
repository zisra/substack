import { Avatar, AvatarImage } from '@/components/ui/avatar';
import type { Note, Settings } from '@/lib/types';
import { cn, fontFormatting } from '@/lib/utils';
import { NoteControls } from '@/routes/note/NoteControls';

export function NoteHeader({
	note,
	settings,
	onSettingsChange,
}: {
	note: Note;
	onSettingsChange: (settings: Settings) => void;
	settings: Settings | null;
}) {
	return (
		<header>
			<div className='flex items-center space-x-2 justify-between'>
				<div className='flex items-center space-x-2'>
					<a target='_blank' href={note.authorUrl} rel='noreferrer'>
						<Avatar className='pointer-events-none size-6'>
							<AvatarImage src={note?.authorImg} alt='Author' />
						</Avatar>
					</a>
					<p className={cn(fontFormatting(settings), 'text-slate-950 dark:text-slate-50')}>
						<p className='text-neutral-500 dark:text-neutral-400'>
							<a target='_blank' href={note.authorUrl} rel='noreferrer' className='hover:underline'>
								{note?.author}
							</a>
						</p>
					</p>
				</div>
				<NoteControls onSettingsChange={onSettingsChange} note={note} />
			</div>
		</header>
	);
}
