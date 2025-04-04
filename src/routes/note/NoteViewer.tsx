import { AlertCard } from '@/components/AlertCard';
import { NoteSkeleton } from '@/components/NoteSkeleton';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/lib/context/SettingsContext';
import type { Note } from '@/lib/types';
import { articleFormatting, sanitizeDom } from '@/lib/utils';
import { Embeds } from '@/routes/note/Embeds';
import { NoteHeader } from '@/routes/note/NoteHeader';
import { HtmlRenderer, Parser } from 'commonmark';
import { ArchiveIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

export function NoteViewer() {
	const [note, setNote] = useState<Note | null>(null);

	const [markdown, setMarkdown] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const navigate = useNavigate();
	const { settings } = useSettings();

	const [searchParams] = useSearchParams();
	const url = searchParams.get('url');

	// Fetch note data
	useEffect(() => {
		const fetchData = async () => {
			if (!url) {
				navigate('/');
				return;
			}

			// Reset state when URL changes
			setNote(null);
			setMarkdown(null);
			setFailed(false);

			try {
				const response = await fetch(`/download-note/?url=${encodeURIComponent(url)}`);

				if (!response.ok) {
					navigate('/');
					throw new Error('Failed to download note');
				}

				const data: Note = await response.json();

				if (data?.redirect) {
					return navigate(`/article/?url=${encodeURIComponent(data.redirect)}`);
				}

				// Parse markdown to HTML
				const reader = new Parser();
				const writer = new HtmlRenderer();
				const parsed = reader.parse(data.markdown ?? '');
				const result = writer.render(parsed);

				// Update document title if author is available
				if (data?.author) {
					document.title = `Note by ${data.author}`;
				}

				setMarkdown(result);
				setNote(data);
			} catch (error) {
				setFailed(true);
				console.error('Error fetching note:', error);
			}
		};

		fetchData();
	}, [url, navigate]);

	if (!note) {
		return <NoteSkeleton />;
	}

	return (
		<>
			<div className='mx-auto max-w-3xl px-4 py-8'>
				<NoteHeader note={note} />
				<Separator className='my-4' />
				{failed ? (
					<AlertCard
						title='Archived article'
						icon={<ArchiveIcon className='size-16' aria-hidden='true' />}
					>
						This article has been archived and is no longer available without an internet connection
					</AlertCard>
				) : (
					<>
						<article className={articleFormatting(settings)}>
							{markdown && (
								<div
									// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content
									dangerouslySetInnerHTML={{
										__html: sanitizeDom(markdown),
									}}
								/>
							)}
						</article>
						<Embeds note={note} />
					</>
				)}
			</div>
		</>
	);
}
