import { IncrementalButton } from '@/components/IncrementalButton';
import { Button } from '@/components/ui/button';
import {
	Credenza,
	CredenzaBody,
	CredenzaClose,
	CredenzaContent,
	CredenzaFooter,
	CredenzaHeader,
	CredenzaTitle,
} from '@/components/ui/credenza';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Database } from '@/lib/database';
import type { Settings } from '@/lib/types';
import { SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Preferences({
	onSettingsChange,
}: {
	onSettingsChange?: (settings: Settings) => void;
}) {
	const db = new Database();

	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const [fontSize, setFontSize] = useState<keyof typeof fontSizes | null>(null);
	const [fontFamily, setFontFamily] = useState<keyof typeof fonts | null>(null);
	const [includeImages, setIncludeImages] = useState<boolean | null>(null);
	const [saveArchivedContent, setSaveArchivedContent] = useState<boolean | null>(null);
	const [scrollArticles, setScrollArticles] = useState<boolean | null>(null);
	const [saveComments, setSaveComments] = useState<boolean | null>(null);

	useEffect(() => {
		const fetchSettings = async () => {
			await db.open();
			const settings = await db.getSettings();

			if (settings) {
				setFontSize(settings.formatting.fontSize);
				setFontFamily(settings.formatting.fontFamily);
				setIncludeImages(settings.formatting.printImages);
				setSaveArchivedContent(settings.saveArchivedContent);
				setScrollArticles(settings.scrollArticles);
				setSaveComments(settings.saveComments);
			} else {
				resetSettings();
			}
		};
		fetchSettings();
	}, []);

	const saveSettings = async () => {
		const settings = {
			version: 1,
			formatting: {
				fontSize: fontSize || 'dynamic',
				fontFamily: fontFamily || 'sans',
				printImages: includeImages !== null ? includeImages : true,
			},
			saveArchivedContent: saveArchivedContent !== null ? saveArchivedContent : true,
			scrollArticles: scrollArticles !== null ? scrollArticles : true,
			saveComments: saveComments !== null ? saveComments : true,
		};

		if (onSettingsChange) onSettingsChange(settings);

		await db.open();
		db.saveSettings(settings);
	};

	const resetSettings = () => {
		setFontSize('dynamic');
		setFontFamily('sans');
		setIncludeImages(true);
		setSaveArchivedContent(true);
		setScrollArticles(true);
	};

	const fonts = {
		sans: 'Sans Serif',
		serif: 'Serif',
		mono: 'Mono',
	};

	const fontSizes = {
		sm: 'Small',
		base: 'Base',
		dynamic: 'Dynamic',
		lg: 'Large',
		xl: 'Extra Large',
	};

	return (
		<>
			<Button onClick={handleOpen} variant='outline' size='icon'>
				<SettingsIcon />
			</Button>
			<Credenza open={open} onOpenChange={setOpen}>
				<CredenzaContent>
					<CredenzaHeader>
						<CredenzaTitle>Preferences</CredenzaTitle>
					</CredenzaHeader>
					<ScrollArea className='overflow-auto'>
						<CredenzaBody>
							<div className='space-y-4'>
								<div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
									<div className='grid gap-1.5'>
										<Label>Font Family</Label>
										<p className='text-neutral-500 text-sm dark:text-neutral-400'>
											Change the font family of the article
										</p>
									</div>
									<Select
										value={fontFamily || 'sans'}
										defaultValue='sans'
										onValueChange={(value) => setFontFamily(value as keyof typeof fonts)}
									>
										<SelectTrigger className='max-w-[192px]'>
											{fontFamily && <SelectValue placeholder={fonts[fontFamily]} />}
										</SelectTrigger>
										<SelectContent>
											{Object.entries(fonts).map(([key, value]) => (
												<SelectItem key={key} value={key}>
													{value}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
									<div className='grid gap-1.5'>
										<Label>Font Size</Label>
										<p className='text-neutral-500 text-sm dark:text-neutral-400'>
											Change the font size of the article
										</p>
									</div>
									<div className='flex items-center space-x-2'>
										<IncrementalButton
											options={fontSizes}
											value={fontSize}
											onValueChange={(value) => setFontSize(value as keyof typeof fontSizes)}
										/>
									</div>
								</div>
								<div className='flex items-center justify-between gap-4'>
									<div className='grid gap-1.5'>
										<Label>Print Images</Label>
										<p className='text-neutral-500 text-sm dark:text-neutral-400'>
											Whether to include images when printing
										</p>
									</div>
									{includeImages !== null && (
										<Switch
											checked={includeImages}
											onCheckedChange={(event) => setIncludeImages(event.valueOf())}
										/>
									)}
								</div>
								<div className='flex items-center justify-between gap-4'>
									<div className='grid gap-1.5'>
										<Label>Save Archived Content</Label>
										<p className='text-neutral-500 text-sm dark:text-neutral-400'>
											Whether to save archived articles offline
										</p>
									</div>
									{saveArchivedContent !== null && (
										<Switch
											checked={saveArchivedContent}
											onCheckedChange={(event) => setSaveArchivedContent(event.valueOf())}
										/>
									)}
								</div>
								<div className='flex items-center justify-between gap-4'>
									<div className='grid gap-1.5'>
										<Label>Save Article Location</Label>
										<p className='text-neutral-500 text-sm dark:text-neutral-400'>
											Whether to save and the last position in the article
										</p>
									</div>
									{scrollArticles !== null && (
										<Switch
											checked={scrollArticles}
											onCheckedChange={(event) => setScrollArticles(event.valueOf())}
										/>
									)}
								</div>
								<div className='flex items-center justify-between gap-4'>
									<div className='grid gap-1.5'>
										<Label>Save Comments</Label>
										<p className='text-neutral-500 text-sm dark:text-neutral-400'>
											Whether to save comments offline automatically
										</p>
									</div>
									{saveComments !== null && (
										<Switch
											checked={saveComments}
											onCheckedChange={(event) => setSaveComments(event.valueOf())}
										/>
									)}
								</div>
							</div>
						</CredenzaBody>
					</ScrollArea>
					<CredenzaFooter className='gap-x-2'>
						<Button onClick={resetSettings} variant='secondary'>
							Reset
						</Button>
						<CredenzaClose asChild>
							<Button
								onClick={() => {
									saveSettings();
								}}
								type='submit'
							>
								Save
							</Button>
						</CredenzaClose>
					</CredenzaFooter>
				</CredenzaContent>
			</Credenza>
		</>
	);
}
