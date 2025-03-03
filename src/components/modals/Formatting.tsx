import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Credenza,
	CredenzaBody,
	CredenzaClose,
	CredenzaContent,
	CredenzaDescription,
	CredenzaFooter,
	CredenzaHeader,
	CredenzaTitle,
} from '@/components/ui/credenza';
import { Label } from '@/components/ui/label';
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
import { ALargeSmallIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Formatting({
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
			} else {
				resetSettings();
			}
		};
		fetchSettings();
	}, []);

	const decreaseFontSize = () => {
		setFontSize((prev) => {
			const sizes = Object.keys(fontSizes);
			const index = sizes.indexOf(prev || 'base');
			return sizes[index - 1] as keyof typeof fontSizes;
		});
	};

	const increaseFontSize = () => {
		setFontSize((prev) => {
			const sizes = Object.keys(fontSizes);
			const index = sizes.indexOf(prev || 'dynamic');
			return sizes[index + 1] as keyof typeof fontSizes;
		});
	};

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
				<ALargeSmallIcon />
			</Button>
			<Credenza open={open} onOpenChange={setOpen}>
				<CredenzaContent>
					<CredenzaHeader>
						<CredenzaTitle>Customize Formatting</CredenzaTitle>
						<CredenzaDescription className='text-neutral-500 dark:text-neutral-400'>
							Customize the formatting of the article
						</CredenzaDescription>
					</CredenzaHeader>
					<CredenzaBody>
						<div className='space-y-4'>
							<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
								<div className='grid gap-1.5'>
									<Label>Font Family</Label>
									<p className='text-sm text-neutral-500 dark:text-neutral-400'>
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
							<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
								<div className='grid gap-1.5'>
									<Label>Font Size</Label>
									<p className='text-sm text-neutral-500 dark:text-neutral-400'>
										Change the font size of the article
									</p>
								</div>
								<div className='flex items-center space-x-2'>
									<Button
										variant='outline'
										size='icon'
										onClick={decreaseFontSize}
										disabled={fontSize === 'sm'}
									>
										<MinusIcon />
									</Button>
									<Card className='w-26 h-9 flex items-center justify-center text-sm shadow-none select-none rounded-md'>
										{fontSize ? fontSizes[fontSize] : null}
									</Card>
									<Button
										variant='outline'
										size='icon'
										onClick={increaseFontSize}
										disabled={fontSize === 'xl'}
									>
										<PlusIcon />
									</Button>
								</div>
							</div>
							<div className='flex items-center justify-between gap-4'>
								<div className='grid gap-1.5'>
									<Label>Print Images</Label>
									<p className='text-sm text-neutral-500 dark:text-neutral-400'>
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
									<p className='text-sm text-neutral-500 dark:text-neutral-400'>
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
									<p className='text-sm text-neutral-500 dark:text-neutral-400'>
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
						</div>
					</CredenzaBody>
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
