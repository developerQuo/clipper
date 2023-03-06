import { NextApiRequest, NextApiResponse } from "next";
import generateSubKeyword from "../../../lib/open-ai/generate-subkeyword";
import { SubKeywordInput } from "../../../store/clip";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const { mainTopicKo, subTopicKo } = req.body as unknown as SubKeywordInput;
	// ... check validation
	if (!mainTopicKo || !subTopicKo) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// sub keyword generation
	const keywords = await generateSubKeyword({ mainTopicKo, subTopicKo });

	console.log(keywords);
	res.status(200).send(keywords);
}
