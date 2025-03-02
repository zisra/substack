import type { FastifyRequest } from 'fastify';

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

export function isScraper(
	request: FastifyRequest<{
		Headers: {
			'user-agent': string;
		};
	}>
) {
	return scraperUserAgents.some((ua) => ua.test(request.headers['user-agent']));
}

const html = String.raw;

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
				${image ? `<meta property="og:image" content="${image}" />` : ''}
				${siteName
					? `<meta property="og:site_name" content="${siteName}" />`
					: ''}
				<title>${title}</title>
			</head>
			<body></body>
		</html>`;
}
