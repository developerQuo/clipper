import { NextApiRequest, NextApiResponse } from "next";
import generateReport from "../../../lib/open-ai/generate-report";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const values = req.body as unknown as any;
	// ... check validation
	if (!values.script) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// short-form report generation
	const report = await generateReport(values);

	res.status(200).send(report);
}
