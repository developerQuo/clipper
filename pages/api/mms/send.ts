import { NextApiRequest, NextApiResponse } from "next";
import { IForm } from "../../../components/ui/MMS";
import { sendMMS } from "../../../lib/MMS";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse, 

) {
	try {
		if (req.method === "POST") {
			const data = req.body;

			const { csvData, message } =
				data as unknown as IForm;

				console.log(csvData)
				console.log(message)
			// mms 발송
			const {ok, data: failedData} = sendMMS({csvData, message});
			if (!ok) {
				throw new Error(`${failedData?.name}님에게 전송 실패(${failedData?.phone})`);
			}

			res.status(201).json({ ok: true, message: "Success" });
		}
	} catch (error) {
		res.status(400).json({ ok: false, message: (error as any).message });
	}
}
