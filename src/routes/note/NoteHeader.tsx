import { Avatar, AvatarImage } from '@/components/ui/avatar';
import type { Note, Settings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { NoteControls } from '@/routes/note/NoteControls';

export function NoteHeader({
	note,
	fontFamily,
	onSettingsChange,
}: {
	note: Note;
	onSettingsChange: (settings: Settings) => void;
	fontFamily?: string;
}) {
	return (
		<header>
			<div className='flex items-center space-x-2 justify-between'>
				<div className='flex items-center space-x-2'>
					<a target='_blank' href={note.authorUrl} rel='noreferrer'>
						<Avatar className='pointer-events-none size-8'>
							<AvatarImage src={note?.authorImg} alt='Author' />
						</Avatar>
					</a>
					<p
						className={cn(
							fontFamily === 'sans' && 'font-sans',
							fontFamily === 'serif' && 'font-serif',
							fontFamily === 'mono' && 'font-mono',
							'text-slate-950 dark:text-slate-50',
						)}
					>
						<a target='_blank' href={note.authorUrl} rel='noreferrer' className='hover:underline'>
							{note?.author}
						</a>
					</p>
				</div>
				<NoteControls onSettingsChange={onSettingsChange} note={note} />
			</div>
		</header>
	);
}
