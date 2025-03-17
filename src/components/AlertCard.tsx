import { Card, CardContent } from '@/components/ui/card';

export function AlertCard({
	children,
	title,
	icon,
}: {
	children: string;
	title: string;
	icon: React.ReactNode;
}) {
	return (
		<Card className='mb-8'>
			<CardContent className='flex flex-col items-center space-y-4 p-6'>
				{icon}
				<h3 className='text-md'>{title}</h3>
				<p className='text-center text-muted-foreground'>{children}</p>
			</CardContent>
		</Card>
	);
}
