import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase-client';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { Request } from '@/components/ui/request/types';
import { publishMessage } from '@/utils/slack-client';
import moment from 'moment';
import { updateValues } from '@/utils/google-client';

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
	const inputValues = {
		...values,
		created_at: moment().format('YYYY-MM-DD, h:mm:ss a'),
		user_id,
	};
	try {
		// insert into db
		const dbResult = await supabase
			.from('request')
			.insert({ ...values, user_id });

		// insert into google sheet
		if (!dbResult.error) {
			await updateValues(inputValues);
		}

		// send slack message
		await publishMessage(
			`[${
				dbResult.error ? 'Failed' : 'Success'
			}] Clipper App Request received by "${values.first_name} ${
				values.last_name
			}"`,
		);

		res.status(200).json({ ok: true });
	} catch (error) {
		console.log('error', error);
		res.status(200).json({ ok: false });
	}
}
