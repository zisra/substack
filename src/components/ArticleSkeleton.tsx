import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleTextSkeleton() {
	return (
		<div className='space-y-4 mt-6'>
			<Skeleton className='h-6 w-full' />
			<Skeleton className='h-6 w-full' />
			<Skeleton className='h-6 w-3/4 mb-8' />

			<Skeleton className='h-6 w-full' />
			<Skeleton className='h-6 w-full' />
			<Skeleton className='h-6 w-3/4' />
		</div>
	);
}

export function ArticleSkeleton() {
	return (
		<div className='max-w-3xl mx-auto px-4 py-8'>
			<header className='mb-4'>
				<Skeleton className='h-10 w-3/4 mb-2' />
				<Skeleton className='h-6 w-1/2 mb-4' />
				<div className='flex items-center space-x-2 mt-5'>
					<Skeleton className='size-6 rounded-full' />
					<Skeleton className='h-6 w-1/4' />
				</div>
			</header>
			<Separator className='my-4' />
			<ArticleTextSkeleton />
		</div>
	);
}
