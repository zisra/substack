import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleTextSkeleton() {
	return (
		<div className='mt-6 space-y-4'>
			<Skeleton className='h-6 w-full' />
			<Skeleton className='h-6 w-full' />
			<Skeleton className='mb-8 h-6 w-3/4' />

			<Skeleton className='h-6 w-full' />
			<Skeleton className='h-6 w-full' />
			<Skeleton className='h-6 w-3/4' />
		</div>
	);
}

export function ArticleSkeleton() {
	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<header className='mb-4'>
				<Skeleton className='mb-2 h-10 w-3/4' />
				<Skeleton className='mb-4 h-6 w-1/2' />
				<div className='mt-5 flex items-center space-x-2'>
					<Skeleton className='size-6 rounded-full' />
					<Skeleton className='h-6 w-1/4' />
				</div>
			</header>
			<Separator className='my-4' />
			<ArticleTextSkeleton />
		</div>
	);
}
