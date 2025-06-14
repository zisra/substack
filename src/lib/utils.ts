import type { Settings } from '@/lib/types';
import { type ClassValue, clsx } from 'clsx';
import DOMPurify from 'dompurify';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function fontFormatting(settings: Settings | null, excludeSerifs?: boolean) {
	if (settings?.formatting.fontFamily === 'serif' && excludeSerifs === true) {
		return '';
	}
	return cn(
		settings?.formatting.fontFamily === 'sans' && 'font-sans',
		settings?.formatting.fontFamily === 'serif' && 'font-serif prose-headings:font-sans',
		settings?.formatting.fontFamily === 'mono' && 'font-mono',
	);
}
export function articleFormatting(settings: Settings | null) {
	return cn(
		// Apply custom font family and weight
		fontFormatting(settings),

		// Apply font size based on user setting
		{
			'prose-sm': settings?.formatting.fontSize === 'sm',
			'prose-base': settings?.formatting.fontSize === 'base',
			'prose-base lg:prose-lg':
				settings?.formatting.fontSize === 'dynamic' || settings?.formatting.fontSize === null,
			'prose-lg': settings?.formatting.fontSize === 'lg',
			'prose-xl': settings?.formatting.fontSize === 'xl',
		},

		// Hide images and captions when printing, if user disabled print images
		settings?.formatting.printImages === false &&
			'print:prose-figcaption:hidden print:prose-img:hidden',

		// Force smaller prose on print
		'print:prose-sm!',

		// Base prose styling
		'prose',
		'prose-neutral',
		'dark:prose-invert',

		// Image styling
		'prose-img:mx-auto',
		'prose-img:max-h-[650px]',
		'max-w-none',

		// Layout and spacing
		'space-y-4',
		'break-words',

		// HR styling
		'prose-hr:border-input',

		// Figcaption styling
		'prose-figcaption:mt-[-20px]!',
		'print:prose-figcaption:mt-[-20px]!',
		'prose-figcaption:text-center',

		// Blockquote styling
		'prose-blockquote:font-normal',
		'prose-blockquote:not-italic',
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
	return DOMPurify.sanitize(html, {
		ADD_TAGS: ['iframe'],
		ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
	});
}
