import { NextApiRequest, NextApiResponse } from "next";
import generateQuestion from "../../../lib/open-ai/generate-question";
import { QuestionInput } from "../../../store/report";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const values = req.body as unknown as QuestionInput;
	// ... check validation
	if (!values.script) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// question generation from report
	const question = await generateQuestion(values);

	res.status(200).send(question);
}
