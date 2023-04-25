import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase-client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { Request } from '@/components/ui/request/types';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return;
	}

	// get user id
	const session = await getServerSession(req, res, authOptions);
	const user_id = session?.user?.id;

	const values = req.body as unknown as Request;

	if (!user_id || !values) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	try {
		const result = await supabase
			.from('request')
			.insert({ ...values, user_id });

		res.status(200).json({ ok: true });
	} catch (error) {
		console.log('error', error);
		res.status(200).json({ ok: false });
	}
}
