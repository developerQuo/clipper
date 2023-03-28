import { NextApiRequest, NextApiResponse } from "next";
import getRSS from "../../../lib/rss/getRSS";
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

	// get RSS feeds
	const rssFeeds = await getRSS();



	res.status(200).send({});
}
