'use client';

import type * as React from 'react';

import { cn } from '@/lib/utils';

function Separator({ className, ...props }: React.ComponentProps<'hr'>) {
	return (
		<hr data-slot='separator-root' className={cn('shrink-0 border-input', className)} {...props} />
	);
}

export { Separator };
