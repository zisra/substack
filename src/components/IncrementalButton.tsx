import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function IncrementalButton({
	className,
	options,
	value,
	onValueChange,
}: {
	className?: string;
	options: Record<string, string>;
	value: string | null;
	onValueChange: (value: string | null) => void;
}) {
	const [localValue, setLocalValue] = useState<keyof typeof options | null>(value || null);

	useEffect(() => {
		if (value !== localValue) {
			setLocalValue(value);
		}
	}, [value]);

	useEffect(() => {
		if (localValue !== value) {
			onValueChange(localValue);
		}
	}, [localValue]);

	const decreaseFontSize = () => {
		setLocalValue((prev) => {
			const sizes = Object.keys(options);
			const index = sizes.indexOf(prev || sizes[0]);
			return index > 0 ? (sizes[index - 1] as keyof typeof options) : prev;
		});
	};

	const increaseFontSize = () => {
		setLocalValue((prev) => {
			const sizes = Object.keys(options);
			const index = sizes.indexOf(prev || sizes[0]);
			return index < sizes.length - 1 ? (sizes[index + 1] as keyof typeof options) : prev;
		});
	};

	return (
		<div className={cn('flex items-center space-x-2', className)}>
			<Button
				variant='outline'
				size='icon'
				onClick={decreaseFontSize}
				className='[&:not(:hover)]:bg-transparent'
				disabled={localValue === Object.keys(options)[0]}
			>
				<MinusIcon />
			</Button>
			<Card className='flex h-9 w-26 select-none items-center justify-center rounded-md text-sm shadow-xs'>
				{localValue ? options[localValue] : null}
			</Card>
			<Button
				variant='outline'
				size='icon'
				onClick={increaseFontSize}
				className='[&:not(:hover)]:bg-transparent'
				disabled={localValue === Object.keys(options).slice(-1)[0]}
			>
				<PlusIcon />
			</Button>
		</div>
	);
}
