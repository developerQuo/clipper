import { useRef, useState, useEffect, useMemo } from 'react';
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

type MessageState = {
	messages: Message[];
	pending?: string;
	history: [string, string][];
	pendingSourceDocs?: Document[];
};

const defaultMessageState: MessageState = {
	messages: [
		{
			message: '안녕하세요. 무엇을 도와드릴까요?',
			type: 'apiMessage',
		},
	],
	history: [],
};

type InputProps = { systemMessage?: string };

export default function ChatDoc({ systemMessage }: InputProps) {
	const [query, setQuery] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [messageState, setMessageState] =
		useState<MessageState>(defaultMessageState);

	const { messages, pending, history } = messageState;

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
			pending: undefined,
		}));

		setLoading(true);
		setQuery('');
		setMessageState((state) => ({ ...state, pending: '' }));

		try {
			fetch('/api/chatgpt-test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					question,
					history,
					systemMessage,
				}),
			})
				.then(async (res) => {
					const { answer } = await res.json();

					setMessageState((state) => ({
						...state,
						messages: [
							...state.messages,
							{
								type: 'apiMessage',
								message: answer,
							},
						],
						pending: undefined,
						history: [...state.history, [question, answer]],
					}));
					setLoading(false);
				})
				.catch((err) => {
					new Error(err);
				});
		} catch (error) {
			setLoading(false);
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
						},
				  ]
				: []),
		];
	}, [messages, pending]);

	// 채팅 기록 초기화
	const resetChatHistory = async () => {
		setMessageState(defaultMessageState);
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
								</>
							);
						})}
					</div>
				</div>
				<div className={styles.center}>
					<div className={styles.cloudform}>
						<form onSubmit={handleSubmit}>
							<textarea
								disabled={loading}
								onKeyDown={handleEnter}
								ref={textAreaRef}
								autoFocus={false}
								rows={1}
								maxLength={512}
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
				<button className="btn-error btn" onClick={resetChatHistory}>
					채팅 기록 삭제
				</button>
			</main>
		</>
	);
}
