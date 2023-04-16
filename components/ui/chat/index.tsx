import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
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

type MessageState = {
	messages: Message[];
	history: [string, string][];
	pendingSourceDocs?: Document[];
};

const defaultMessageState: MessageState = {
	messages: [
		{
			message: '다른 궁금한 점이 있으신가요?',
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

	const { messages, history } = messageState;

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
		}));

		setLoading(true);
		setQuery('');

		try {
			const response = await fetch('/api/chat', {
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
			});

			const { data, error } = await response.json();

			console.log(data);
			if (error) {
				setError(error);
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

	useEffect(() => {
		if (messageListRef.current) {
			//scroll to bottom
			const scrollHeight = messageListRef.current?.scrollHeight ?? 0;
			const height = messageListRef.current?.clientHeight ?? 0;
			const maxScrollTop = scrollHeight - height;
			messageListRef.current!.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
		}
	}, [messages]);
	console.log('render', messages);
	return (
		<main className="flex w-full flex-1 flex-col items-center justify-between bg-white px-20 pb-4">
			<div className="flex h-[75vh] w-full items-center justify-center rounded-lg">
				<div
					ref={messageListRef}
					className="h-full w-full overflow-y-auto rounded-lg"
				>
					<div className="text-sm leading-6">{summary}</div>
					<div className="mb-8 mt-6 flex flex-col space-y-2 text-sm">
						<span>이런 내용이 담겨져 있어요. 클릭해서 확인하세요.</span>
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
					{messages.map((message, index) => {
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
									<div className="chat-bubble">
										<div className={styles.markdownanswer}>
											<ReactMarkdown linkTarget="_blank">
												{message.message}
											</ReactMarkdown>
										</div>
									</div>
								</div>
								{message.sourceDocs && (
									<div className="p-5">
										<Accordion type="single" collapsible className="flex-col">
											{message.sourceDocs.map((doc, index) => (
												<div key={`messageSourceDocs-${index}`}>
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
					{/* {sourceDocs.length > 0 && (
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
						)} */}
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
								loading
									? '잠시만 기다려주세요...'
									: '더 궁금한 것을 Clipper에게 물어보세요.'
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
				채팅 기록 삭제
			</button>
		</main>
	);
}
