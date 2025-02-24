'use client';

import {
	CommandDialog,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Database } from '@/lib/database';
import type { ArticleSaved } from '@/lib/types';
import { CommandEmpty, CommandGroup } from 'cmdk';
import { DotIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function ArticleCommandPalette() {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [articles, setArticles] = useState<ArticleSaved[]>([]);
	const [filteredArticles, setFilteredArticles] = useState<ArticleSaved[]>([]);
	const navigate = useNavigate();

	const fetchArticles = useCallback(async () => {
		const db = new Database();
		await db.open();
		const allArticles = await db.getArticles(true);
		if (allArticles) {
			setArticles(allArticles);
			setFilteredArticles(allArticles);
		}
	}, []);

	useEffect(() => {
		fetchArticles();
	}, [fetchArticles]);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.metaKey || event.ctrlKey) {
			switch (event.key.toLowerCase()) {
				case 'k':
					event.preventDefault();
					setIsOpen((prev) => !prev);
					break;
				default:
					break;
			}
		}
	}, []);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	useEffect(() => {
		if (searchTerm === '') {
			setFilteredArticles(articles);
		} else {
			setFilteredArticles(
				articles.filter(
					(article) =>
						article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						article.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
						article.author.toLowerCase().includes(searchTerm.toLowerCase())
				)
			);
		}
	}, [searchTerm, articles]);

	const handleSelect = (article: ArticleSaved) => {
		navigate(`/article?url=${encodeURIComponent(article.url)}`);
		setIsOpen(false);
	};

	return (
		<CommandDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
			<CommandInput
				value={searchTerm}
				onValueChange={(value) => setSearchTerm(value)}
				placeholder="Type a command or search..."
			/>
			<CommandList className="py-2">
				<CommandEmpty>
					<div className="text-center my-8">No results found.</div>
				</CommandEmpty>
				<CommandGroup>
					{filteredArticles.map((article) => (
						<CommandItem
							key={article.url}
							onSelect={() => handleSelect(article)}
							className="flex items-center space-x-2 py-2 cursor-pointer duration-100"
						>
							<div className="flex-shrink-0">
								<img
									src={article.image}
									alt={article.title}
									className="size-8 object-cover rounded-md pointer-events-none"
								/>
							</div>
							<div className="flex-grow">
								<h3 className="text-sm font-medium">{article.title}</h3>
								<p className="text-xs text-muted-foreground line-clamp-1">
									{article.author}
									<DotIcon className="px-0 mx-0 inline-block" />
									{article.subtitle}
								</p>
							</div>
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
