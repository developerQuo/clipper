import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase-client';
import { openai } from '@/utils/openai-client';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { IForm } from '../../generate';

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

	const { prompt } = req.body as unknown as IForm;

	if (!userId || !prompt) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	// esg or senior report
	const refs = prompt.startsWith('우리 ')
		? [183, 184, 185, 186]
		: [179, 180, 181, 182];
	const { data } = await supabase
		.from('content')
		.select('title,content')
		.in('id', refs)
		.is('file_type', 'null')
		.not('content', 'is', 'null');
	try {
		// console.log(data);
		if (data) {
			const chat = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: ChatCompletionRequestMessageRoleEnum.System,
						content: `I give you documents.
					I want to create a 1700 characters new content that refer below documents.
					Choose 5 key topics and create 5 new contents that details.
					Please reply in Korean.

					Documents:
					${data[0].title} - ${data[0].content}
					${data[1].title} - ${data[1].content}
					${data[2].title} - ${data[2].content}
					${data[3].title} - ${data[3].content}

					Prompt:
					${prompt}

					Answer in Markdown:`,
					},
				],
			});
			const response = chat.data.choices[0].message?.content;

			res.status(200).json({ data: response });
		}
	} catch (error) {
		console.log('error', error);
	}
}
