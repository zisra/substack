import { Button } from '@/components/ui/button';
import { ChatContainerRoot } from '@/components/ui/chat-container';
import { Input } from '@/components/ui/input';
import { Message, MessageContent } from '@/components/ui/message';
import { ScrollButton } from '@/components/ui/scroll-button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { fetchAllModels } from '@/lib/fetchModels';
import { getDefaultModel, getModel } from '@/lib/models';
import { cn } from '@/lib/utils';
import { smoothStream, streamText } from 'ai';
import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';

type ModelInfo = {
	name: string;
	model: string;
	provider: string;
};

enum MessageRole {
	USER = 'user',
	ASSISTANT = 'assistant',
	SYSTEM = 'system',
}
type WrappedMessage = { role: MessageRole; content: string };

function WrappedMessage({ message }: { message: WrappedMessage }) {
	return (
		<Message
			className={cn(
				message.role === MessageRole.ASSISTANT ? 'bg-muted' : 'bg-background',
				'p-2 pl-4',
				// TODO: pl-4 not visible
			)}
		>
			<div className='mb-2 font-bold'>{message.role === MessageRole.ASSISTANT ? 'AI' : 'User'}</div>
			<MessageContent
				markdown
				className='prose prose-neutral prose-sm dark:prose-invert max-w-full break-words'
			>
				{message.content}
			</MessageContent>
		</Message>
	);
}

export function Summarizer({
	content,
	title,
	subtitle,
}: {
	content: string | null;
	title: string;
	subtitle: string;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const [hasSummarized, setHasSummarized] = useState(false);
	const [models, setModels] = useState<ModelInfo[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>('');
	const [isOpen, setIsOpen] = useState(false);
	const [followUpQuestion, setFollowUpQuestion] = useState('');
	const [messages, setMessages] = useState<WrappedMessage[]>([]);

	useEffect(() => {
		const fetchModelsAsync = async () => {
			const modelList = await fetchAllModels();
			setModels(modelList);
			if (modelList.length > 0) setSelectedModel(getDefaultModel() || modelList[0].name);
		};
		fetchModelsAsync();
	}, []);

	const handleSubmit = async () => {
		if (!content || isStreaming) return;

		setIsLoading(true);
		setHasSummarized(true);
		setIsStreaming(true);

		const systemPrompt = {
			role: MessageRole.SYSTEM,
			content: `You are a helpful assistant that summarizes articles. You will be provided with an article, and your task is to provide a comprehensive summary of the contents of that article. Ensure that you capture the author's tone, perspective, and point of view accurately. Do not include personal opinions or interpretations, and refrain from adding any additional information. Output should be in plain text with markdown formatting. You may be asked follow-up questions later, so respond to those as thoroughly as possible, but do not ever answer something unrelated to the article.`,
		};

		const userPrompt = {
			role: MessageRole.USER,
			content: `Summarize the following article. Title: ${title}\nSubtitle: ${subtitle}\nContent: ${content}`,
		};

		const initialMessages = [systemPrompt, userPrompt];
		setMessages(initialMessages);

		try {
			const selected = models.find((m) => m.name === selectedModel);
			if (!selected) return;

			const response = streamText({
				model: getModel(selected.provider, selected.model),
				messages: initialMessages,
				experimental_transform: smoothStream({
					delayInMs: 20,
					chunking: 'word',
				}),
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
			const selected = models.find((m) => m.name === selectedModel);
			if (!selected) return;

			const response = streamText({
				model: getModel(selected.provider, selected.model),
				messages: newMessageHistory,
				temperature: 0.2,
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
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						stroke-width='2'
						stroke-linecap='round'
						stroke-linejoin='round'
					>
						<title>Summarize</title>
						<path d='m17 16 3 3-3 3' />
						<path d='M19 5H7' />
						<path d='M3 4.5V17a2 2 0 0 0 2 2h15' />
						<path d='M7 10h9' />
					</svg>
				</Button>
			</SheetTrigger>
			<SheetContent className='flex w-full flex-col p-0 md:w-2xl' side='right'>
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
								<SelectGroup defaultValue={selectedModel}>
									{models.map((model) => (
										<SelectItem key={model.name} value={model.name}>
											{model.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<Button onClick={handleSubmit} disabled={isStreaming || hasSummarized}>
						{isLoading ? 'Summarizing...' : 'Summarize'}
					</Button>
				</div>

				<ChatContainerRoot>
					<div className='flex-1 overflow-y-auto'>
						{messages.length <= 1 ? (
							<div className='py-8 text-center text-muted-foreground'>
								Click "Summarize" to generate a summary
							</div>
						) : (
							messages

								.filter((msg) => msg.role !== MessageRole.SYSTEM)
								.slice(1) // Skip the first message
								.map((message) => <WrappedMessage key={message.role} message={message} />)
						)}
					</div>
					<div className='absolute right-4 bottom-20 z-1000'>
						<ScrollButton />
					</div>
				</ChatContainerRoot>

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
							className='absolute top-0 right-0 h-full rounded-l-none hover:bg-transparent!'
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
