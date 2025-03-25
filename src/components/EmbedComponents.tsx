import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
		<Card className='mx-auto w-full max-w-lg cursor-pointer p-2 shadow-xs transition-all duration-200 hover:bg-card-hover'>
			<Link to={`/article/?url=${encodeURIComponent(url)}`} className='grow'>
				<div className='mx-auto max-w-xl overflow-hidden'>
					{image && <img className='h-56 w-full rounded-md object-cover' src={image} alt={title} />}
					<div className='p-2 pt-4'>
						<div className='flex items-center'>
							<img
								className='pointer-events-none mr-2 aspect-16/9 size-6 rounded-full'
								src={authorImg}
								alt={author}
							/>
							<span className='text-muted-foreground text-sm'>{author}</span>
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
		<Card className='mx-auto w-full max-w-2xl cursor-pointer px-2 py-4 shadow-xs duration-200 hover:bg-card-hover'>
			<Link to={`/article/?url=${encodeURIComponent(url)}`} className='grow'>
				<CardContent className='pt-4'>
					<div className='relative'>
						<span className='-translate-x-4 -translate-y-4 absolute top-0 left-0 font-serif text-6xl text-primary opacity-20'>
							<QuoteIcon />
						</span>
						<blockquote className='mb-4 border-none pt-4 text-lg leading-relaxed'>
							{content}
						</blockquote>
						<footer className='text-muted-foreground text-sm'>— {author}</footer>
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
			<Card className='flex cursor-pointer items-center space-x-4 p-4 shadow-xs duration-200 hover:bg-card-hover'>
				<Avatar className='size-10'>
					<AvatarImage src={avatar} alt={author} />
					<AvatarFallback>{author.charAt(0)}</AvatarFallback>
				</Avatar>
				<div>
					<p className='font-bold'>Comment by {author}</p>
				</div>
			</Card>
		</Link>
	);
}
