'use client';

import { cn } from '@/lib/utils';

function Separator({ className }: {
  className?: string;
}) {
	return (
		<hr
			className={cn(
				'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
				className
			)}
		/>
	);
}

export { Separator };
