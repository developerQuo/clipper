import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { supabase } from '@/utils/supabase-client';
import { ChatInput } from '@/types/chat';
import { LLMChain, PromptTemplate } from 'langchain';
import { OpenAIChat } from 'langchain/llms';
import { CONDENSE_PROMPT as DEFAULT_CONDENSE_PROMPT } from '@/config/prompt';
import { openai } from '@/utils/openai-client';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { DocumentType, MetaData } from '@/types/vector-store';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(DEFAULT_CONDENSE_PROMPT);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
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
	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	const questionGenerator = new LLMChain({
		llm: new OpenAIChat({
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
	const index = pinecone.Index(PINECONE_INDEX_NAME);
	// console.log('source', source);

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

	console.log('sanitizedQuestion: ', sanitizedQuestion);
	const search = await vectorStore.similaritySearchWithScore(
		sanitizedQuestion,
		1,
	);
	console.log('search', search);
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
		let response = await chain.call(chainCall);

		const [userHistory, botHistory] = history.reduce(
			(acc: [string[], string[]], [userMessage, botMessage]) => {
				acc[0].push(userMessage);
				acc[1].push(botMessage);
				return acc;
			},
			[[], []],
		);

		// const chat = await openai.createChatCompletion({
		// 	model: 'gpt-3.5-turbo',
		// 	messages: [
		// 		{
		// 			role: ChatCompletionRequestMessageRoleEnum.System,
		// 			content: `
		// 	I give you my question and the document.
		// 	Don't make up hyperlinks.
		// 	Please reply in language used in the question.

		// 	Question: ${sanitizedQuestion}
		// 	Document: ${data?.content}
		// 	`,
		// 		},
		// 		...(history.flat().map((chat: string, index) => ({
		// 			role:
		// 				index % 2 == 0
		// 					? ChatCompletionRequestMessageRoleEnum.User
		// 					: ChatCompletionRequestMessageRoleEnum.Assistant,
		// 			content: chat,
		// 		})) || []),
		// 		{
		// 			role: ChatCompletionRequestMessageRoleEnum.User,
		// 			content: sanitizedQuestion,
		// 		},
		// 	],
		// });
		// const response = chat.data.choices[0].message?.content;
		// console.log((response as any)?.data?.error);
		// if (response.text.includes('no data')) {
		// 	const vectorStoreAllDocs = await PineconeStore.fromExistingIndex(
		// 		new OpenAIEmbeddings({}),
		// 		{
		// 			pineconeIndex: index,
		// 			textKey: 'text',
		// 			namespace: PINECONE_NAME_SPACE,
		// 		},
		// 	);
		// 	const chainAllDocs = makeChain(vectorStoreAllDocs, (token: string) => {
		// 		sendData(JSON.stringify({ data: token }));
		// 	});
		// 	sendData(JSON.stringify({ data: '\n\n' }));
		// 	response = await chainAllDocs.call(chainCall);
		// }

		// sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }));

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
		sendData('[DONE]');
		res.end();
	}
}
