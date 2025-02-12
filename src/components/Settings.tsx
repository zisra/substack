import {
	Credenza,
	CredenzaBody,
	CredenzaClose,
	CredenzaContent,
	CredenzaDescription,
	CredenzaFooter,
	CredenzaHeader,
	CredenzaTitle,
	CredenzaTrigger,
} from '@/components/ui/credenza';
import { Button } from './ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { openDB } from 'idb';
import { SettingsIcon } from 'lucide-react';
import ReloadPrompt from './ReloadPrompt';

async function getDataStored() {
	const data = await navigator.storage.estimate();

	if (!data.usage) {
		return null;
	}
	const usageInMB = data.usage / 1024 / 1024;

	return usageInMB.toFixed(2);
}

export function Settings() {
	const [dataStored, setDataStored] = useState<string | null>(null);

	function updateDataStored() {
		getDataStored().then((data) => setDataStored(data));
	}

	return (
		<Credenza>
			<CredenzaTrigger>
				<Button onClick={updateDataStored} variant="outline">
					<SettingsIcon />
				</Button>
			</CredenzaTrigger>
			<CredenzaContent>
				<CredenzaHeader>
					<CredenzaTitle>Settings</CredenzaTitle>
					<CredenzaDescription className="text-neutral-500 dark:text-neutral-400">
						Configure your application settings
					</CredenzaDescription>
				</CredenzaHeader>
				<CredenzaBody>
					<div className="space-y-4">
						<div className="grid gap-1.5">
							<Label>About</Label>
							<p className="text-sm text-neutral-500 dark:text-neutral-400">
								Use this application to save{' '}
								<a
									className="underline"
									href="https://substack.com"
									target="_blank"
								>
									Substack
								</a>{' '}
								articles offline.
							</p>
						</div>
						<div className="grid gap-1.5">
							<Label>Install iOS Shortcut</Label>
							<a href="#" className="text-sm text-blue-500 dark:text-blue-400">
								Click here to install
							</a>
						</div>
						<div className="flex items-center justify-between gap-4">
							<div className="grid gap-1.5">
								<Label>Save Archived Articles Offline</Label>
								<p className="text-sm text-neutral-500 dark:text-neutral-400">
									Should the app save archived articles offline?
								</p>
							</div>
							<Switch />
						</div>
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
							<div className="grid gap-1.5">
								<Label>Update PWA</Label>
								<p className="text-sm text-neutral-500 dark:text-neutral-400">
									Update the PWA to the latest version
								</p>
							</div>

							<ReloadPrompt />
						</div>
						{dataStored ? (
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
								<div className="grid gap-1.5">
									<Label>Manage Storage</Label>
									<p className="text-sm text-neutral-500 dark:text-neutral-400">
										Data stored: {dataStored} MB
									</p>
								</div>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => {
										const db = openDB('Articles', 1);
										db.then((db) => {
											db.deleteObjectStore('articles');
											db.deleteObjectStore('images');
											db.deleteObjectStore('settings');
										});
										localStorage.clear();
										window.location.href = '/';
									}}
								>
									Clear All Storage
								</Button>
							</div>
						) : null}
					</div>
				</CredenzaBody>
				<CredenzaFooter>
					<CredenzaClose asChild>
						<Button type="submit">Done</Button>
					</CredenzaClose>
				</CredenzaFooter>
			</CredenzaContent>
		</Credenza>
	);
}
