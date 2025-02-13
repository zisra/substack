import { Button } from '@/components/ui/button';
import {
	Credenza,
	CredenzaBody,
	CredenzaContent,
	CredenzaDescription,
	CredenzaHeader,
	CredenzaTitle,
	CredenzaTrigger,
} from '@/components/ui/credenza';
import { Label } from '@/components/ui/label';
import { Database } from '@/lib/database';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';

async function getDataStored() {
	const data = await navigator.storage.estimate();

	if (!data.usage) {
		return null;
	}
	const usageInMB = data.usage / 1024 / 1024;

	return usageInMB.toFixed(2);
}

export function About() {
	const [dataStored, setDataStored] = useState<string | null>(null);

	const db = new Database();

	function updateDataStored() {
		getDataStored().then((data) => setDataStored(data));
	}

	return (
		<Credenza>
			<CredenzaTrigger>
				<Button onClick={updateDataStored} variant="outline" size="icon">
					<InfoIcon />
				</Button>
			</CredenzaTrigger>
			<CredenzaContent>
				<CredenzaHeader>
					<CredenzaTitle>Info</CredenzaTitle>
					<CredenzaDescription className="text-neutral-500 dark:text-neutral-400">
						Use this application to save{' '}
						<a
							className="underline"
							href="https://substack.com"
							target="_blank"
							rel="noreferrer"
						>
							Substack
						</a>{' '}
						articles offline.
					</CredenzaDescription>
				</CredenzaHeader>
				<CredenzaBody>
					<div className="space-y-4">
						<div className="grid gap-1.5">
							<Label>Install iOS Shortcut</Label>
							<a href="/" className="text-sm text-blue-500 dark:text-blue-400">
								Click here to install
							</a>
						</div>
						<div className="flex items-center justify-between gap-4">
							<div className="grid gap-1.5">
								<Label>Source Code</Label>
								<p className="text-sm text-neutral-500 dark:text-neutral-400">
									<a
										href="https://github.com/zisra/substack"
										className="text-sm text-blue-500 dark:text-blue-400"
									>
										GitHub
									</a>
								</p>
							</div>
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
									onClick={async () => {
										await db.open();
										await db.clearAll();

										window.location.href = '/';
									}}
								>
									Clear All Storage
								</Button>
							</div>
						) : null}
					</div>
				</CredenzaBody>
			</CredenzaContent>
		</Credenza>
	);
}
