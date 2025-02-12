import {
	ArchiveIcon,
	ArchiveRestoreIcon,
	ExternalLinkIcon,
	LinkIcon,
	MoreVerticalIcon,
	PrinterIcon,
	TrashIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Formatting } from './Formatting';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Database } from '@/lib/database';
import { ArticleSaved, Settings } from '@/lib/types';
import { useNavigate } from 'react-router';

export function ArticleControls({
	db,
	setArticle,
	article,
	onSettingsChange,
}: {
	db: Database;
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
	article: ArticleSaved;
	onSettingsChange: (settings: Settings) => void;
}) {
	const navigate = useNavigate();

	return (
		<div className="print:hidden">
			<hr className="my-6" />
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
					<a href={article.url} target="_blank" rel="noopener noreferrer">
						<Button variant="outline" size="icon">
							<ExternalLinkIcon />
						</Button>
					</a>
					<Formatting onSettingsChange={onSettingsChange} />
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="icon"
							onClick={() => {
								navigator.clipboard.writeText(article.url);
							}}
						>
							<MoreVerticalIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuItem
							onClick={() => {
								navigator.clipboard.writeText(article.url);
							}}
							className="cursor-pointer"
						>
							<LinkIcon className="mr-2 h-4 w-4" />
							<span>Copy link</span>
						</DropdownMenuItem>

						{article.archived ? (
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={async () => {
									await db.open();
									db.unArchiveArticle(article.url);
									setArticle({ ...article, archived: false });
								}}
							>
								<ArchiveRestoreIcon className="mr-2 h-4 w-4" />
								<span>Unarchive</span>
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								className="cursor-pointer"
								onClick={async () => {
									await db.open();
									db.archiveArticle(article.url);
									setArticle({ ...article, archived: true });
								}}
							>
								<ArchiveIcon className="mr-2 h-4 w-4" />
								<span>Archive</span>
							</DropdownMenuItem>
						)}

						<DropdownMenuItem
							className="cursor-pointer text-red-600"
							onClick={async () => {
								navigate('/');
								await db.open();
								db.deleteArticle(article.url);
							}}
						>
							<TrashIcon className="mr-2 h-4 w-4" />
							<span>Delete</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
