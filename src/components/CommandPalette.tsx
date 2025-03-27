import { CommandDialog, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useIsOffline } from '@/hooks/useIsOffline';
import { useDatabase } from '@/lib/DatabaseContext';
import type { ArticleSaved } from '@/lib/types';
import { checkUrlValid } from '@/lib/utils';
import { CommandEmpty, CommandGroup } from 'cmdk';
import { DotIcon, GlobeIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function CommandPalette({
	openCommand,
	setOpenCommand,
}: {
	openCommand?: boolean;
	setOpenCommand?: (open: boolean) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	const [filteredArticles, setFilteredArticles] = useState<ArticleSaved[]>([]);
	const [articles, setArticles] = useState<ArticleSaved[]>([]);
	const navigate = useNavigate();
	const offline = useIsOffline();
	const db = useDatabase();

	const fetchArticles = useCallback(async () => {
		const allArticles = await db.getArticles(true);
		if (allArticles) {
			setArticles(allArticles);
		}
	}, []);

	useEffect(() => {
		fetchArticles();
	}, [fetchArticles]);

	useEffect(() => {
		if (openCommand !== undefined) {
			setIsOpen(openCommand);
			fetchArticles();
		}
	}, [openCommand]);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.metaKey || event.ctrlKey) {
			switch (event.key.toLowerCase()) {
				case 'k':
					event.preventDefault();
					fetchArticles();
					setIsOpen((prev) => !prev);
					break;
				default:
					break;
			}
		}
	}, []);

	useEffect(() => {
		if (searchTerm === '') {
			setFilteredArticles(articles);
		} else {
			setFilteredArticles(
				articles.filter(
					(article) =>
						article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						article.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
						article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
						(searchTerm.includes('https://') &&
							article.url.toLowerCase().includes(searchTerm.toLowerCase())),
				),
			);
		}
	}, [searchTerm, articles]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	const handleClose = (open: boolean) => {
		setIsOpen(open);
		if (setOpenCommand) setOpenCommand(open); // Notify the parent
	};

	return (
		<CommandDialog
			// shouldFilter={false} ToDo: Fix this
			open={isOpen}
			onOpenChange={handleClose} // Use the new handler
		>
			<CommandInput
				value={searchTerm}
				onValueChange={setSearchTerm}
				className='pr-6'
				placeholder='Search or enter a URL...'
			/>
			<CommandList className='py-2'>
				<CommandEmpty>
					<div className='my-8 text-center'>No results found</div>
				</CommandEmpty>
				<CommandGroup>
					{filteredArticles.map((article) => (
						<CommandItem
							key={article.url}
							onSelect={() => {
								navigate(`/article/?url=${encodeURIComponent(article.url)}`);
								handleClose(false);
							}}
							className='flex cursor-pointer items-center space-x-2 py-2 duration-100'
						>
							<div className='flex-shrink-0'>
								{article.image ? (
									<img
										src={article.image}
										alt={article.title}
										className='pointer-events-none size-8 rounded-md object-cover'
									/>
								) : (
									<img
										src={article.authorImg}
										alt={article.title}
										className='pointer-events-none size-8 rounded-md object-cover'
									/>
								)}
							</div>
							<div className='flex-grow'>
								<h3 className='font-medium text-sm'>{article.title}</h3>
								<p className='line-clamp-1 text-muted-foreground text-xs'>
									{article.author}
									<DotIcon className='mx-0 inline-block px-0' />
									{article.subtitle}
								</p>
							</div>
						</CommandItem>
					))}
					{!checkUrlValid(searchTerm) && !offline && (
						<CommandItem
							onSelect={() => {
								navigate(`/article/?url=${encodeURIComponent(searchTerm)}`);
								handleClose(false);
							}}
						>
							<GlobeIcon className='size-8 text-muted-foreground' />
							<span className='line-clamp-1 overflow-hidden truncate text-muted-foreground text-sm'>
								Open URL
							</span>
						</CommandItem>
					)}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
