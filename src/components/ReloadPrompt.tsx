import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import '@/components/ReloadPrompt';

export function ReloadPrompt() {
	const {
		offlineReady: [offlineReady],
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegistered(r) {
			console.log('SW Registered: ' + r);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		},
	});

	return (
		<div className="ReloadPrompt-container">
			<Button
				variant="outline"
				size="sm"
				onClick={() => updateServiceWorker(true)}
				disabled={!needRefresh || offlineReady}
			>
				Update
			</Button>
		</div>
	);
}

export default ReloadPrompt;
