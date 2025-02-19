import { Formatting } from '@/components/modals/Formatting';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import type { Database } from '@/lib/database';
import type { ArticleSaved, Settings } from '@/lib/types';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';
import {
	ArchiveIcon,
	ArchiveRestoreIcon,
	ExternalLinkIcon,
	LinkIcon,
	MoreVerticalIcon,
	PrinterIcon,
	TrashIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function ArticleControls({
	db,
	setArticle,
	article,
	onSettingsChange,
	failed,
}: {
	db: Database;
	setArticle: React.Dispatch<React.SetStateAction<ArticleSaved | null>>;
	article: ArticleSaved;
	onSettingsChange: (settings: Settings) => void;
	failed: boolean;
}) {
	const navigate = useNavigate();

	return (
		<div className="print:hidden">
			<Separator className="my-4" />
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
						href={article.url}
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
								navigator.clipboard.writeText(article.url);
							}}
							className="cursor-pointer"
						>
							<LinkIcon className="mr-2 size-4" />
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
								disabled={failed}
							>
								<ArchiveRestoreIcon className="mr-2 size-4" />
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
								<ArchiveIcon className="mr-2 size-4" />
								<span>Archive</span>
							</DropdownMenuItem>
						)}

						<DropdownMenuItem
							variant="destructive"
							onClick={async () => {
								navigate('/');
								await db.open();
								db.deleteArticle(article.url);
							}}
						>
							<TrashIcon className="mr-2 size-4" />
							<span>Delete</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
