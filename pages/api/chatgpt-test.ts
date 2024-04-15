import { ChatInput } from '@/types/chat';
import { openai } from '@/utils/openai-client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import OpenAI from 'openai';

type Message = OpenAI.ChatCompletionUserMessageParam | OpenAI.ChatCompletionSystemMessageParam | OpenAI.ChatCompletionAssistantMessageParam

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
		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			temperature: 0,
			messages: [
				
				...(sanitizedSystemMessage
					? [
							{
								"role":'system',
								"content": sanitizedSystemMessage,
							},
					  ] 
					: []),
				...history.flat().map((text, index) => ({
					"role":
						index % 2 === 0
							? 'user'
							: 'assistant',
					"content": text,
				})),
				{
					"role": 'user',
					"content": sanitizedQuestion,
				},
			] as unknown as Message[],
		});

		if (completion.choices && completion.choices.length > 0) {
			console.log('completion', completion);
			const answer = completion.choices[0].message?.content!;
			console.log('answer', answer);
			res.status(200).json({ answer });
		} else {
			res.status(500).json({ error: 'No response from API' });
		}
	} catch (error) {
		console.log('error', error);
	}
}
