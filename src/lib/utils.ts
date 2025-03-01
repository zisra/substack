import type { Settings } from '@/lib/types';
import { type ClassValue, clsx } from 'clsx';
import DOMPurify from 'dompurify';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function fontFormatting(settings: Settings | null) {
	return cn(
		settings?.formatting.fontFamily === 'sans' && 'font-sans',
		settings?.formatting.fontFamily === 'serif' && 'font-serif',
		settings?.formatting.fontFamily === 'mono' && 'font-mono',
	);
}

export function articleFormatting(settings: Settings | null) {
	return cn(
		fontFormatting(settings),
		settings?.formatting.fontSize === 'sm' && 'prose-sm print:prose-sm',
		settings?.formatting.fontSize === 'base' && 'prose-base',
		settings?.formatting.fontSize === 'dynamic' && 'prose-base lg:prose-lg print:prose-sm',
		settings?.formatting.fontSize === null && 'prose-base lg:prose-lg print:prose-sm',
		settings?.formatting.fontSize === 'lg' && 'prose-lg',
		settings?.formatting.fontSize === 'xl' && 'prose-xl',
		settings?.formatting.printImages === false &&
			'print:prose-img:hidden print:prose-figcaption:hidden',
		'prose space-y-4 prose-img:mx-auto prose-figcaption:text-center dark:prose-invert prose-figcaption:mt-[-18px] prose-blockquote:font-normal prose-blockquote:not-italic prose-hr:border-input max-w-none break-words',
	);
}

export function checkUrlValid(url: string) {
	try {
		new URL(url);
		return false;
	} catch (e) {
		return true;
	}
}

export async function getDataStored() {
	const data = await navigator.storage.estimate();

	if (!data.usage) {
		return null;
	}
	const usageInMB = data.usage / 1024 / 1024;

	return usageInMB.toFixed(2);
}

export function sanitizeDom(html: string) {
	return DOMPurify.sanitize(html);
}
