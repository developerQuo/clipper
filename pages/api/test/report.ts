import { NextApiRequest, NextApiResponse } from "next";
import generateReport from "../../../lib/open-ai/generate-report";
import { ReportInput } from "../../../store/report";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const { script } = req.body as unknown as ReportInput;
	// ... check validation
	if (!script) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// report generation
	const report = await generateReport({ script });

	res.status(200).send(report);
}
