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

	const { contentId } = req.body as unknown as { contentId: string };
	// ... check validation
	if (!userId || !contentId) {
		res.status(422).json({ message: 'Invalid input.' });
		return;
	}

	const bookmark = await supabase
		.from('bookmark')
		.select('*', { count: 'exact' })
		.eq('user_id', userId)
		.eq('content_id', contentId);

	console.log(bookmark);
	if (bookmark.count) {
		const result = await supabase
			.from('bookmark')
			.delete()
			.eq('user_id', userId)
			.eq('content_id', contentId);

		res.status(200).send({ ok: true });
	} else {
		console.log(userId, contentId);
		const result = await supabase
			.from('bookmark')
			.insert({ user_id: userId, content_id: contentId });

		res.status(200).send({ ok: true });
	}
}
