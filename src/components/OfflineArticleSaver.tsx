import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';

type Article = {
	url: string;
	title: string;
	subtitle: string;
	author: string;
	authorImg: string;
	image: string;
};

function ArticleList({ articles }: { articles: Article[] }) {
	return articles.map((article, index) => {
		return (
			<Card
				key={index}
				className="transition-all duration-300 ease-in-out hover:shadow-sm hover:bg-accent/50 cursor-pointer"
			>
				<CardContent className="p-4">
					<div className="flex">
						<div className="flex-grow pr-4">
							<div className="flex items-center mb-2">
								<img
									src={article.authorImg || '/placeholder.svg'}
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
		);
	});
}

export default function OfflineArticleSaver() {
	const [url, setUrl] = useState('');

	const handleSave = () => {
		// Implement save functionality here
		console.log('Saving URL:', url);
		setUrl('');
	};

	const savedArticles: Article[] = [
		{
			url: 'https://www.richardhanania.com/p/ayn-rand-as-self-help-the-good-the',
			title: 'Ayn Rand as Self-Help: The Good, the Bad, and the Tragicomedy',
			subtitle: "Analyzing Rand's views on psychology",
			author: 'Richard Hanania',
			authorImg:
				'https://substackcdn.com/image/fetch/w_36,h_36,c_fill,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2de4c8df-7f9c-4bca-901c-53a83a3e97eb_2736x1824.jpeg',
			image:
				'https://substackcdn.com/image/fetch/w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F35b59368-39d1-4a82-995f-37de8f254654_956x1138.png',
		},
	];

	return (
		<div className="container mx-auto p-4 max-w-3xl">
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Save Article Offline</CardTitle>
					<CardDescription>
						Enter a URL to save an article for offline reading
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex space-x-2">
						<Input
							type="url"
							placeholder="Enter article URL"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							className="flex-grow"
						/>
						<Button onClick={handleSave}>Save Offline</Button>
					</div>
				</CardContent>
			</Card>

			<h2 className="text-2xl font-bold mb-4">Saved Articles</h2>
			<div className="grid gap-4">
				<ArticleList articles={savedArticles} />
			</div>
		</div>
	);
}
