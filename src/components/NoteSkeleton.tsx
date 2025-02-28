import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function NoteSkeleton() {
	return (
		<div className='max-w-3xl mx-auto px-4 py-8 mt-2'>
			<header className='mb-7'>
				<div className='flex items-center space-x-2'>
					<Skeleton className='size-6 rounded-full' />
					<Skeleton className='h-6 w-1/4' />
				</div>
			</header>
			<Separator className='my-6' />
			<div className='space-y-4 mt-7'>
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-3/4 mb-8' />

				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-3/4' />
			</div>
		</div>
	);
}
