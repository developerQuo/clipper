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

	const { title, content, published_at } = req.body as unknown as {
		title: string;
		content: string;
		published_at: string;
	};

	if (!userId || !title || !content || !published_at) {
		return res.status(400).json({ message: 'No question in the request' });
	}

	try {
		const result = await supabase.from('generated_content').insert({
			title,
			content,
			published_at,
			user_id: userId,
		});
		console.log(result);
		res.status(200).json({ ok: true });
	} catch (error) {
		console.log('error', error);
	}
}
