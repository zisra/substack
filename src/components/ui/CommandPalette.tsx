import { CommandDialog, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Database } from '@/lib/database';
import type { ArticleSaved } from '@/lib/types';
import { checkUrlValid, useIsOffline } from '@/lib/utils';
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

	const fetchArticles = useCallback(async () => {
		const db = new Database();
		await db.open();
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
						article.author.toLowerCase().includes(searchTerm.toLowerCase()),
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
			shouldFilter={false}
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
					<div className='text-center my-8'>No results found.</div>
				</CommandEmpty>
				<CommandGroup>
					{filteredArticles.map((article) => (
						<CommandItem
							key={article.url}
							onSelect={() => {
								navigate(`/article?url=${encodeURIComponent(article.url)}`);
								handleClose(false);
							}}
							className='flex items-center space-x-2 py-2 cursor-pointer duration-100'
						>
							<div className='flex-shrink-0'>
								{article.image ? (
									<img
										src={article.image}
										alt={article.title}
										className='size-8 object-cover rounded-md pointer-events-none'
									/>
								) : (
									<img
										src={article.authorImg}
										alt={article.title}
										className='size-8 object-cover rounded-md pointer-events-none'
									/>
								)}
							</div>
							<div className='flex-grow'>
								<h3 className='text-sm font-medium'>{article.title}</h3>
								<p className='text-xs text-muted-foreground line-clamp-1'>
									{article.author}
									<DotIcon className='px-0 mx-0 inline-block' />
									{article.subtitle}
								</p>
							</div>
						</CommandItem>
					))}
					{!checkUrlValid(searchTerm) && !offline ? (
						<CommandItem
							onSelect={() => {
								navigate(`/article?url=${encodeURIComponent(searchTerm)}`);
								handleClose(false);
							}}
						>
							<GlobeIcon className='size-8 text-muted-foreground' />
							<span className='text-sm text-muted-foreground truncate line-clamp-1 overflow-hidden'>
								{searchTerm}
							</span>
						</CommandItem>
					) : null}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
