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
import { getDataStored } from '@/lib/utils';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';

export function About() {
	const [dataStored, setDataStored] = useState<string | null>(null);

	const db = new Database();

	function updateDataStored() {
		getDataStored().then((data) => setDataStored(data));
	}

	return (
		<Credenza>
			<CredenzaTrigger asChild>
				<Button onClick={updateDataStored} variant='outline' size='icon'>
					<InfoIcon />
				</Button>
			</CredenzaTrigger>
			<CredenzaContent>
				<CredenzaHeader>
					<CredenzaTitle>Info</CredenzaTitle>
					<CredenzaDescription className='text-neutral-500 dark:text-neutral-400'>
						Use this application to save{' '}
						<a className='underline' href='https://substack.com' target='_blank' rel='noreferrer'>
							Substack
						</a>{' '}
						articles offline.
					</CredenzaDescription>
				</CredenzaHeader>
				<CredenzaBody>
					<div className='mb-2 space-y-4'>
						<div className='grid gap-1.5'>
							<Label>Install iOS Shortcut</Label>
							<p className='text-sm'>
								<a
									href='https://www.icloud.com/shortcuts/b67b3dbd230648cd949bdab9bf4560c9'
									className='text-blue-500 dark:text-blue-400'
									target='_blank'
									rel='noreferrer'
								>
									Click here to install
								</a>
							</p>
						</div>
						<div className='flex items-center justify-between gap-4'>
							<div className='grid gap-1.5'>
								<Label>Source Code</Label>
								<p className='text-sm'>
									<a
										href='https://github.com/zisra/substack'
										className='text-blue-500 dark:text-blue-400'
										target='_blank'
										rel='noreferrer'
									>
										GitHub
									</a>
								</p>
							</div>
						</div>
						{dataStored && (
							<div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
								<div className='grid gap-1.5'>
									<Label>Manage Storage</Label>
									<p className='text-neutral-500 text-sm dark:text-neutral-400'>
										Data stored: {dataStored} MB
									</p>
								</div>
								<Button
									variant='destructive'
									size='sm'
									className='mb-2 sm:mb-0'
									onClick={async () => {
										await db.open();
										await db.clearAll();

										window.location.href = '/';
									}}
								>
									Clear All Storage
								</Button>
							</div>
						)}
					</div>
				</CredenzaBody>
			</CredenzaContent>
		</Credenza>
	);
}
