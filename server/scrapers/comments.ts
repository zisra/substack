import he from 'he';

export async function scrapeComments(url: string) {
	const apiUrl = `${url}/comments`;

	const res = await fetch(apiUrl);
	const html = await res.text();

	// Extract the script content
	const scriptStart = '<script>window._preloads ';
	const scriptEnd = '</script>';

	const startIndex = html.indexOf(scriptStart) + scriptStart.length;
	const endIndex = html.indexOf(scriptEnd, startIndex);

	let jsonString = html.substring(startIndex, endIndex);

	// Remove the assignment and JSON.parse wrapper
	jsonString = jsonString.replace('= JSON.parse("', '').replace('");', '');

	// Normalize all multiple backslashes to single backslashes
	jsonString = jsonString.replace(/\\\\/g, '\\').replace(/\\\\"/g, '"').trim();

	// Decode HTML entities
	jsonString = he.decode(jsonString);

	try {
		const jsonData = JSON.parse(jsonString);

		return jsonData;
	} catch (error) {
		console.error('JSON parsing failed:', error);
		return {
			html: jsonString,
			error: 'Failed to parse JSON',
		};
	}
}
