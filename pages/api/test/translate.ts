import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "../../../lib/open-ai/openai";
import GoogleTranslate from "@google-cloud/translate";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const values = req.body as unknown as any;
	// ... check validation
	if (!values) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	// ChatGPT
	// const result = await openai.createCompletion({
	// 	model: "text-davinci-003",
	// 	prompt: `Translate this into Korean in a JSON format:\n\n${JSON.stringify(
	// 		values.script,
	// 	)}\n\n
	// 	Do not use any special characters or symbols.
	// 	Example: {
	// 		"introduction": {translation's introduction},
	// 		"body": {translation's body},
	// 		"conclusion": {translation's conclusion},
	// 		"cited_web_source": {translation's cited web source}
	// 	}`,
	// 	temperature: 0.3,
	// 	max_tokens: 3000,
	// 	top_p: 1.0,
	// 	frequency_penalty: 0.0,
	// 	presence_penalty: 0.0,
	// });
	// const output = result.data.choices[0].text;

	// Google
	const { Translate } = GoogleTranslate.v2;
	const translate = new Translate({
		projectId: "clippr-378608",
	});

	let [introduction] = await translate.translate(
		JSON.stringify(values.introduction),
		"ko",
	);
	let [body] = await translate.translate(JSON.stringify(values.body), "ko");
	let [conclusion] = await translate.translate(
		JSON.stringify(values.conclusion),
		"ko",
	);
	let [cited_web_source] = await translate.translate(
		JSON.stringify(values.cited_web_source),
		"ko",
	);

	res.status(200).send(
		JSON.parse(
			JSON.stringify({
				introduction: introduction,
				body: body,
				conclusion: conclusion,
				cited_web_source: JSON.parse(cited_web_source),
			}),
		),
	);
}

// const values = {
// 	introduction:
// 		"This report is about the effects of globalization on the International Monetary Fund (IMF) and how it has transformed the global economy over the past few decades. It will analyze the impact of globalization on the IMF and its role in promoting economic integration and development. It will also discuss the implications of globalization for the global economy and how the IMF can help to mitigate the risks associated with it.",
// 	body: "The IMF has been at the forefront of promoting economic integration and development through its various programs. These programs have enabled countries to open their economies to global markets, increasing trade and investment flows, and allowing for more efficient capital allocation. This has led to increased economic growth, improved living standards, and greater economic stability. However, globalization has also brought with it increased economic volatility and risk. The IMF has sought to address these issues through its various programs and policies, such as its Structural Adjustment Facility and its Financial Stability Facility. These programs have allowed for greater economic integration and have helped to mitigate the risks associated with globalization.",
// 	conclusion:
// 		"Globalization has had a profound impact on the IMF and the global economy. The IMF has played an important role in promoting economic integration and development, and in mitigating the risks associated with globalization. However, it is important to recognize the potential risks and challenges that come with globalization and to ensure that the IMF is able to continue to promote economic stability and development in the global economy.",
// 	cited_web_source: [
// 		{
// 			title: "The Role of the IMF in Globalization",
// 			url: "https://www.imf.org/external/pubs/ft/fandd/2007/09/basics.htm",
// 		},
// 		{
// 			title: "IMF Structural Adjustment Facility",
// 			url: "https://www.imf.org/external/np/exr/facts/saf.htm",
// 		},
// 		{
// 			title: "IMF Financial Stability Facility",
// 			url: "https://www.imf.org/external/np/exr/facts/fsf.htm",
// 		},
// 	],
// };
