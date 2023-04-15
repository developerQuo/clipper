import { useRef, useState, useEffect, useMemo } from 'react';
import styles from '@/styles/Home.module.css';
import { ChatOptionInput, Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { useRecoilValue } from 'recoil';
import { SelectedKeyState, SelectedKeyType } from '@/store/table';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import { SelectedContent, SelectedContentState } from '@/store/content';
import { Textarea } from '../TextArea';

type MessageState = {
	messages: Message[];
	pending?: string;
	history: [string, string][];
	pendingSourceDocs?: Document[];
};

const defaultMessageState: MessageState = {
	messages: [
		{
			message: 'Hi, what would you like to learn about this document?',
			type: 'apiMessage',
		},
	],
	history: [],
	pendingSourceDocs: [],
};

type InputProps = {
	condensePrompt: string;
	qaPrompt: string;
} & ChatOptionInput;

export default function ChatDoc({
	condensePrompt,
	qaPrompt,
	...chatOptions
}: InputProps) {
	const selectedKey = useRecoilValue<SelectedKeyType>(SelectedKeyState);
	const selectedContent = useRecoilValue<SelectedContent>(SelectedContentState);
	const [query, setQuery] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [sourceDocs, setSourceDocs] = useState<Document[]>([]);
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
				.eq('content_id', selectedKey)
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

		if (userId && selectedKey) {
			fetch();
		}
	}, [selectedKey, userId]);

	const { messages, pending, history, pendingSourceDocs } = messageState;

	const messageListRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		textAreaRef.current?.focus();
	}, []);

	//handle form submission
	async function handleSubmit(e: any) {
		e.preventDefault();

		if (!query) {
			alert('Please input a question');
			return;
		}

		const question = query.trim();

		setMessageState((state) => ({
			...state,
			messages: [
				...state.messages,
				{
					type: 'userMessage',
					message: question,
				},
			],
		}));

		setLoading(true);
		setQuery('');

		try {
			const response = await fetch('/api/chat-test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					question,
					history,
					contentId: selectedKey,
					condensePrompt,
					qaPrompt,
					source: `${selectedContent?.title}`,
					chatOptions,
				}),
				// onmessage: (event) => {
				// 	if (event.data === '[DONE]') {
				// 		setMessageState((state) => {
				// 			console.log('state', state);
				// 			return {
				// 				history: [...state.history, [question, state.pending ?? '']],
				// 				messages: [
				// 					...state.messages,
				// 					{
				// 						type: 'apiMessage',
				// 						message: state.pending ?? '',
				// 						sourceDocs: state.pendingSourceDocs,
				// 					},
				// 				],
				// 				pending: undefined,
				// 				pendingSourceDocs: undefined,
				// 			};
				// 		});
				// 		setLoading(false);
				// 		ctrl.abort();
				// 	} else {
				// 		const data = JSON.parse(event.data);
				// 		if (data.sourceDocs) {
				// 			setMessageState((state) => ({
				// 				...state,
				// 				pendingSourceDocs: data.sourceDocs,
				// 			}));
				// 		} else {
				// 			setMessageState((state) => ({
				// 				...state,
				// 				pending: (state.pending ?? '') + data.data,
				// 			}));
				// 		}
				// 	}
				// },
			});

			const data = await response.json();

			if (data.error) {
				setError(data.error);
			} else {
				setMessageState((state) => ({
					...state,
					messages: [
						...state.messages,
						{
							type: 'apiMessage',
							message: data.text,
							sourceDocs: data.sourceDocuments,
						},
					],
					history: [...state.history, [question, data.text]],
				}));
			}
			console.log('messageState', messageState);

			setLoading(false);

			//scroll to bottom
			messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
			console.log('data', data);
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

	// 채팅 기록 초기화
	const resetChatHistory = async () => {
		const { error } = await supabase
			.from('chat_history')
			.update({ user_history: [], bot_history: [] })
			.eq('content_id', selectedKey)
			.eq('user_id', userId);

		if (!error) {
			setMessageState(defaultMessageState);
		}
	};

	return (
		<>
			<main className={styles.main}>
				<div className={styles.cloud}>
					<div ref={messageListRef} className={styles.messagelist}>
						{chatMessages.map((message, index) => {
							let icon;
							let className;
							if (message.type === 'apiMessage') {
								icon = (
									<Image
										src="/bot-image.png"
										alt="AI"
										width="40"
										height="40"
										className={styles.boticon}
										priority
									/>
								);
								className = styles.apimessage;
							} else {
								icon = (
									<Image
										src="/usericon.png"
										alt="Me"
										width="30"
										height="30"
										className={styles.usericon}
										priority
									/>
								);
								// The latest message sent by the user will be animated while waiting for a response
								className =
									loading && index === chatMessages.length - 1
										? styles.usermessagewaiting
										: styles.usermessage;
							}
							return (
								<>
									<div key={index} className={className}>
										{icon}
										<div className={styles.markdownanswer}>
											<ReactMarkdown linkTarget="_blank">
												{message.message}
											</ReactMarkdown>
										</div>
									</div>
									{message.sourceDocs && (
										<div className="p-5">
											<Accordion type="single" collapsible className="flex-col">
												{message.sourceDocs.map((doc, index) => (
													<div key={index}>
														<AccordionItem value={`item-${index}`}>
															<AccordionTrigger>
																<h3>Source {index + 1}</h3>
															</AccordionTrigger>
															<AccordionContent>
																<ReactMarkdown linkTarget="_blank">
																	{doc.pageContent}
																</ReactMarkdown>
																<p className="mt-2">
																	<b>Source:</b> {doc.metadata.source}
																</p>
															</AccordionContent>
														</AccordionItem>
													</div>
												))}
											</Accordion>
										</div>
									)}
								</>
							);
						})}
						{sourceDocs.length > 0 && (
							<div className="p-5">
								<Accordion type="single" collapsible className="flex-col">
									{sourceDocs.map((doc, index) => (
										<div key={index}>
											<AccordionItem value={`item-${index}`}>
												<AccordionTrigger>
													<h3>Source {index + 1}</h3>
												</AccordionTrigger>
												<AccordionContent>
													<ReactMarkdown linkTarget="_blank">
														{doc.pageContent}
													</ReactMarkdown>
												</AccordionContent>
											</AccordionItem>
										</div>
									))}
								</Accordion>
							</div>
						)}
					</div>
				</div>
				<div className={styles.center}>
					<div className={styles.cloudform}>
						<form onSubmit={handleSubmit}>
							<Textarea
								disabled={loading}
								onKeyDown={handleEnter}
								ref={textAreaRef}
								autoFocus={false}
								rows={1}
								id="userInput"
								name="userInput"
								placeholder={
									loading
										? 'Waiting for response...'
										: 'What is this legal case about?'
								}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className={styles.textarea}
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
					</div>
				</div>
				{error && (
					<div className="rounded-md border border-red-400 p-4">
						<p className="text-red-500">{error}</p>
					</div>
				)}
				<button className="btn-error btn" onClick={resetChatHistory}>
					채팅 기록 삭제
				</button>
			</main>
		</>
	);
}
