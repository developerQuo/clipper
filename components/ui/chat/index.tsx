import { useRef, useState, useEffect, useMemo } from 'react';
import styles from '@/styles/Home.module.css';
import { Message, SourceDocs } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';

type MessageState = {
	messages: Message[];
	history: [string, string][];
	pendingSourceDocs?: SourceDocs[];
	pending?: string;
};

const defaultMessageState: MessageState = {
	messages: [
		{
			message: 'Find out more in chat!',
			type: 'apiMessage',
		},
	],
	history: [],
	pendingSourceDocs: [],
};

type InputProps = {
	contentId: string;
	source: string;
	summary: string;
	faq: string[];
};

export default function ChatDoc({
	contentId,
	source,
	summary,
	faq,
}: InputProps) {
	const [query, setQuery] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [messageState, setMessageState] =
		useState<MessageState>(defaultMessageState);

	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};

	useEffect(() => {
		const fetch = async () => {
			const { data, error } = await supabase
				.from('chat_history')
				.select('user_history,bot_history')
				.eq('content_id', contentId)
				.eq('user_id', userId);

			if (!error && data && data.length > 0) {
				setMessageState(({ history, messages, ...state }) => {
					const { user_history, bot_history } = data[0];
					const historyOrdering = bot_history.map(
						(text: string, index: number) => [user_history[index], text],
					);
					return {
						...defaultMessageState,
						history: historyOrdering,
						messages: [
							...defaultMessageState.messages,
							...historyOrdering
								.flat()
								.map((message: string, index: number) => ({
									type: index % 2 === 0 ? 'userMessage' : 'apiMessage',
									message,
								})),
						],
					};
				});
				setLoading(false);
			}
		};
		if (userId && contentId) {
			fetch();
		}
	}, [contentId, userId]);

	const { messages, history, pending, pendingSourceDocs } = messageState;

	const messageListRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		textAreaRef.current?.focus();
	}, []);

	//handle form submission
	async function handleSubmit(e: any, value?: string) {
		e.preventDefault();

		const input = query || value;
		console.log(input, query, value);
		if (!input) {
			alert('Please input a question');
			return;
		}

		const question = input.trim();

		setMessageState((state) => ({
			...state,
			messages: [
				...state.messages,
				{
					type: 'userMessage',
					message: question,
				},
			],
			pending: '',
		}));

		setLoading(true);
		setQuery('');
		const ctrl = new AbortController();
		try {
			await fetchEventSource('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					question,
					history,
					contentId,
					source,
				}),
				signal: ctrl.signal,
				onmessage: (event) => {
					// console.log('event', event.data);
					if (event.data === '[DONE]') {
						setMessageState((state) => {
							// console.log('done', state);
							return {
								history: [...state.history, [question, state.pending ?? '']],
								messages: [
									...state.messages,
									{
										type: 'apiMessage',
										message: state.pending ?? '',
										sourceDocs: state.pendingSourceDocs,
									},
								],
								// pending: undefined,
								pendingSourceDocs: undefined,
							};
						});
						setLoading(false);
						ctrl.abort();
					} else {
						const { data } = JSON.parse(event.data);
						if (data.metadata) {
							// console.log('--------------', data.metadata);
							setMessageState((state) => ({
								...state,
								pendingSourceDocs: data.metadata,
								pending: data.text,
							}));
						} else {
							setMessageState((state) => ({
								...state,
								pending: (state.pending ?? '') + data,
							}));
						}
					}
				},
			});
			setLoading(false);
		} catch (error) {
			setLoading(false);
			setError('An error occurred while fetching the data. Please try again.');
			console.log('error', error);
		}
	}

	//prevent empty submissions
	const handleEnter = (e: any) => {
		if (e.key === 'Enter' && query) {
			handleSubmit(e);
		} else if (e.key == 'Enter') {
			e.preventDefault();
		}
	};

	// 채팅 기록 초기화
	const resetChatHistory = async () => {
		const { error } = await supabase
			.from('chat_history')
			.update({ user_history: [], bot_history: [] })
			.eq('content_id', contentId)
			.eq('user_id', userId);

		if (!error) {
			setMessageState(defaultMessageState);
		}
	};

	const chatMessages = useMemo(() => {
		return [
			...messages,
			...(pending
				? [
						{
							type: 'apiMessage',
							message: pending,
							sourceDocs: pendingSourceDocs,
						},
				  ]
				: []),
		];
	}, [messages, pending, pendingSourceDocs]);

	useEffect(() => {
		if (messageListRef.current) {
			//scroll to bottom
			const scrollHeight = messageListRef.current?.scrollHeight ?? 0;
			const height = messageListRef.current?.clientHeight ?? 0;
			const maxScrollTop = scrollHeight - height;
			messageListRef.current!.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
		}
	}, [chatMessages]);

	// console.log('render', chatMessages); 
	return (
		<main className="flex h-full w-full flex-col items-center justify-between bg-white px-20">
			<div className="flex h-[75vh] w-full items-center justify-center rounded-lg">
				<div
					ref={messageListRef}
					className="h-full w-full overflow-y-auto rounded-lg"
				>
					<div className="text-sm leading-6">{summary}</div>
					<div className="mb-8 mt-6 flex flex-col space-y-2 text-sm">
						<span className="text-base font-extrabold">
							Check out and click the main topics below:
						</span>
						{faq?.map((q, index) => (
							<button
								key={`faq-${index}`}
								className="btn-outline btn-sm btn w-fit rounded-3xl px-4 text-xs font-medium"
								onClick={(e) => {
									const val = (e.target as any).textContent;
									handleSubmit(e, val);
								}}
							>
								{q}
							</button>
						))}
					</div>
					{chatMessages.map((message, index) => {
						let icon;
						let className;
						if (message.type === 'apiMessage') {
							className = 'chat chat-start';
						} else {
							// The latest message sent by the user will be animated while waiting for a response
							className = 'chat chat-end';
							// loading && index === chatMessages.length - 1
							// 	? styles.usermessagewaiting
							// 	: styles.usermessage;
						}
						return (
							<>
								<div
									key={`message-${message.type}-${index}`}
									className={className}
								>
									<div className="chat-bubble max-w-7xl">
										<div className={styles.markdownanswer}>
											<ReactMarkdown>
												{message.message}
											</ReactMarkdown>
										</div>
									</div>
								</div>
								{message.sourceDocs?.length ? (
									<div className="p-5">
										<Accordion type="single" collapsible className="flex-col">
											<AccordionItem value={`item-${index}`}>
												<AccordionTrigger>
													<h3>Source</h3>
												</AccordionTrigger>
												<AccordionContent>
													{message.sourceDocs
														.sort((a, b) => (a.page > b.page ? 1 : -1))
														// .map((doc) => `${doc.source}/p.${doc.page}`)
														.reduce((result: string[], doc) => {
															const source = `${doc.source}/p.${doc.page}`;
															if (!result.includes(source)) {
																result.push(source);
															}
															return result;
														}, [])
														.map((source) => (
															<div key={`messageSourceDocs-${index}`}>
																<p className="mt-2">{source}</p>
															</div>
														))}
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									</div>
								) : (
									<></>
								)}
							</>
						);
					})}
				</div>
			</div>
			<div className="relative flex w-full flex-col items-center justify-center py-8">
				<div className="relative w-full flex-1 justify-center">
					<form onSubmit={handleSubmit}>
						<textarea
							disabled={loading}
							onKeyDown={handleEnter}
							ref={textAreaRef}
							autoFocus={false}
							rows={1}
							maxLength={1024}
							id="userInput"
							name="userInput"
							placeholder={
								loading ? 'Wait a moment...' : 'What would you like to know?'
							}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="textarea-bordered textarea relative w-full resize-none rounded-3xl py-3 text-black"
						/>
						<button
							type="submit"
							disabled={loading}
							className={styles.generatebutton}
						>
							{loading ? (
								<div className={styles.loadingwheel}>
									<LoadingDots color="#000" />
								</div>
							) : (
								// Send icon SVG in input field
								<svg
									viewBox="0 0 20 20"
									className={styles.svgicon}
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
								</svg>
							)}
						</button>
					</form>
					{error && (
						<div className="rounded-md border border-red-400 p-4">
							<p className="text-red-500">{error}</p>
						</div>
					)}
				</div>
			</div>
			<button
				className="btn-error btn rounded-3xl text-white"
				onClick={resetChatHistory}
			>
				Refresh
			</button>
		</main>
	);
}
