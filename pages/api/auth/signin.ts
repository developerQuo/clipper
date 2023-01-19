import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return;
	}

	const { username, password } = req.body;
	// ... check validation
	if (!username || !password) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}
	// ... check password ...
	// ... set cookie ...
	res.status(200);
}
