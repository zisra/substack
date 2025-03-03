import { Hono } from 'hono';
import { html } from 'hono/html';

export const scraperUserAgents = [
	/googlebot/i,
	/bingbot/i,
	/slurp/i,
	/yahoo/i,
	/yandex/i,
	/facebookexternalhit/i,
	/duckduckbot/i,
	/baiduspider/i,
	/rogerbot/i,
	/spbot/i,
	/applebot/i,
	/facebot/i,
	/twitterbot/i,
	/pinterestbot/i,
	/bingpreview/i,
	/discordbot/i,
];

export function isScraper(userAgent: string) {
	return scraperUserAgents.some((ua) => ua.test(userAgent));
}

export function renderHtml({
	title,
	description,
	image,
	siteName,
}: {
	title: string;
	description: string;
	image?: string;
	siteName?: string;
}) {
	return html`<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta property="og:title" content="${title}" />
				<meta property="og:description" content="${description}" />
				${image ? html`<meta property="og:image" content="${image}" />` : ''}
				${siteName
					? html`<meta property="og:site_name" content="${siteName}" />`
					: ''}
				<title>${title}</title>
			</head>
			<body></body>
		</html>`;
}
