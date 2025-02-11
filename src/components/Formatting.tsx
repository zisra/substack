import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { ALargeSmallIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database';
import { DialogClose } from '@radix-ui/react-dialog';
import { Settings } from '@/lib/types';

export function Formatting({
	onSettingsChange,
}: {
	onSettingsChange: (settings: Settings) => void;
}) {
	const db = new Database();

	const [fontSize, setFontSize] = useState<keyof typeof fontSizes | null>(null);
	const [fontFamily, setFontFamily] = useState<keyof typeof fonts | null>(null);
	const [includeImages, setIncludeImages] = useState<boolean | null>(null);

	useEffect(() => {
		const fetchSettings = async () => {
			await db.open();
			let settings = await db.getSettings();

			if (settings) {
				setFontSize(settings.formatting.fontSize);
				setFontFamily(settings.formatting.fontFamily);
				setIncludeImages(settings.formatting.printImages);
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
			const index = sizes.indexOf(prev || 'base');
			return sizes[index + 1] as keyof typeof fontSizes;
		});
	};

	const saveSettings = async () => {
		const settings = {
			version: 1,
			formatting: {
				fontSize: fontSize || 'base',
				fontFamily: fontFamily || 'sans',
				printImages: includeImages !== null ? includeImages : true,
			},
			saveArchivedContent: true,
		};

		onSettingsChange(settings);
		await db.open();
		db.saveSettings(settings);
	};

	const resetSettings = () => {
		setFontSize('base');
		setFontFamily('sans');
		setIncludeImages(true);
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
		<Dialog>
			<DialogTrigger>
				<Button variant="outline" size="icon">
					<ALargeSmallIcon />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Customize Formatting</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Customize the formatting of the article
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div className="grid gap-1.5">
							<Label>Font Family</Label>
							<p className="text-sm text-muted-foreground">
								Change the font family of the article
							</p>
						</div>
						<Select
							value={fontFamily || 'sans'}
							defaultValue="sans"
							onValueChange={(value) =>
								setFontFamily(value as keyof typeof fonts)
							}
						>
							<SelectTrigger className={`font-${fontFamily} max-w-[192px]`}>
								{fontFamily ? (
									<SelectValue placeholder={fonts[fontFamily]} />
								) : null}
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
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div className="grid gap-1.5">
							<Label>Font Size</Label>
							<p className="text-sm text-muted-foreground">
								Change the font size of the article
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								onClick={decreaseFontSize}
								disabled={fontSize === 'sm'}
							>
								<MinusIcon />
							</Button>
							<Card className="w-24 h-10 flex items-center justify-center text-sm text-muted-foreground shadow-none select-none">
								{fontSize ? fontSizes[fontSize] : null}
							</Card>
							<Button
								variant="outline"
								size="icon"
								onClick={increaseFontSize}
								disabled={fontSize === 'xl'}
							>
								<PlusIcon />
							</Button>
						</div>
					</div>
					<div className="flex items-center justify-between gap-4">
						<div className="grid gap-1.5">
							<Label>Print Images</Label>
							<p className="text-sm text-muted-foreground">
								Whether to include images when printing
							</p>
						</div>
						{includeImages !== null ? (
							<Switch
								checked={includeImages}
								onCheckedChange={(event) => setIncludeImages(event.valueOf())}
							/>
						) : null}
					</div>
				</div>
				<DialogFooter className="flex flex-col sm:flex-row justify-end gap-y-2 sm:gap-x-0">
					<Button onClick={resetSettings} variant="secondary">
						Reset
					</Button>
					<DialogClose asChild>
						<Button
							onClick={() => {
								saveSettings();
							}}
							type="submit"
						>
							Save
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
