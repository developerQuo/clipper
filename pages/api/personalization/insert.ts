import { IForm, Page1Form } from '@/components/ui/auth/personalization/type';
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

	const { industry, department, interest } = req.body as unknown as IForm;
	// ... check validation
	if (!userId || !industry || !department || !interest) {
		res.status(422).json({ message: 'Invalid input.' });
		return;
	}
	try {
		await supabase.from('personalization').insert([
			{
				industry,
				department,
				interest,
				user_id: userId,
			},
		]);

		res.status(200).send({ ok: true });
	} catch (error) {
		console.log(error);
	}
}
