import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { makeChain } from '@/utils/makechain-test';
import { pinecone } from '@/utils/pinecone-client';
import {
	PINECONE_INDEX_NAME,
	TEST_PINECONE_NAME_SPACE,
} from '@/config/pinecone';
import { getSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase-client';
import { ChatInput, ChatOptionInput } from '@/types/chat';

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

	const {
		question,
		history,
		contentId,
		condensePrompt,
		qaPrompt,
		source,
		chatOptions,
	} = req.body as unknown as ChatInput & {
		contentId: string;
		condensePrompt: string;
		qaPrompt: string;
		source: string;
		chatOptions: ChatOptionInput;
	};

	if (!userId || !question) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	const index = pinecone.Index(PINECONE_INDEX_NAME);

	/* create vectorstore*/
	const vectorStore = await PineconeStore.fromExistingIndex(
		new OpenAIEmbeddings({}),
		{
			pineconeIndex: index,
			textKey: 'text',
			namespace: TEST_PINECONE_NAME_SPACE,
			filter: { source: { $eq: source } },
		},
	);

	//create chain
	const chain = makeChain(vectorStore, condensePrompt, qaPrompt, chatOptions);

	try {
		//Ask a question
		const response = await chain.call({
			question: sanitizedQuestion,
			chat_history:
				history.map((chat: [string, string]) => [
					`me: ${chat[0]}\n`,
					`someone: ${chat[1]}\n`,
				]) || [],
		});

		console.log('response', response);

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

		res.status(200).json(response);
	} catch (error: any) {
		console.log('error', error);
		res.status(500).json({ error: error.message || 'Something went wrong' });
	}
}
