import { AlertCard } from '@/components/AlertCard';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';
import { Separator } from '@/components/ui/separator';
import { Database } from '@/lib/database';
import type { Note, Settings } from '@/lib/types';
import { sanitizeDom } from '@/lib/utils';
import { Embeds } from '@/routes/note/Embeds';
import { NoteHeader } from '@/routes/note/NoteHeader';
import { HtmlRenderer, Parser } from 'commonmark';
import { ArchiveIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useNavigate, useSearchParams } from 'react-router';
import { twMerge } from 'tailwind-merge';

export function NoteViewer() {
	const [searchParams] = useSearchParams();
	const [note, setNote] = useState<Note | null>(null);
	const [settings, setSettings] = useState<Settings | null>(null);
	const [title, setTitle] = useState<string>('');
	const [markdown, setMarkdown] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const navigate = useNavigate();

	const url = searchParams.get('url');

	const db = new Database();

	useEffect(() => {
		const fetchData = async () => {
			const reader = new Parser();
			const writer = new HtmlRenderer();

			if (url) {
				try {
					const response = await fetch(
						`/download-note?url=${encodeURIComponent(url)}`
					);

					if (!response.ok) {
						navigate('/');
						throw new Error('Failed to download article');
					}

					const data: Note = await response.json();

					const parsed = reader.parse(data.markdown ?? '');
					const result = writer.render(parsed);
					setMarkdown(result);

					setNote({
						...data,
					});
				} catch (error) {
					setFailed(true);
				}

				if (note?.author) {
					setTitle(`Note by ${note.author}`);
				}
			} else {
				navigate('/');
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		const fetchSettings = async () => {
			await db.open();
			const settings = await db.getSettings();

			if (settings) {
				setSettings(settings);
			}
		};
		fetchSettings();
	}, []);

	const onSettingsChange = async (settings: Settings) => {
		setSettings(settings);
	};

	if (!note) {
		return <ArticleSkeleton />;
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-8 ">
			<title>{title}</title>

			<NoteHeader
				onSettingsChange={onSettingsChange}
				note={note}
				fontFamily={settings?.formatting.fontFamily}
			/>
			<Separator className="my-6" />
			{failed ? (
				<AlertCard
					title="Archived article"
					icon={<ArchiveIcon className="size-16" aria-hidden="true" />}
				>
					This article has been archived and is no longer available without an
					internet connection.
				</AlertCard>
			) : (
				<>
					<article
						className={twMerge(
							settings?.formatting.fontFamily === 'sans' && 'font-sans',
							settings?.formatting.fontFamily === 'serif' && 'font-serif',
							settings?.formatting.fontFamily === 'mono' && 'font-mono',
							settings?.formatting.fontSize === 'sm' &&
								'prose-sm print:prose-sm',
							settings?.formatting.fontSize === 'base' && 'prose-base',
							settings?.formatting.fontSize === 'dynamic' &&
								'prose-base lg:prose-lg print:prose-sm',
							settings?.formatting.fontSize === null &&
								'prose-base lg:prose-lg print:prose-sm',
							settings?.formatting.fontSize === 'lg' && 'prose-lg',
							settings?.formatting.fontSize === 'xl' && 'prose-xl',
							settings?.formatting.printImages === false &&
								'print:prose-img:hidden',
							'prose space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic max-w-none break-words'
						)}
					>
						{markdown ? (
							<div
								// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content
								dangerouslySetInnerHTML={{
									__html: sanitizeDom(markdown),
								}}
							/>
						) : null}
					</article>
					<Embeds note={note} />
				</>
			)}
		</div>
	);
}
