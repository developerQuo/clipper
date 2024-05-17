import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { supabase } from '@/utils/supabase-client';
import { ChatInput } from '@/types/chat';
import { DocumentType } from '@/types/vector-store';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return;
	}

	const { userId, question, history, contentId, source } = await getReqParams(
		req,
		res,
	);

	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	// TODO: 0.83 이하는 전체 검색.
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache, no-transform',
		Connection: 'keep-alive',
	});

	const sendData = (data: string) => {
		res.write(`data: ${data}\n\n`);
	};

	sendData(JSON.stringify({ data: '' }));

	let gptResponse = '';

	const { data } = await supabase
		.from('content')
		.select('content')
		.eq('id', contentId)
		.single();

	const vectorStore = await createVectorStore(source);

	const chain = makeChain(vectorStore, (token: string) => {
		gptResponse += token;
		sendData(JSON.stringify({ data: token }));
	});
	const chainCall = {
		question: sanitizedQuestion,
		chat_history: history || [],
		context: data?.content,
	};
	try {
		let response = await chain.call(chainCall);

		const botResponse = gptResponse || response.text;

		await supabase
			.from('chat_history')
			.upsert({
				user_id: userId,
				content_id: contentId,
				user_history: [...history.map((chat) => chat[0]), sanitizedQuestion],
				bot_history: [...history.map((chat) => chat[1]), botResponse],
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

async function getReqParams(req: NextApiRequest, res: NextApiResponse) {
	const session = await getServerSession(req, res, authOptions);
	const userId = session?.user?.id;

	const { question, history, contentId, source } =
		req.body as unknown as ChatInput & {
			contentId: string;
			source: string;
		};

	if (!userId || !question || !contentId || !source) {
		res.status(400).json({ message: 'No question in the request' });
	}

	return { userId, question, history, contentId, source };
}

async function createVectorStore(source: string) {
	return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
		pineconeIndex: pinecone.Index(PINECONE_INDEX_NAME),
		textKey: 'text',
		namespace: PINECONE_NAME_SPACE,
		filter: { source: { $eq: source } },
	});
}
