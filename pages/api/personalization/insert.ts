import { IForm } from '@/components/ui/auth/personalization/type';
import { supabase } from '@/utils/supabase-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

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
