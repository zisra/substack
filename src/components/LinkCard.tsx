import { Card } from '@/components/ui/card';
import type { ReactNode } from 'react';

export function LinkCard({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<Card className='mb-6 p-0 py-0 shadow-xs transition-all duration-200 hover:bg-card-hover hover:text-accent-foreground'>
			{children}
		</Card>
	);
}
