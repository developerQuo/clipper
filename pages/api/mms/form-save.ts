import { NextApiRequest, NextApiResponse } from "next";
import { IForm } from "../../../components/ui/survey/Form";
import appendValues from "../../../lib/google-sheet/append-values";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		const database_id = process.env.NOTION_DATABASE_ID_CONTACT;
		if (req.method === "POST" && database_id) {
			const data = req.body;

			const values = data as unknown as IForm;

			appendValues(Object.values(values));

			res.status(201).json({ ok: true, message: "Success" });
		}
	} catch (error) {
		res.status(400).json({ ok: false, message: "Fail" });
	}
}

// ref: https://ggondae.tistory.com/114
