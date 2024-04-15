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
	pending?: string;
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
	content: string;
};

// TODO: markdown
export default function ChatDoc({ content }: InputProps) {
	const [query, setQuery] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [sourceDocs, setSourceDocs] = useState<Document[]>([]);
	const [messageState, setMessageState] =
		useState<MessageState>(defaultMessageState);

	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};

	// useEffect(() => {
	// 	const fetch = async () => {
	// 		const { data, error } = await supabase
	// 			.from('chat_history')
	// 			.select('user_history,bot_history')
	// 			.eq('content_id', contentId)
	// 			.eq('user_id', userId);

	// 		if (!error && data && data.length > 0) {
	// 			setMessageState(({ history, messages, ...state }) => {
	// 				const { user_history, bot_history } = data[0];
	// 				const historyOrdering = bot_history.map(
	// 					(text: string, index: number) => [user_history[index], text],
	// 				);
	// 				return {
	// 					...defaultMessageState,
	// 					history: historyOrdering,
	// 					messages: [
	// 						...defaultMessageState.messages,
	// 						...historyOrdering
	// 							.flat()
	// 							.map((message: string, index: number) => ({
	// 								type: index % 2 === 0 ? 'userMessage' : 'apiMessage',
	// 								message,
	// 							})),
	// 					],
	// 				};
	// 			});
	// 			setLoading(false);
	// 		}
	// 	};
	// 	if (userId && contentId) {
	// 		fetch();
	// 	}
	// }, [contentId, userId]);

	const { messages, pending, history, pendingSourceDocs } = messageState;

	const messageListRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		textAreaRef.current?.focus();
	}, []);

	//handle form submission
	async function handleSubmit(e: any) {
		e.preventDefault();

		// if (!query) {
		// 	alert('Please input a question');
		// 	return;
		// }

		// const question = query.trim();

		// setMessageState((state) => ({
		// 	...state,
		// 	messages: [
		// 		...state.messages,
		// 		{
		// 			type: 'userMessage',
		// 			message: question,
		// 		},
		// 	],
		// 	pending: undefined,
		// }));

		// setLoading(true);
		// setQuery('');
		// setMessageState((state) => ({ ...state, pending: '' }));

		// // const ctrl = new AbortController();

		// try {
		// 	fetch('/api/chat', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 		},
		// 		body: JSON.stringify({
		// 			question,
		// 			history,
		// 			contentId,
		// 		}),
		// 	}).then(async (response: any) => {
		// 		if (response.ok) {
		// 			const { data } = await response.json();
		// 			setMessageState((state) => {
		// 				return {
		// 					history: [...state.history, [question, data ?? '']],
		// 					messages: [
		// 						...state.messages,
		// 						{
		// 							type: 'apiMessage',
		// 							message: data ?? '',
		// 						},
		// 					],
		// 					pending: undefined,
		// 					pendingSourceDocs: undefined,
		// 				};
		// 			});
		// 			setLoading(false);
		// 		} else {
		// 			// throw new Error(response.statusText);
		// 		}
		// 	});
		// } catch (error) {
		// 	setLoading(false);
		// 	console.log('error', error);
		// }
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
						},
				  ]
				: []),
		];
	}, [messages, pending]);

	return (
		<main className="flex w-full flex-1 flex-col items-center justify-between bg-white px-20 pb-4">
			<div className="flex h-[85vh] w-full items-center justify-center rounded-lg">
				<div
					ref={messageListRef}
					className="h-full w-full overflow-y-auto rounded-lg"
				>
					<div className={styles.markdownanswer}>
						<ReactMarkdown>{content}</ReactMarkdown>
					</div>
					{/* <div className="text-sm">{content}</div> */}
					{/* {chatMessages.map((message, index) => {
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
							</>
						);
					})} */}
				</div>
			</div>
			{/* <div className="relative flex w-full flex-col items-center justify-center py-8">
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
									? 'Waiting for response...'
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
				</div>
			</div> */}
		</main>
	);
}
