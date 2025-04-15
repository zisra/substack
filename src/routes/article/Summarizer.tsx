'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn, sanitizeDom } from '@/lib/utils';
import { streamText } from 'ai';
import { HtmlRenderer, Parser } from 'commonmark';
import { Send, TextIcon } from 'lucide-react';
import { createOllama } from 'ollama-ai-provider';
import { useEffect, useRef, useState } from 'react';

function markdownToHtml(markdown: string) {
	const reader = new Parser();
	const writer = new HtmlRenderer();
	const parsed = reader.parse(markdown);
	return writer.render(parsed);
}

enum MessageRole {
	USER = 'user',
	ASSISTANT = 'assistant',
	SYSTEM = 'system',
}
type Message = { role: MessageRole; content: string };

function Message({ message }: { message: Message }) {
	return (
		<div
			key={'x'}
			className={cn(message.role === MessageRole.ASSISTANT ? 'bg-muted' : 'bg-background', 'p-4')}
		>
			<div className='mb-2 font-bold'>{message.role === MessageRole.ASSISTANT ? 'AI' : 'User'}</div>
			<div
				className='prose prose-sm dark:prose-invert max-w-full break-words'
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Markdown content
				dangerouslySetInnerHTML={{
					__html: sanitizeDom(markdownToHtml(message.content)),
				}}
			/>
		</div>
	);
}

const BASE_URL = 'http://localhost:11434/api';

export function Summarizer({ content }: { content: string | null }) {
	const [isLoading, setIsLoading] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const [models, setModels] = useState<{ name: string; model: string }[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>('');
	const [isOpen, setIsOpen] = useState(false);
	const [followUpQuestion, setFollowUpQuestion] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const ollama = createOllama({ baseURL: BASE_URL });

	useEffect(() => {
		const fetchModels = async () => {
			try {
				const response = await fetch(`${BASE_URL}/tags`);
				if (!response.ok) throw new Error('Failed to fetch models');
				const data = await response.json();
				const modelList = data.models.map((model: { name: string; model: string }) => ({
					name: model.name,
					model: model.model,
				}));
				setModels(modelList);

				if (modelList.length > 0) {
					setSelectedModel(modelList[0].name);
				}
			} catch (error) {
				console.error('Error fetching models:', error);
			}
		};

		fetchModels();
	}, []);

	const handleSubmit = async () => {
		if (!content || isStreaming) return;

		setIsLoading(true);
		setIsStreaming(true);

		const systemPrompt = {
			role: MessageRole.SYSTEM,
			content:
				'You are a helpful assistant that summarizes articles. You will be provided with an article and you need to summarize it extensively. Do not add any personal opinions or interpretations, just describe the article as if it is true. ALWAYS capture the tone, perspective and POV of the author. NEVER come up with additional information. Do not output any markdown outside of commonmark.',
		};

		const userPrompt = {
			role: MessageRole.USER,
			content: `Summarize the following article:\n\n${content}`,
		};

		const initialMessages = [systemPrompt, userPrompt];
		setMessages(initialMessages);

		try {
			const response = streamText({
				model: ollama(selectedModel),
				messages: initialMessages,
				temperature: 0.5,
			});

			let summary = '';
			for await (const chunk of response.textStream) {
				summary += chunk;
				setMessages([...initialMessages, { role: MessageRole.ASSISTANT, content: summary }]);
			}
		} catch (error) {
			console.error('Error generating summary:', error);
		} finally {
			setIsLoading(false);
			setIsStreaming(false);
		}
	};

	const handleSendFollowUp = async () => {
		if (!followUpQuestion.trim() || isStreaming) return;

		const userMsg = { role: MessageRole.USER, content: followUpQuestion };
		const newMessageHistory = [...messages, userMsg];
		setMessages(newMessageHistory);
		setFollowUpQuestion('');
		setIsStreaming(true);

		try {
			const response = streamText({
				model: ollama(selectedModel || models[0]?.model),
				messages: newMessageHistory,
				temperature: 0.5,
			});

			let reply = '';
			for await (const chunk of response.textStream) {
				reply += chunk;
				setMessages([...newMessageHistory, { role: MessageRole.ASSISTANT, content: reply }]);
			}
		} catch (error) {
			console.error('Error generating follow-up response:', error);
		} finally {
			setIsStreaming(false);
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button variant='outline' size='icon'>
					<TextIcon />
				</Button>
			</SheetTrigger>
			<SheetContent className='flex w-full flex-col p-0 sm:max-w-md md:max-w-lg' side='right'>
				<div className='border-b'>
					<SheetHeader>
						<SheetTitle>Summarize Article</SheetTitle>
					</SheetHeader>
				</div>

				<div className='flex items-center border-b px-4 pb-4'>
					<div className='flex-1'>
						<Select value={selectedModel} onValueChange={setSelectedModel}>
							<SelectTrigger>
								<SelectValue placeholder='Select LLM' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{models.map((model) => (
										<SelectItem key={model.name} value={model.name}>
											{model.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<Button onClick={handleSubmit} disabled={isStreaming || isLoading}>
						{isLoading ? 'Summarizing...' : 'Summarize'}
					</Button>
				</div>

				<div ref={chatContainerRef} className='flex-1 overflow-y-auto'>
					{messages.length <= 1 ? (
						<div className='py-8 text-center text-muted-foreground'>
							Click "Summarize" to generate a summary
						</div>
					) : (
						messages

							.filter((msg) => msg.role !== MessageRole.SYSTEM)
							.slice(1) // Skip the first message
							.map((message) => <Message key='x' message={message} />)
					)}
				</div>

				<div className='mt-auto border-t p-4'>
					<div className='relative'>
						<Input
							className='pr-10'
							placeholder='Ask a follow-up question...'
							value={followUpQuestion}
							onChange={(e) => setFollowUpQuestion(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !isStreaming) handleSendFollowUp();
							}}
							disabled={messages.length === 0}
						/>
						<Button
							size='icon'
							variant='ghost'
							className='absolute top-0 right-0 h-full rounded-l-none hover:bg-none!'
							onClick={handleSendFollowUp}
							disabled={messages.length === 0 || !followUpQuestion.trim() || isStreaming}
						>
							<Send className='h-4 w-4' />
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
