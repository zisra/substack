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
					<Avatar className='pointer-events-none h-8 w-8'>
						<AvatarImage src={note?.authorImg} alt='Author' />
					</Avatar>
					<p
						className={cn(
							fontFamily === 'sans' && 'font-sans',
							fontFamily === 'serif' && 'font-serif',
							fontFamily === 'mono' && 'font-mono',
							'text-slate-950 dark:text-slate-50',
						)}
					>
						<span>{note?.author}</span>
					</p>
				</div>
				<NoteControls onSettingsChange={onSettingsChange} note={note} />
			</div>
		</header>
	);
}
