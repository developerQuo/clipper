import { NextApiRequest, NextApiResponse } from "next";
import { IForm } from "../../../components/ui/clip/Form";
import { supabase } from "../../../lib/supabaseClient";

// TODO: tx
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	// get form data
	const { id, subTopic, aiTopic, aiTopicKo, name } =
		req.body as unknown as Pick<
			IForm,
			"subTopic" | "aiTopic" | "name" | "id"
		> & { aiTopicKo: string[] };
	// ... check validation
	if (!id) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// ai_topic mutate
	// 판별
	if (subTopic || aiTopic) {
		// sub_topic 변경 -> ai_topic, clip_topic 삭제 후 추가
		// ai_topic 변경 -> clip_topic 삭제 후 추가
		const { data: clipTopicData, error: clipTopicError } = await supabase
			.from("clip_topic")
			.delete()
			.eq("clip_id", id)
			.select("ai_topic_id");
		if (clipTopicError) {
			res.status(500).json({ message: clipTopicError.message });
			return;
		}

		const aiTopicId = clipTopicData?.map(({ ai_topic_id }) => ai_topic_id);
		if (aiTopicId) {
			const { data: aiTopicDeleteData, error: aiTopicDeleteError } =
				await supabase
					.from("customized_ai_topic")
					.delete()
					.in("id", aiTopicId)
					.select("sub_topic_id");
			if (aiTopicDeleteError) {
				res.status(500).json({ message: aiTopicDeleteError.message });
				return;
			}

			const { data: aiTopicCreateData, error: aiTopicCreateError } =
				await supabase
					.from("customized_ai_topic")
					.insert(
						aiTopic.map((en, index) => ({
							name: en,
							korean: aiTopicKo[index],
							sub_topic_id: subTopic ?? aiTopicDeleteData[0].sub_topic_id,
						})),
					)
					.select("id");
			if (aiTopicCreateError) {
				res.status(500).json({ message: aiTopicCreateError.message });
				return;
			}

			if (aiTopicCreateData?.length) {
				const { error: clipTopicError } = await supabase
					.from("clip_topic")
					.insert(
						aiTopicCreateData.map(({ id: aiTopicId }) => ({
							clip_id: id,
							ai_topic_id: aiTopicId,
						})),
					);
				if (clipTopicError) {
					res.status(500).json({ message: clipTopicError.message });
					return;
				}
			}
		}
	}

	// clip mutate
	if (name) {
		const { error: clipError } = await supabase
			.from("clip")
			.update({ name })
			.eq("id", id);
		if (clipError) {
			res.status(500).json({ message: clipError.message });
			return;
		}
	}

	res.status(200).send({
		ok: true,
	});
}

// test - customized_ai_topic, clip, user_clip, clip_topic 테스트.
