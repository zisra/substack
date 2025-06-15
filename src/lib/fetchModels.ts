export const OLLAMA_BASE_URL = 'http://localhost:11434/api';

let openaiModels = ['gpt-4.1-mini', 'gpt-4.1-nano'].map((name) => ({
	name: name,
	model: name,
	provider: 'openai',
}));

if (!navigator.onLine) {
	openaiModels = [];
}

export async function fetchAllModels(): Promise<
	{ name: string; model: string; provider: string }[]
> {
	try {
		const res = await fetch(`${OLLAMA_BASE_URL}/tags`);
		if (!res.ok) throw new Error('Failed to fetch Ollama models');
		const data = await res.json();
		const ollamaModels = data.models.map((m: { name: string; model: string }) => ({
			name: m.name.replace(':latest', ''),
			model: m.name,
			provider: 'ollama',
		}));

		return [...ollamaModels, ...openaiModels];
	} catch (err) {
		console.warn('Error fetching models:', err);
		return [...openaiModels]; // Fallback to OpenAI only
	}
}
