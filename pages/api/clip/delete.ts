import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabase-client';

// TODO: tx
// NOTE: cascade 적용 안되있음
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return;
	}

	// get form data
	const { clipId } = req.body as unknown as { clipId: string };
	// ... check validation
	if (!clipId) {
		res.status(422).json({ message: 'Invalid input.' });
		return;
	}

	const { data: clipTopicData, error: clipTopicError } = await supabase
		.from('clip_topic')
		.delete()
		.eq('clip_id', clipId)
		.select('ai_topic_id');
	if (clipTopicError) {
		res.status(500).json({ message: clipTopicError.message });
		return;
	}

	const { error: userClipError } = await supabase
		.from('user_clip')
		.delete()
		.eq('clip_id', clipId);
	if (userClipError) {
		res.status(500).json({ message: userClipError.message });
		return;
	}

	const { error: clipError } = await supabase
		.from('clip')
		.delete()
		.eq('id', clipId);
	if (clipError) {
		res.status(500).json({ message: clipError.message });
		return;
	}

	const { error: aiTopicError } = await supabase
		.from('customized_ai_topic')
		.delete()
		.in(
			'id',
			clipTopicData.map(({ ai_topic_id }) => ai_topic_id),
		);
	if (aiTopicError) {
		res.status(500).json({ message: aiTopicError.message });
		return;
	}

	res.status(200).send({
		ok: true,
	});
}
