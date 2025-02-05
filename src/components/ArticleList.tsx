import { Card, CardContent } from '@/components/ui/card';
import type { Article } from '@/lib/types';
import { BookOpenText } from 'lucide-react';
import { Link } from 'react-router';

export function ArticleList({ articles }: { articles: Article[] }) {
	if (articles.length === 0) {
		return (
			<Card className="p-8 text-center">
				<BookOpenText className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-2 text-sm font-semibold text-gray-900">
					No articles
				</h3>
				<p className="mt-1 text-sm text-gray-500">
					Get started by saving your first article.
				</p>
			</Card>
		);
	}

	return articles.map((article, index) => {
		return (
			<Link to={`/article/?url=${encodeURIComponent(article.url)}`} key={index}>
				<Card
					key={index}
					className="transition-all duration-300 ease-in-out hover:shadow-sm hover:bg-accent/50 cursor-pointer"
				>
					<CardContent className="p-4">
						<div className="flex">
							<div className="flex-grow pr-4">
								<div className="flex items-center mb-2">
									<img
										src={article.authorImg}
										alt={article.author}
										className="w-6 h-6 rounded-full mr-2 pointer-events-none"
									/>
									<span className="text-sm text-muted-foreground">
										{article.author}
									</span>
								</div>
								<h3 className="font-bold text-lg mb-2">{article.title}</h3>
								<p className="text-sm text-gray-600">{article.subtitle}</p>
							</div>
							<div className="flex-shrink-0">
								<img
									src={article.image || '/placeholder.svg'}
									alt={article.title}
									className="w-24 h-24 object-cover rounded-md pointer-events-none"
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		);
	});
}
