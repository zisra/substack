import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';

export const ollama = createOllama({ baseURL: 'http://localhost:11434/api' });

export const openai = createOpenAI({
	apiKey: import.meta.env.VITE_OPENAI_KEY || '',
	compatibility: 'strict',
});

export function getModel(provider: string, modelName: string) {
	if (provider === 'ollama') {
		return ollama(modelName);
	}
	return openai(modelName);
}

export function getDefaultModel() {
	if (navigator.onLine) {
		return 'gpt-4.1-nano';
	}
}
