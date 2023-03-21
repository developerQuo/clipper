import { NextApiRequest, NextApiResponse } from "next";
import generateReport from "../../../lib/open-ai/generate-report";
import summarizePDF from "../../../lib/open-ai/summarize-pdf";
import getRSS from "../../../lib/rss/getRSS";
import { ReportInput } from "../../../store/report";
import RSSParser from "rss-parser";
import axios from "axios";
import fs from "fs";
import pdfParse from "pdf-parse";
import Parser from "rss-parser";

const rssParser = new RSSParser();
const rssFeedUrl = "https://dream.kotra.or.kr/kotra/rssReportsList.do"; // Replace with the URL of the RSS feed you want to parse

async function downloadPdf(url: string, outputPath: string) {
	const response = await axios({
		method: "get",
		url,
		responseType: "stream",
	});

	return new Promise((resolve, reject) => {
		const fileStream = fs.createWriteStream(outputPath);
		response.data.pipe(fileStream);
		fileStream.on("finish", resolve);
		fileStream.on("error", reject);
	});
}

function extractTextFromPdf(pdfPath: string) {
	return new Promise(async (resolve, reject) => {
		try {
			const dataBuffer = fs.readFileSync(pdfPath);
			const data = await pdfParse(dataBuffer);

			resolve(data.text);
		} catch (error) {
			reject(error);
		}
	});
}

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
		// const feed = await rssParser.parseURL(rssFeedUrl);
		// console.log(feed);
		// for (const item of feed.items) {
		// 	// Assuming the PDF URL is in the 'link' attribute of the RSS item.
		// 	// Modify the code accordingly if the PDF URL is stored in a different attribute.
		// 	const pdfUrl = item.link;

		// 	// Create a suitable file name for the PDF file based on the item's title.
		// 	const pdfFileName = `${item.title
		// 		?.replace(/[^a-z0-9]/gi, "_")
		// 		.toLowerCase()}.pdf`;

		// 	console.log(`Downloading PDF from ${pdfUrl} to ${pdfFileName}`);
		// 	const result = await downloadPdf(pdfUrl!, pdfFileName);
		// 	res.status(200).send(result);

		// 	// report generation
		// 	// const report = await generateReport({ script, urls });
		// 	// res.status(200).send(report);
		// }

		// const report = (await extractTextFromPdf(
		// 	"public/docs/우크라이나.pdf",
		// )) as string;
		// const summary = await summarizePDF({ report });
		// res.status(200).send(summary);

		const summary = await summarizePDF({
			report:
				"https://www.oecd-ilibrary.org/docserver/5c561274-en.pdf?expires=1679222411&id=id&accname=guest&checksum=71F72A4E44FE79C21083AFA9CA20A65C",
		});
		res.status(200).send(summary);
	} catch (e) {
		console.log(e);
	}
}
