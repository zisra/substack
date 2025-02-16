import { AlertCard } from '@/components/AlertCard';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';
import { Formatting } from '@/components/Formatting';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from '@/lib/database';
import type { Note, Settings } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import { HtmlRenderer, Parser } from 'commonmark';
import {
	ArchiveIcon,
	ExternalLinkIcon,
	LinkIcon,
	MoreVerticalIcon,
	PrinterIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { Card, CardContent } from './ui/card';

export function NoteControls({
	note,
	onSettingsChange,
}: {
	note: Note;
	onSettingsChange: (settings: Settings) => void;
}) {
	return (
		<div className="print:hidden">
			<Separator className="my-6" />
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Button
						variant="outline"
						size="icon"
						onClick={() => {
							window.print();
						}}
					>
						<PrinterIcon />
					</Button>
					<a
						href={note.url}
						target="_blank"
						rel="noopener noreferrer"
						className={buttonVariants({ variant: 'outline', size: 'icon' })}
					>
						<ExternalLinkIcon />
					</a>
					<Formatting onSettingsChange={onSettingsChange} />
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="icon">
							<MoreVerticalIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(note.url);
							}}
							className="cursor-pointer"
						>
							<LinkIcon className="mr-2 h-4 w-4" />
							<span>Copy link</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

function NoteHeader({
	note,
	fontFamily,
	onSettingsChange,
}: {
	note: Note;
	onSettingsChange: (settings: Settings) => void;
	fontFamily?: string;
}) {
	return (
		<header className="mb-4">
			<div className="flex items-center space-x-2">
				<Avatar className="pointer-events-none h-8 w-8">
					<AvatarImage src={note?.authorImg} alt="Author" />
				</Avatar>
				<div>
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
			</div>
			<NoteControls onSettingsChange={onSettingsChange} note={note} />
		</header>
	);
}

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
					const response = await fetch(`/download-note?url=${encodeURIComponent(url)}`);

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
			<Helmet>
				<title>{title}</title>
			</Helmet>
			<NoteHeader
				onSettingsChange={onSettingsChange}
				note={note}
				fontFamily={settings?.formatting.fontFamily}
			/>
			<Separator className="my-6" />
			{failed ? (
				<AlertCard
					title="Archived article"
					icon={<ArchiveIcon className="h-16 w-16" aria-hidden="true" />}
				>
					This article has been archived and is no longer available without an internet connection.
				</AlertCard>
			) : (
				<article
					className={twMerge(
						settings?.formatting.fontFamily === 'sans' && 'font-sans',
						settings?.formatting.fontFamily === 'serif' && 'font-serif',
						settings?.formatting.fontFamily === 'mono' && 'font-mono',
						settings?.formatting.fontSize === 'sm' && 'prose-sm print:prose-sm',
						settings?.formatting.fontSize === 'base' && 'prose-base',
						settings?.formatting.fontSize === 'dynamic' && 'prose-base lg:prose-lg print:prose-sm',
						settings?.formatting.fontSize === null && 'prose-base lg:prose-lg print:prose-sm',
						settings?.formatting.fontSize === 'lg' && 'prose-lg',
						settings?.formatting.fontSize === 'xl' && 'prose-xl',
						settings?.formatting.printImages === false && 'print:prose-img:hidden',
						'prose space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic max-w-none break-words',
					)}
				>
					{markdown ? (
						<div
							// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
							dangerouslySetInnerHTML={{
								__html: markdown,
							}}
						/>
					) : (
						<div className="space-y-4">
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-3/4" />
						</div>
					)}
					<Card className="w-full max-w-md mx-auto">
						<CardContent className="p-6">
							<div className="relative">
								<span className="absolute top-0 left-0 text-6xl text-primary opacity-20 -translate-x-4 -translate-y-4  font-serif">
									"
								</span>
								<blockquote className="text-lg font-medium leading-relaxed mb-4 pt-4 border-none">
									Sometimes I say stuff I just think of after reading half a journal paper.
								</blockquote>
								<footer className="text-sm text-muted-foreground">— Sam Atis</footer>
							</div>
						</CardContent>
					</Card>
					<Card className="max-w-md mx-auto overflow-hidden shadow-lg">
						<div className="relative w-full h-48">
							<img
								src="https://substackcdn.com/image/fetch/w_1040,c_fill,f_webp,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4a8d7e41-6476-4b50-b001-ecb353452d7c_680x434.png"
								alt="Article header"
								style={{ objectFit: 'cover' }}
							/>
						</div>
						<CardContent className="p-6">
							<h2 className="text-lg font-semibold mb-3 text-gray-800">
								Why IQ Research Doesn't Publish Well
							</h2>
							<div className="flex items-center">
								<div className="relative w-6 h-6 mr-2">
									<img
										src="https://substackcdn.com/image/fetch/w_36,h_36,c_fill,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c062404-95e3-4b54-96a3-875f4ff87641_4000x6000.jpeg"
										alt="Lyman Stone"
										className="rounded-full"
										style={{ objectFit: 'cover' }}
									/>
								</div>
								<span className="text-sm text-gray-500">Lyman Stone</span>
							</div>
						</CardContent>
					</Card>
				</article>
			)}
		</div>
	);
}
