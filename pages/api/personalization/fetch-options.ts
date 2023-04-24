import { Page1Form } from '@/components/ui/auth/personalization/type';
import { openai } from '@/utils/openai-client';
import { supabase } from '@/utils/supabase-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

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

	const { industry, department } = req.body as unknown as Page1Form;
	// ... check validation
	if (!userId || !industry || !department) {
		res.status(422).json({ message: 'Invalid input.' });
		return;
	}
	try {
		const result = await openai.createChatCompletion({
			messages: [
				{
					role: 'assistant',
					content: `
					Provide a list of keywords that people in the ${department} role working in the ${industry} industry might be interested in. 
					Please reply only keywords in English.
					Do not use any special characters or symbols.
					Example: keyword1,keyword2,keyword3
					`,
				},
			],
			max_tokens: 512,
			temperature: 0.5,
			model: 'gpt-3.5-turbo',
		});
		let content = result.data.choices[0].message?.content;
		content =
			content && content[content?.length - 1] === '.'
				? content.slice(0, -1)
				: content;
		const interest = content?.split(',').map((t) => t.trim());

		res.status(200).send({ interest });
	} catch (error) {
		console.log(error);
	}
}
