import { NextApiRequest, NextApiResponse } from "next";
import generateReport from "../../../lib/open-ai/generate-report";
import SelectURLs from "../../../lib/open-ai/select-urls";
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
	try {
		// get RSS feeds
		const rssFeeds = await getRSS();
		// res.status(200).send(rssFeeds);

		const urls = await SelectURLs(rssFeeds);
		res.status(200).send(urls);

		// report generation
		// const report = await generateReport({ script, urls });
		// res.status(200).send(report);
	} catch (e) {
		console.log(e);
	}
}
