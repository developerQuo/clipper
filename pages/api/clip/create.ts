import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { IForm } from "../../../components/ui/clip/Form";
import { supabase } from '@/utils/supabase-client';

// TODO: tx
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	// get user id
	const { user } = (await getSession({ req: req })) as any;
	if (!user) {
		res.status(401).json({ message: "Unauthorized" });
		return;
	}
	const { data: userData, error: userError } = await supabase
		.from("users")
		.select("id")
		.eq("email", user.email);
	if (userError) {
		res.status(500).json({ message: userError.message });
		return;
	}
	const userId = userData?.[0].id;

	// get form data
	const { subTopic, aiTopic, aiTopicKo, name } = req.body as unknown as Pick<
		IForm,
		"subTopic" | "aiTopic" | "name"
	> & { aiTopicKo: string[] };
	// ... check validation
	if (!subTopic || !aiTopic) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// upsert 고려해보기
	// ai topic generation
	const { data: aiTopicData, error: aiTopicError } = await supabase
		.from("customized_ai_topic")
		.insert(
			aiTopic.map((en, index) => ({
				name: en,
				korean: aiTopicKo[index],
				sub_topic_id: subTopic,
			})),
		)
		.select("id");
	if (aiTopicError) {
		res.status(500).json({ message: aiTopicError.message });
		return;
	}

	// clip, user_clip, clip_topic mutate
	const { data: clipData, error: clipError } = await supabase
		.from("clip")
		.insert({ name })
		.select("id");
	if (clipError) {
		res.status(500).json({ message: clipError.message });
		return;
	}

	if (aiTopicData?.length && clipData) {
		const { error: clipTopicError } = await supabase.from("clip_topic").insert(
			aiTopicData.map(({ id }) => ({
				clip_id: clipData[0].id,
				ai_topic_id: id,
			})),
		);
		if (clipTopicError) {
			res.status(500).json({ message: clipTopicError.message });
			return;
		}

		const { error: userClipError } = await supabase.from("user_clip").insert({
			user_id: userId,
			clip_id: clipData[0].id,
		});
		if (userClipError) {
			res.status(500).json({ message: userClipError.message });
			return;
		}
	}

	res.status(200).send({
		ok: true,
	});
}

// test - customized_ai_topic, clip, user_clip, clip_topic 테스트.
