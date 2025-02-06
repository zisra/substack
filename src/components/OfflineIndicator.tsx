import { WifiOffIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function OfflineIndicator() {
	return (
		<Card className="mb-8">
			<CardContent className="flex flex-col items-center space-y-4 p-6">
				<WifiOffIcon className="h-16 w-16" aria-hidden="true" />
				<p className="text-center text-muted-foreground">
					You are currently offline. Please connect to the internet to save
					articles.
				</p>
			</CardContent>
		</Card>
	);
}
