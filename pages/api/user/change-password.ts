import { collection, getDocs, updateDoc, doc } from "firebase/firestore/lite";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { db } from "../../../lib/firebase";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "PATCH") {
		return;
	}

	const session = await getSession({ req });

	if (!session) {
		res.status(401).json({ message: "접근 권한이 없습니다." });
		return;
	}

	const userEmail = session.user?.email;
	const { oldPassword, newPassword } = req.body;

	// ... user validation ...
	const usersCol = collection(db, "users");
	// ... check if user exists already ...
	const user = await getDocs(usersCol).then((snapshot) => {
		return snapshot.docs.find((doc) => doc.data().email === userEmail);
	});

	if (!user) {
		res.status(404).json({ message: "유저 정보를 찾을 수 없습니다." });
		return;
	}

	// ... password validation ...
	const currentPassword = user.data().password;
	const passwordAreEqual = await verifyPassword(oldPassword, currentPassword);

	if (!passwordAreEqual) {
		res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
		return;
	}

	// ... update password ...
	const hashedPassword = await hashPassword(newPassword);
	const userRef = await updateDoc(doc(db, "users", user.id), {
		password: hashedPassword,
	});

	res.status(200).json({ message: "비밀번호가 변경되었습니다." });
}
