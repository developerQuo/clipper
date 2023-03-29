import { ChatInput } from '@/types/chat';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import {
	Configuration,
	OpenAIApi,
	ChatCompletionRequestMessageRoleEnum,
} from 'openai';
import { Readable } from 'stream';

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

	const { question, history, systemMessage } =
		req.body as unknown as ChatInput & {
			systemMessage?: string;
		};

	if (!userId || !question) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
	const sanitizedSystemMessage = systemMessage?.trim().replaceAll('\n', ' ');

	console.log('sanitizedQuestion', sanitizedQuestion);
	console.log('sanitizedSystemMessage', sanitizedSystemMessage);
	try {
		//Ask a question
		const completion = await openai.createChatCompletion({
			model: 'gpt-4',
			temperature: 0,
			messages: [
				...(sanitizedSystemMessage
					? [
							{
								role: ChatCompletionRequestMessageRoleEnum.System,
								content: sanitizedSystemMessage,
							},
					  ]
					: []),
				...history.flat().map((text, index) => ({
					role:
						index % 2 === 0
							? ChatCompletionRequestMessageRoleEnum.User
							: ChatCompletionRequestMessageRoleEnum.Assistant,
					content: text,
				})),
				{
					role: ChatCompletionRequestMessageRoleEnum.User,
					content: sanitizedQuestion,
				},
			],
		});

		if (completion.data.choices && completion.data.choices.length > 0) {
			console.log('completion', completion);
			const answer = completion.data.choices[0].message?.content!;
			console.log('answer', answer);
			res.status(200).json({ answer });
		} else {
			res.status(500).json({ error: 'No response from API' });
		}
	} catch (error) {
		console.log('error', error);
	}
}
