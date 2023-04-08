import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { getSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase-client';
import { ChatInput } from '@/types/chat';
import { LLMChain, PromptTemplate } from 'langchain';
import { OpenAIChat } from 'langchain/llms';
import { CONDENSE_PROMPT as DEFAULT_CONDENSE_PROMPT } from '@/config/prompt';
import { openai } from '@/utils/openai-client';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(DEFAULT_CONDENSE_PROMPT);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return;
	}

	// get user id
	const session = await getSession({ req });
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

	// const questionGenerator = new LLMChain({
	// 	llm: new OpenAIChat({
	// 		temperature: 0,
	// 		modelName: 'gpt-4',
	// 	}),
	// 	prompt: CONDENSE_PROMPT,
	// });
	// const standaloneQuestion = await questionGenerator.call({
	// 	question: sanitizedQuestion,
	// 	chat_history:
	// 		history.map((chat: [string, string]) => [
	// 			`me: ${chat[0]}\n`,
	// 			`someone: ${chat[1]}\n`,
	// 		]) || [],
	// });
	// const index = pinecone.Index(PINECONE_INDEX_NAME);
	// console.log('source', source);

	// /* create vectorstore*/
	// const vectorStore = await PineconeStore.fromExistingIndex(
	// 	new OpenAIEmbeddings({}),
	// 	{
	// 		pineconeIndex: index,
	// 		textKey: 'text',
	// 		namespace: PINECONE_NAME_SPACE,
	// 		filter: { source: { $eq: source } },
	// 	},
	// );

	// res.writeHead(200, {
	// 	'Content-Type': 'text/event-stream',
	// 	'Cache-Control': 'no-cache, no-transform',
	// 	Connection: 'keep-alive',
	// });

	const sendData = (data: string) => {
		res.write(`data: ${data}\n\n`);
	};

	// sendData(JSON.stringify({ data: '' }));

	//create chain
	// const chain = makeChain((token: string) => {
	// 	sendData(JSON.stringify({ data: token }));
	// });
	const { data } = await supabase
		.from('content')
		.select('content')
		.eq('id', contentId)
		.single();
	try {
		//Ask a question
		// const chainCall = {
		// 	question: standaloneQuestion,
		// 	context: data?.content,
		// };
		// let response = await chain.call(chainCall);

		const chat = await openai.createChatCompletion({
			temperature: 0.3,
			model: 'gpt-4',
			messages: [
				{
					role: ChatCompletionRequestMessageRoleEnum.System,
					content: `
			I give you my question and the document.
			Don't make up hyperlinks.
			Please reply in language used in the question.
			
			Question: ${sanitizedQuestion}
			Document: ${data?.content}
			`,
				},
				...(history.flat().map((chat: string, index) => ({
					role:
						index % 2 == 0
							? ChatCompletionRequestMessageRoleEnum.User
							: ChatCompletionRequestMessageRoleEnum.Assistant,
					content: chat,
				})) || []),
				{
					role: ChatCompletionRequestMessageRoleEnum.User,
					content: sanitizedQuestion,
				},
			],
		});
		const response = chat.data.choices[0].message?.content;
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

		const [userHistory, botHistory] = history.reduce(
			(acc: [string[], string[]], [userMessage, botMessage]) => {
				acc[0].push(userMessage);
				acc[1].push(botMessage);
				return acc;
			},
			[[], []],
		);

		await supabase
			.from('chat_history')
			.upsert({
				user_id: userId,
				content_id: contentId,
				user_history: [...userHistory, sanitizedQuestion],
				bot_history: [...botHistory, response],
			})
			.eq('user_id', userId)
			.eq('content_id', contentId);

		res.status(200).json({ data: response });
	} catch (error) {
		console.log('error', error);
	} finally {
		// sendData('[DONE]');
		// res.end();
	}
}
