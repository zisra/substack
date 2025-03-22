'use client';

import { cn } from '@/lib/utils';

function Separator({ className }: { className?: string }) {
	return <hr className={cn(className)} />;
}

export { Separator };
