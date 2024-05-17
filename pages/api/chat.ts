import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { supabase } from '@/utils/supabase-client';
import { ChatInput } from '@/types/chat';
import { LLMChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { CONDENSE_PROMPT as DEFAULT_CONDENSE_PROMPT } from '@/config/prompt';
import { DocumentType } from '@/types/vector-store';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(DEFAULT_CONDENSE_PROMPT);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// 인자 체크 ------------------------------------------------
	// TODO: 테스트 코드 - 인자 체크
	if (req.method !== 'POST') {
		return;
	}

	// get user id
	const session = await getServerSession(req, res, authOptions);
	const userId = session?.user?.id;

	const { question, history, contentId, source } =
		req.body as unknown as ChatInput & {
			contentId: string;
			source: string;
		};

	if (!userId || !question || !contentId || !source) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	// ------------------------------------------------

	// 질문 생성 ------------------------------------------------
	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	const questionGenerator = new LLMChain({
		llm: new ChatOpenAI({
			temperature: 0,
			modelName: 'gpt-3.5-turbo',
		}),
		prompt: CONDENSE_PROMPT,
	});
	const standaloneQuestion = await questionGenerator.call({
		question: sanitizedQuestion,
		chat_history:
			history.map((chat: [string, string]) => [
				`me: ${chat[0]}\n`,
				`someone: ${chat[1]}\n`,
			]) || [],
	});
	console.log('standaloneQuestion', standaloneQuestion);
	// ------------------------------------------------

	// 벡터스토어 초기화 ------------------------------------------------
	const index = pinecone.Index(PINECONE_INDEX_NAME);

	// /* create vectorstore*/
	const vectorStore = await PineconeStore.fromExistingIndex(
		new OpenAIEmbeddings(),
		{
			pineconeIndex: index,
			textKey: 'text',
			namespace: PINECONE_NAME_SPACE,
			filter: { source: { $eq: source } },
		},
	);
	// ------------------------------------------------

	// sse 세팅 ------------------------------------------------
	// TODO: 테스트 코드 - 스트리밍 답변 가는지
	// TODO: 0.83 이하는 전체 검색.
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache, no-transform',
		Connection: 'keep-alive',
	});

	let gptResponse = '';
	const sendData = (data: string) => {
		res.write(`data: ${data}\n\n`);
	};

	sendData(JSON.stringify({ data: '' }));
	// ------------------------------------------------

	// 벡터스토어에서 질문 내용 검색 ------------------------------------------------
	console.log('sanitizedQuestion: ', sanitizedQuestion);
	const search = await vectorStore.similaritySearchWithScore(
		sanitizedQuestion, // TODO: sanitizedQuestion => standaloneQuestion
		1,
	);
	console.log('search', search);
	// ------------------------------------------------

	// 체인 생성 ------------------------------------------------
	//create chain
	const chain = makeChain(vectorStore, (token: string) => {
		gptResponse += token;
		sendData(JSON.stringify({ data: token }));
	});
	const { data } = await supabase
		.from('content')
		.select('content')
		.eq('id', contentId)
		.single();
	try {
		//Ask a question
		const chainCall = {
			question: sanitizedQuestion,
			chat_history: history || [],
			context: data?.content,
		};
		// ------------------------------------------------

		// 답변 받고 마무리하기 ------------------------------------------------
		let response = await chain.call(chainCall);

		const [userHistory, botHistory] = history.reduce(
			(acc: [string[], string[]], [userMessage, botMessage]) => {
				acc[0].push(userMessage);
				acc[1].push(botMessage);
				return acc;
			},
			[[], []],
		);

		const botResponse = gptResponse || response.text;
		await supabase
			.from('chat_history')
			.upsert({
				user_id: userId,
				content_id: contentId,
				user_history: [...userHistory, sanitizedQuestion],
				bot_history: [...botHistory, botResponse],
			})
			.eq('user_id', userId)
			.eq('content_id', contentId);

		sendData(
			JSON.stringify({
				data: {
					text: botResponse,
					metadata: response.sourceDocuments.map(
						({ metadata }: DocumentType) => ({
							source: metadata.source,
							page: metadata.page,
						}),
					),
				},
			}),
		);
	} catch (error) {
		console.log('error', error);
	} finally {
		// TODO: 테스트 코드 - 스트리밍 마무리 잘 되는지
		sendData('[DONE]');
		res.end();
	}
	// ------------------------------------------------
}
