import { type MarkedExtension } from 'marked';
import katex, { type KatexOptions } from 'katex';

// Define a custom token type
interface KatexToken {
	text: string;
	displayMode: boolean;
}

export const katexExtension = (
	options: KatexOptions = {},
): MarkedExtension => ({
	extensions: [
		{
			name: 'katex',
			level: 'inline' as const,

			// Only start scanning if there’s a backslash
			start(src: string) {
				return src.indexOf('\\');
			},

			tokenizer(src: string) {
				/**
				 * Matches:
				 *  - Inline math:  \( ... \)
				 *  - Block math:   \[ ... \]
				 * Allows 1–3 backslashes on either side for Markdown escaping.
				 * Supports multiline content with [\s\S].
				 */
				const inlineRule = /^(?:\\{2,3})\(([\s\S]+?)(?:\\{2,3})\)/;
				const blockRule = /^(?:\\{2,3})\[([\s\S]+?)(?:\\{2,3})\]/;

				const blockMatch = src.match(blockRule);
				const inlineMatch = src.match(inlineRule);
				const match = blockMatch || inlineMatch;
				if (!match) return;

				return {
					type: 'katex',
					raw: match[0],
					text: match[1],
					displayMode: !!blockMatch,
				} as KatexToken;
			},

			renderer(token) {
				const t = token;

				const text = t.text
					.replaceAll('\\\\', '\\')
					.replaceAll('\\[', '[')
					.replaceAll('\\]', ']')
					.replaceAll('\\_', '_');

				console.log(text);

				try {
					return katex.renderToString(text, {
						...options,
						displayMode: t.displayMode,
						throwOnError: false,
						strict: false,
					});
				} catch (err) {
					console.warn('KaTeX Error:', err);
					return `<span class="katex-error">${t.raw}</span>`;
				}
			},
		},
	],
});
