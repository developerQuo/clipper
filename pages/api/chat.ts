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

	const userId = getUser(req, res);
	const chat = new Chat(req, res);

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
		.eq('id', chat.contentId)
		.single();

	const vectorStore = await createVectorStore(chat.source);

	const chain = makeChain(vectorStore, (token: string) => {
		gptResponse += token;
		sendData(JSON.stringify({ data: token }));
	});
	const chainCall = {
		question: chat.question,
		chat_history: chat.history,
		context: data?.content,
	};
	try {
		let response = await chain.call(chainCall);

		const botResponse = gptResponse || response.text;

		await supabase
			.from('chat_history')
			.upsert({
				user_id: userId,
				content_id: chat.contentId,
				user_history: [...chat.userHistory, chat.question],
				bot_history: [...chat.botHistory, botResponse],
			})
			.eq('user_id', userId)
			.eq('content_id', chat.contentId);

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

async function getUser(req: NextApiRequest, res: NextApiResponse) {
	const session = await getServerSession(req, res, authOptions);
	const userId = session?.user?.id;

	if (!userId) {
		res.status(400).json({ message: 'No user id' });
	}

	return userId;
}

class Chat {
	private _question: string;
	private _history: [string, string][];
	private _contentId: string;
	private _source: string;

	constructor(req: NextApiRequest, res: NextApiResponse) {
		const { question, history, contentId, source } =
			req.body as unknown as ChatInput & {
				contentId: string;
				source: string;
			};

		if (!question || !contentId || !source) {
			res.status(400).json({ message: 'No parameters in the request' });
		}

		this._question = question;
		this._history = history || [];
		this._contentId = contentId;
		this._source = source;
	}

	get question() {
		return this._question.trim().replaceAll('\n', ' ');
	}

	get history() {
		return this._history;
	}

	get userHistory() {
		return this._history.map((chat) => chat[0]);
	}

	get botHistory() {
		return this._history.map((chat) => chat[1]);
	}

	get contentId() {
		return this._contentId;
	}

	get source() {
		return this._source;
	}
}

async function createVectorStore(source: string) {
	return await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
		pineconeIndex: pinecone.Index(PINECONE_INDEX_NAME),
		textKey: 'text',
		namespace: PINECONE_NAME_SPACE,
		filter: { source: { $eq: source } },
	});
}
