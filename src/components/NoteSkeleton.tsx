import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function NoteSkeleton() {
	return (
		<div className='mx-auto mt-2 max-w-3xl px-4 py-8'>
			<header className='mb-[-4.2px]'>
				<div className='flex items-center space-x-2'>
					<Skeleton className='size-6 rounded-full' />
					<Skeleton className='h-6 w-1/4' />
				</div>
			</header>
			<Separator className='my-6' />
			<div className='mt-7 space-y-4'>
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-full' />
				<Skeleton className='h-6 w-3/4' />
			</div>
		</div>
	);
}
