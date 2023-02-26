import { NextApiRequest, NextApiResponse } from "next";
import generateSubKeyword from "../../../lib/open-ai/generate-subkeyword";
import { SubKeywrodInput } from "../../../store/report";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const { mainCategory, middleCategory } =
		req.body as unknown as SubKeywrodInput;
	// ... check validation
	if (!mainCategory || !middleCategory) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// sub keyword generation
	const keywords = await generateSubKeyword({ mainCategory, middleCategory });

	res.status(200).send(keywords);
}
