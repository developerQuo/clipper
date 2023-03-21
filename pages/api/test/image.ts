import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "../../../lib/open-ai/openai";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const { prompt } = req.body as unknown as { prompt: string };
	// ... check validation
	if (!prompt) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	const response = await openai.createImage({
		prompt,
		n: 4,
		size: "256x256",
	});
	const image_url = response.data.data.map((item) => item.url);

	res.status(200).send(JSON.stringify({ image_url }));
}
