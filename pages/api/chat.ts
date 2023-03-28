import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { getSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase-client';

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

	const { question, history, contentId } = req.body;

	if (!userId || !question) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	const index = pinecone.Index(PINECONE_INDEX_NAME);

	/* create vectorstore*/
	const vectorStore = await PineconeStore.fromExistingIndex(
		new OpenAIEmbeddings({}),
		{ pineconeIndex: index, textKey: 'text', namespace: `${contentId}` },
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
		const response = await chain.call({
			question: sanitizedQuestion,
			chat_history: history || [],
		});

		// console.log('response', response);
		sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }));
		await supabase
			.from('chat_history')
			.upsert({
				user_id: userId,
				content_id: contentId,
				user_history: [
					...history.map((chat: [string, string]) => chat[0]),
					sanitizedQuestion,
				],
				bot_history: [
					...history.map((chat: [string, string]) => chat[1]),
					response.text,
				],
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
