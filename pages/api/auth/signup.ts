import { NextApiRequest, NextApiResponse } from "next";
import { hashPassword } from "../../../lib/auth";
import { collection, getDocs, addDoc } from "firebase/firestore/lite";
import { db } from "../../../lib/firebase";
import { IForm } from "../../../components/auth/auth-form";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return;
	}

	const { email, password } = req.body as IForm;
	// ... check validation
	if (!email || !password) {
		res.status(422).json({ message: "Invalid input." });
		return;
	}

	const usersCol = collection(db, "users");
	// ... check if user exists already ...
	const existingUser = await getDocs(usersCol).then((snapshot) => {
		return snapshot.docs.find((doc) => doc.data().email === email);
	});
	if (existingUser) {
		res.status(422).json({ message: "해당 이메일의 가입정보가 존재합니다." });
		return;
	}
	// ... password hashing ...
	const hashedPassword = await hashPassword(password);
	// ... create user ...
	const userRef = await addDoc(usersCol, {
		email,
		password: hashedPassword,
	});

	res.status(201).json({ message: "회원가입이 완료되었습니다." });
}
