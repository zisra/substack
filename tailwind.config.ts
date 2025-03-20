import type { Config } from 'tailwindcss';

export default {
	darkMode: ['variant', '@media not print { .dark & }'],
} satisfies Config;
