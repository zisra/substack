import type { Config } from 'tailwindcss';

export default {
	darkMode: ['variant', '@media not print { .dark & }'],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						'blockquote p:first-of-type::before': null,
						'blockquote p:last-of-type::after': null,
					},
				},
			},
		},
	},
} satisfies Config;
