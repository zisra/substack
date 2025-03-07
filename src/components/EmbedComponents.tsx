import { Card, CardContent } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';
import { Link } from 'react-router';

export function ArticleCard({
	title,
	author,
	url,
	image,
	authorImg,
}: {
	title: string;
	author: string;
	url: string;
	image: string;
	authorImg: string;
}) {
	return (
		<Card className='w-full max-w-md mx-auto transition-all duration-200 ease-in-out hover:bg-accent/50 hover:shadow-xs cursor-pointer'>
			<Link to={`/article/?url=${encodeURIComponent(url)}`} className='grow'>
				<div className='mx-auto max-w-xl overflow-hidden'>
					{image && (
						<img className='h-56 w-full object-cover rounded-t-md' src={image} alt={title} />
					)}
					<div className='p-4'>
						<div className='flex items-center'>
							<img
								className='size-6 rounded-full mr-2 pointer-events-none aspect-16/9'
								src={authorImg}
								alt={author}
							/>
							<span className='text-sm text-neutral-500 dark:text-neutral-400'>{author}</span>
						</div>
						<h2 className='mt-2 font-bold text-lg'>{title}</h2>
					</div>
				</div>
			</Link>
		</Card>
	);
}

export function Quote({
	url,
	content,
	author,
}: {
	url: string;
	content: string;
	author: string;
}) {
	return (
		<Card className='w-full max-w-2xl mx-auto duration-200 ease-in-out hover:bg-accent/50 cursor-pointer'>
			<Link to={`/article/?url=${encodeURIComponent(url)}`} className='grow'>
				<CardContent className='pt-6'>
					<div className='relative'>
						<span className='absolute top-0 left-0 text-6xl text-primary opacity-20 -translate-x-4 -translate-y-4 font-serif'>
							<QuoteIcon />
						</span>
						<blockquote className='text-lg leading-relaxed mb-4 pt-4 border-none'>
							{content}
						</blockquote>
						<footer className='text-sm text-muted-foreground'>— {author}</footer>
					</div>
				</CardContent>
			</Link>
		</Card>
	);
}

export default function Comment({
	id,
	author,
	handle,
	avatar,
}: {
	id: string;
	author: string;
	handle: string;
	avatar: string;
}) {
	return (
		<Link to={`/note/?url=${encodeURIComponent(`https://substack.com/@${handle}/note/${id}`)}`}>
			<Card className='flex items-center space-x-4 p-4 duration-200 ease-in-out hover:bg-accent/50 cursor-pointer'>
				<img src={avatar} alt={author} className='w-10 h-10 rounded-full' />
				<div>
					<p className='font-bold'>Comment by {author}</p>
				</div>
			</Card>
		</Link>
	);
}
