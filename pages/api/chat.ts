import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { getSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase-client';
import { ChatInput } from '@/types/chat';

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

	const index = pinecone.Index(PINECONE_INDEX_NAME);
	console.log('source', source);

	/* create vectorstore*/
	const vectorStore = await PineconeStore.fromExistingIndex(
		new OpenAIEmbeddings({}),
		{
			pineconeIndex: index,
			textKey: 'text',
			namespace: PINECONE_NAME_SPACE,
			filter: { source: { $eq: source } },
		},
	);

	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache, no-transform',
		Connection: 'keep-alive',
	});

	const sendData = (data: string) => {
		res.write(`data: ${data}\n\n`);
	};

	sendData(JSON.stringify({ data: '' }));

	//create chain
	const chain = makeChain(vectorStore, (token: string) => {
		sendData(JSON.stringify({ data: token }));
	});
	try {
		//Ask a question
		const chainCall = {
			question: sanitizedQuestion,
			chat_history:
				history.map((chat: [string, string]) => [
					`me: ${chat[0]}\n`,
					`someone: ${chat[1]}\n`,
				]) || [],
		};
		let response = await chain.call(chainCall);

		if (response.text.includes('no data')) {
			const vectorStoreAllDocs = await PineconeStore.fromExistingIndex(
				new OpenAIEmbeddings({}),
				{
					pineconeIndex: index,
					textKey: 'text',
					namespace: PINECONE_NAME_SPACE,
				},
			);
			const chainAllDocs = makeChain(vectorStoreAllDocs, (token: string) => {
				sendData(JSON.stringify({ data: token }));
			});

			sendData(JSON.stringify({ data: '\n\n' }));
			response = await chainAllDocs.call(chainCall);
		}

		sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }));

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
				bot_history: [...botHistory, response.text],
			})
			.eq('user_id', userId)
			.eq('content_id', contentId);
	} catch (error) {
		console.log('error', error);
	} finally {
		sendData('[DONE]');
		res.end();
	}
}
